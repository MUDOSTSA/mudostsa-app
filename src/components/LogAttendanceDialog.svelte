<script lang="ts">
  import Dialog from "./Dialog.svelte";
  import { logAttendanceSchema } from "$lib/zod/attendance_forms";
  import { createRow, readMember } from "$lib/supabase";
  import { currentUser } from "$lib/stores/user";
  import type { Member } from "$lib/types";
  import Throbber from "./Throbber.svelte";

  let {
    shown = $bindable(false),
    attendanceSheetId,
    onSuccess,
  }: {
    shown: boolean;
    attendanceSheetId?: number;
    onSuccess?: () => void;
  } = $props();

  // Toggle between member and non-member modes
  let attendeeType: "member" | "non-member" = $state("member");

  // Form data for members
  let memberFormData = $state({
    id: "",
  });

  // Form data for non-members
  let nonMemberFormData = $state({
    name: "",
    program: "",
    year: 1,
    student_number: "",
  });

  let errors = $state<Record<string, string>>({});
  let isSubmitting = $state(false);

  // Member preview state
  let memberPreview: Member | null = $state(null);
  let isLoadingMember = $state(false);
  let memberNotFound = $state(false);

  async function fetchMemberDetails() {
    if (!memberFormData.id.trim()) {
      memberPreview = null;
      memberNotFound = false;
      return;
    }

    isLoadingMember = true;
    memberNotFound = false;
    errors.id = "";

    try {
      const result = await readMember(memberFormData.id.trim());

      if (result.data) {
        memberPreview = result.data;
        memberNotFound = false;
      } else {
        memberPreview = null;
        memberNotFound = true;
      }
    } catch (error) {
      console.error("Error fetching member:", error);
      memberPreview = null;
      memberNotFound = true;
    } finally {
      isLoadingMember = false;
    }
  }

  // Debounced member ID lookup
  let memberIdTimeout: ReturnType<typeof setTimeout> | undefined;
  function onMemberIdChange() {
    clearTimeout(memberIdTimeout);
    memberIdTimeout = setTimeout(fetchMemberDetails, 500);
  }

  function resetForm() {
    memberFormData = { id: "" };
    nonMemberFormData = { name: "", program: "", year: 1, student_number: "" };
    errors = {};
    isSubmitting = false;
    memberPreview = null;
    isLoadingMember = false;
    memberNotFound = false;
    clearTimeout(memberIdTimeout);
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();

    if (!$currentUser.isAuthenticated || !$currentUser.auth) {
      errors.form = "You must be logged in to log attendance";
      return;
    }

    if (!attendanceSheetId) {
      errors.form = "No attendance sheet selected";
      return;
    }

    isSubmitting = true;
    errors = {};

    try {
      // For member mode, wait for ongoing fetch to complete
      if (attendeeType === "member" && isLoadingMember) {
        // Wait for the current fetch to complete
        await new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (!isLoadingMember) {
              clearInterval(checkInterval);
              resolve(true);
            }
          }, 100);
        });
      }

      // For member mode, validate that member exists
      if (attendeeType === "member" && memberNotFound) {
        errors.id = "Member not found. Please check the member ID";
        return;
      }

      // Prepare data based on attendee type
      const formData = {
        type: attendeeType,
        data: attendeeType === "member" ? memberFormData : nonMemberFormData,
      };

      // Validate form data with Zod
      const validatedData = logAttendanceSchema.parse(formData);

      let attendanceRecord;
      let tableName;

      if (validatedData.type === "member") {
        // Create member attendance record
        attendanceRecord = {
          member: validatedData.data.id,
          attendance_sheet: attendanceSheetId,
        };
        tableName = "attendance_record";
      } else {
        // Create non-member attendance record
        attendanceRecord = {
          name: validatedData.data.name,
          program: validatedData.data.program,
          year: validatedData.data.year,
          student_number: validatedData.data.student_number,
          attendance_sheet: attendanceSheetId,
        };
        tableName = "non_member_attendance_record";
      }

      // Insert into database
      const result = await createRow(tableName, attendanceRecord);

      if (result.error) {
        errors.form = result.error.message || "Failed to log attendance";
        return;
      }

      // Success - close dialog and notify parent
      shown = false;
      resetForm();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        // Handle Zod validation errors
        if (error.name === "ZodError") {
          const zodError = error as any;
          zodError.errors?.forEach((err: any) => {
            if (err.path?.length > 0) {
              const pathKey = err.path.join(".");
              // Handle nested path for discriminated union
              if (pathKey.startsWith("data.")) {
                errors[pathKey.replace("data.", "")] = err.message;
              } else {
                errors[pathKey] = err.message;
              }
            }
          });
        } else {
          errors.form = error.message;
        }
      } else {
        errors.form = "An unexpected error occurred";
      }
    } finally {
      isSubmitting = false;
    }
  }

  // Reset form when dialog closes
  $effect(() => {
    if (!shown) {
      resetForm();
    }
  });
</script>

<Dialog bind:shown title={"Log Attendance"}>
  <form
    class="flex px-4 py-4 flex-col w-full text-white gap-2"
    onsubmit={handleSubmit}
  >
    {#if errors.form}
      <div
        class="bg-red-900/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm"
      >
        {errors.form}
      </div>
    {/if}

    <!-- Attendee Type Toggle -->
    <div class="flex ml-[2px] flex-col gap-1">
      <span class="text-sm">Attendee Type</span>
      <div class="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
        <button
          type="button"
          onclick={() => (attendeeType = "member")}
          class="flex-1 py-2 px-3 text-sm rounded-md transition-colors {attendeeType ===
          'member'
            ? 'bg-blue-600 text-white'
            : 'text-white/70 hover:text-white hover:bg-slate-700'}"
          disabled={isSubmitting}
        >
          Member
        </button>
        <button
          type="button"
          onclick={() => (attendeeType = "non-member")}
          class="flex-1 py-2 px-3 text-sm rounded-md transition-colors {attendeeType ===
          'non-member'
            ? 'bg-blue-600 text-white'
            : 'text-white/70 hover:text-white hover:bg-slate-700'}"
          disabled={isSubmitting}
        >
          Non-Member
        </button>
      </div>
    </div>

    {#if attendeeType === "member"}
      <!-- Member Form -->
      <label for="member-id" class="flex ml-[2px] flex-col gap-1">
        <span class="text-sm">Member ID</span>
        <input
          class="bg-slate-800 p-2 -ml-[2px] rounded-lg border border-slate-700 {errors.id
            ? 'border-red-500'
            : ''}"
          placeholder="Enter member ID"
          type="text"
          id="member-id"
          name="member-id"
          bind:value={memberFormData.id}
          oninput={onMemberIdChange}
          disabled={isSubmitting}
          required
        />
        {#if errors.id}
          <span class="text-red-400 text-xs">{errors.id}</span>
        {/if}
      </label>

      <!-- Member Preview -->
      {#if isLoadingMember}
        <div class="bg-slate-900/50 border border-slate-600 rounded-lg p-3">
          <div class="flex items-center gap-2 text-white/60">
            <Throbber></Throbber>
            <span class="text-sm">Loading member details...</span>
          </div>
        </div>
      {:else if memberNotFound && memberFormData.id.trim()}
        <div class="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
          <div class="flex items-center gap-2 text-red-400">
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span class="text-sm">Member not found</span>
          </div>
        </div>
      {:else if memberPreview}
        <div class="bg-green-900/20 border border-green-500/50 rounded-lg p-3">
          <div class="flex items-center gap-2 mb-2 text-green-400">
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            <span class="text-sm font-medium">Member Found</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span class="text-white/60">Name:</span>
              <span class="text-white ml-1">{memberPreview.name}</span>
            </div>
            <div>
              <span class="text-white/60">Role:</span>
              <span class="text-white ml-1">{memberPreview.role}</span>
            </div>
            <div>
              <span class="text-white/60">Program:</span>
              <span class="text-white ml-1">{memberPreview.program}</span>
            </div>
            <div>
              <span class="text-white/60">Year:</span>
              <span class="text-white ml-1">{memberPreview.year}</span>
            </div>
            <div class="col-span-2">
              <span class="text-white/60">Committee:</span>
              <span class="text-white ml-1"
                >{memberPreview.committee ?? "Unspecified"}</span
              >
            </div>
          </div>
        </div>
      {/if}
    {:else}
      <!-- Non-Member Form -->
      <label for="non-member-name" class="flex ml-[2px] flex-col gap-1">
        <span class="text-sm">Full Name</span>
        <input
          class="bg-slate-800 p-2 -ml-[2px] rounded-lg border border-slate-700 {errors.name
            ? 'border-red-500'
            : ''}"
          placeholder="Enter full name"
          type="text"
          id="non-member-name"
          name="non-member-name"
          bind:value={nonMemberFormData.name}
          disabled={isSubmitting}
          required
        />
        {#if errors.name}
          <span class="text-red-400 text-xs">{errors.name}</span>
        {/if}
      </label>

      <label for="non-member-program" class="flex ml-[2px] flex-col gap-1">
        <span class="text-sm">Program</span>
        <input
          class="bg-slate-800 p-2 -ml-[2px] rounded-lg border border-slate-700 {errors.program
            ? 'border-red-500'
            : ''}"
          placeholder="e.g., Computer Science, Engineering"
          type="text"
          id="non-member-program"
          name="non-member-program"
          bind:value={nonMemberFormData.program}
          disabled={isSubmitting}
          required
        />
        {#if errors.program}
          <span class="text-red-400 text-xs">{errors.program}</span>
        {/if}
      </label>

      <div class="flex w-full gap-2">
        <label for="non-member-year" class="flex ml-[2px] flex-col gap-1 w-24">
          <span class="text-sm">Year</span>
          <input
            class="bg-slate-800 p-2 -ml-[2px] rounded-lg border border-slate-700 {errors.year
              ? 'border-red-500'
              : ''}"
            placeholder="1"
            type="number"
            id="non-member-year"
            name="non-member-year"
            bind:value={nonMemberFormData.year}
            disabled={isSubmitting}
            min="1"
            max="10"
            required
          />
          {#if errors.year}
            <span class="text-red-400 text-xs">{errors.year}</span>
          {/if}
        </label>

        <label
          for="non-member-student-number"
          class="flex ml-[2px] flex-col gap-1 flex-1"
        >
          <span class="text-sm">Student Number</span>
          <input
            class="bg-slate-800 p-2 -ml-[2px] rounded-lg border border-slate-700 {errors.student_number
              ? 'border-red-500'
              : ''}"
            placeholder="Enter student number"
            type="text"
            id="non-member-student-number"
            name="non-member-student-number"
            bind:value={nonMemberFormData.student_number}
            disabled={isSubmitting}
            required
          />
          {#if errors.student_number}
            <span class="text-red-400 text-xs">{errors.student_number}</span>
          {/if}
        </label>
      </div>
    {/if}

    <div class="flex justify-center pt-4 gap-2">
      <button
        class="bg-blue-700 hover:bg-blue-600 w-28 py-2 px-4 rounded-lg duration-200 border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Logging..." : "Log"}
      </button>
      <button
        class="bg-slate-800 py-2 px-4 border w-28 border-slate-600 hover:bg-slate-700 rounded-lg duration-200 disabled:opacity-50"
        type="button"
        disabled={isSubmitting}
        onclick={() => (shown = false)}
      >
        Cancel
      </button>
    </div>
  </form>
</Dialog>
