<script lang="ts">
  import Dialog from "./Dialog.svelte";
  import MaterialIcon from "./MaterialIcon.svelte";
  import { insertTambayanScheduleSchema } from "$lib/zod/tambayan_forms";
  import { createRow, readRows } from "$lib/supabase";
  import { currentUser } from "$lib/stores/user";
  import type { BasicAttendanceSheet } from "$lib/types";

  let {
    shown = $bindable(false),
    onSuccess,
  }: {
    shown: boolean;
    onSuccess?: () => void;
  } = $props();

  let formData = $state({
    room: "",
    campus: "",
    time_start: "",
    time_end: "",
    attendance_sheet: null as number | null,
  });

  let attendanceSheets: BasicAttendanceSheet[] = $state([]);
  let loadingSheets = $state(false);
  let errors = $state<Record<string, string>>({});
  let isSubmitting = $state(false);

  async function loadAttendanceSheets() {
    loadingSheets = true;
    try {
      const result = await readRows("attendance_sheets", {});
      attendanceSheets = result.data || [];
    } catch (err) {
      console.error("Failed to load attendance sheets:", err);
      attendanceSheets = [];
    } finally {
      loadingSheets = false;
    }
  }

  function resetForm() {
    formData = {
      room: "",
      campus: "",
      time_start: "",
      time_end: "",
      attendance_sheet: null,
    };
    errors = {};
    isSubmitting = false;
  }
  async function handleSubmit(event: Event) {
    event.preventDefault();

    if (!$currentUser.isAuthenticated || !$currentUser.auth) {
      errors.form = "You must be logged in to add schedule entries";
      return;
    }

    isSubmitting = true;
    errors = {};

    try {
      // Validate form data with Zod
      const validatedData = insertTambayanScheduleSchema.parse(formData);

      // Convert datetime-local strings to Date objects
      const scheduleItem = {
        ...validatedData,
        time_start: new Date(validatedData.time_start),
        time_end: new Date(validatedData.time_end),
        attendance_sheet: formData.attendance_sheet,
      };

      // Insert into database
      const result = await createRow("tambayan", scheduleItem);

      if (result.error) {
        errors.form = result.error.message || "Failed to add schedule entry";
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
              errors[err.path[0]] = err.message;
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

  // Reset form when dialog closes or opens
  $effect(() => {
    if (shown) {
      loadAttendanceSheets();
    } else {
      resetForm();
    }
  });
</script>

<Dialog bind:shown title={"Add Schedule Entry"}>
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

    <label for="room" class="flex ml-[2px] flex-col gap-1">
      <span class="text-sm">Room</span>
      <input
        class="bg-slate-800 p-2 -ml-[2px] rounded-lg border border-slate-700 {errors.room
          ? 'border-red-500'
          : ''}"
        placeholder="Room name or number"
        type="text"
        id="room"
        name="room"
        bind:value={formData.room}
        disabled={isSubmitting}
        required
      />
      {#if errors.room}
        <span class="text-red-400 text-xs">{errors.room}</span>
      {/if}
    </label>

    <label for="campus" class="flex ml-[2px] flex-col gap-1">
      <span class="text-sm">Campus</span>
      <select
        id="campus"
        name="campus"
        bind:value={formData.campus}
        class="bg-slate-800 p-2 -ml-[2px] rounded-lg border border-slate-700 {errors.campus
          ? 'border-red-500'
          : ''}"
        disabled={isSubmitting}
        required
      >
        <option value="" disabled selected>Select campus</option>
        <option value="Intramuros">Intramuros</option>
        <option value="Makati">Makati</option>
      </select>
      {#if errors.campus}
        <span class="text-red-400 text-xs">{errors.campus}</span>
      {/if}
    </label>

    <label for="time_start" class="flex ml-[2px] flex-col gap-1">
      <span class="text-sm">Start Time</span>
      <input
        placeholder="Start time"
        class="bg-slate-800 p-2 -ml-[2px] rounded-lg border border-slate-700 {errors.time_start
          ? 'border-red-500'
          : ''}"
        type="datetime-local"
        id="time_start"
        name="time_start"
        bind:value={formData.time_start}
        disabled={isSubmitting}
        required
      />
      {#if errors.time_start}
        <span class="text-red-400 text-xs">{errors.time_start}</span>
      {/if}
    </label>

    <label for="time_end" class="flex ml-[2px] flex-col gap-1">
      <span class="text-sm">End Time</span>
      <input
        placeholder="End time"
        class="bg-slate-800 p-2 -ml-[2px] rounded-lg border border-slate-700 {errors.time_end
          ? 'border-red-500'
          : ''}"
        type="datetime-local"
        id="time_end"
        name="time_end"
        bind:value={formData.time_end}
        disabled={isSubmitting}
        required
      />
      {#if errors.time_end}
        <span class="text-red-400 text-xs">{errors.time_end}</span>
      {/if}
    </label>

    <label for="attendance_sheet" class="flex ml-[2px] flex-col gap-1">
      <span class="text-sm">Attendance Sheet (Optional)</span>
      {#if loadingSheets}
        <div class="flex items-center gap-2 text-white/60 text-sm">
          <MaterialIcon icon="hourglass_empty" size={1.2} />
          <span>Loading sheets...</span>
        </div>
      {:else}
        <select
          id="attendance_sheet"
          bind:value={formData.attendance_sheet}
          class="bg-slate-800 p-2 -ml-[2px] rounded-lg border border-slate-700"
          disabled={isSubmitting}
        >
          <option value={null}>No attendance sheet</option>
          {#each attendanceSheets as sheet}
            <option value={sheet.id}>{sheet.name} (ID: {sheet.id})</option>
          {/each}
        </select>
      {/if}
      <span class="text-xs text-white/50"
        >Link an existing attendance sheet to this schedule</span
      >
    </label>

    <div class="flex justify-center pt-4 gap-2">
      <button
        class="bg-blue-700 hover:bg-blue-600 w-28 py-2 px-4 rounded-lg duration-200 border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Adding..." : "Add Entry"}
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
