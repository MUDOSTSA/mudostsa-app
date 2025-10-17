<script lang="ts">
  import Dialog from "./Dialog.svelte";
  import MaterialIcon from "./MaterialIcon.svelte";
  import { insertTambayanScheduleSchema } from "$lib/zod/tambayan_forms";
  import { updateRow, readRows } from "$lib/supabase";
  import { currentUser } from "$lib/stores/user";
  import type { RoomTambayanSchedule, BasicAttendanceSheet } from "$lib/types";

  let {
    shown = $bindable(false),
    item = $bindable(null),
    onSuccess,
  }: {
    shown: boolean;
    item: RoomTambayanSchedule | null;
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

  function formatDateTimeLocal(date: Date): string {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }

  function resetForm() {
    if (item) {
      formData = {
        room: item.room,
        campus: item.campus,
        time_start: formatDateTimeLocal(new Date(item.time_start)),
        time_end: formatDateTimeLocal(new Date(item.time_end)),
        attendance_sheet: item.attendance_sheet?.id || null,
      };
    } else {
      formData = {
        room: "",
        campus: "",
        time_start: "",
        time_end: "",
        attendance_sheet: null,
      };
    }
    errors = {};
    isSubmitting = false;
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();

    if (!$currentUser.isAuthenticated || !$currentUser.auth) {
      errors.form = "You must be logged in to edit schedule entries";
      return;
    }

    if (!item) {
      errors.form = "No schedule entry selected for editing";
      return;
    }

    isSubmitting = true;
    errors = {};

    try {
      // Validate form data with Zod
      const validatedData = insertTambayanScheduleSchema.parse(formData);

      // Convert datetime-local strings to Date objects
      const updateData = {
        ...validatedData,
        time_start: new Date(validatedData.time_start),
        time_end: new Date(validatedData.time_end),
        attendance_sheet: formData.attendance_sheet,
      };

      const result = await updateRow("tambayan", item.id, updateData);

      if (result.error) {
        errors.form = result.error.message || "Failed to update schedule entry";
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

  // Reset form when dialog opens with new item or closes
  $effect(() => {
    if (shown && item) {
      loadAttendanceSheets();
      resetForm();
    } else if (!shown) {
      resetForm();
    }
  });
</script>

<Dialog bind:shown title={"Edit Schedule Entry"}>
  {#if item}
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

      <!-- Item info -->
      <div class="bg-slate-900/50 border border-slate-600 rounded-lg p-3 mb-2">
        <div class="text-sm text-white/60">
          <p>
            Schedule ID: <span class="text-white font-mono">#{item.id}</span>
          </p>
          <p>
            Created: <span class="text-white"
              >{new Date(item.created_at).toLocaleDateString()}</span
            >
          </p>
        </div>
      </div>

      <label for="edit-room" class="flex ml-[2px] flex-col gap-1">
        <span class="text-sm">Room</span>
        <input
          class="bg-slate-800 p-2 -ml-[2px] rounded-lg border border-slate-700 {errors.room
            ? 'border-red-500'
            : ''}"
          placeholder="Room name or number"
          type="text"
          id="edit-room"
          name="room"
          bind:value={formData.room}
          disabled={isSubmitting}
          required
        />
        {#if errors.room}
          <span class="text-red-400 text-xs">{errors.room}</span>
        {/if}
      </label>

      <label for="edit-campus" class="flex ml-[2px] flex-col gap-1">
        <span class="text-sm">Campus</span>
        <select
          id="edit-campus"
          name="campus"
          bind:value={formData.campus}
          class="bg-slate-800 p-2 -ml-[2px] rounded-lg border border-slate-700 {errors.campus
            ? 'border-red-500'
            : ''}"
          disabled={isSubmitting}
          required
        >
          <option value="" disabled>Select campus</option>
          <option value="Intramuros">Intramuros</option>
          <option value="Makati">Makati</option>
        </select>
        {#if errors.campus}
          <span class="text-red-400 text-xs">{errors.campus}</span>
        {/if}
      </label>

      <label for="edit-time-start" class="flex ml-[2px] flex-col gap-1">
        <span class="text-sm">Start Time</span>
        <input
          placeholder="Start time"
          class="bg-slate-800 p-2 -ml-[2px] rounded-lg border border-slate-700 {errors.time_start
            ? 'border-red-500'
            : ''}"
          type="datetime-local"
          id="edit-time-start"
          name="time_start"
          bind:value={formData.time_start}
          disabled={isSubmitting}
          required
        />
        {#if errors.time_start}
          <span class="text-red-400 text-xs">{errors.time_start}</span>
        {/if}
      </label>

      <label for="edit-time-end" class="flex ml-[2px] flex-col gap-1">
        <span class="text-sm">End Time</span>
        <input
          placeholder="End time"
          class="bg-slate-800 p-2 -ml-[2px] rounded-lg border border-slate-700 {errors.time_end
            ? 'border-red-500'
            : ''}"
          type="datetime-local"
          id="edit-time-end"
          name="time_end"
          bind:value={formData.time_end}
          disabled={isSubmitting}
          required
        />
        {#if errors.time_end}
          <span class="text-red-400 text-xs">{errors.time_end}</span>
        {/if}
      </label>

      <label for="edit-attendance-sheet" class="flex ml-[2px] flex-col gap-1">
        <span class="text-sm">Attendance Sheet (Optional)</span>
        {#if loadingSheets}
          <div class="flex items-center gap-2 text-white/60 text-sm">
            <MaterialIcon icon="hourglass_empty" size={1.2} />
            <span>Loading sheets...</span>
          </div>
        {:else}
          <select
            id="edit-attendance-sheet"
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
          class="bg-blue-700 whitespace-nowrap hover:bg-blue-600 w-32 py-2 px-4 rounded-lg duration-200 border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Update Entry"}
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
  {:else}
    <div class="text-center py-8 text-white/60">
      No schedule entry selected for editing
    </div>
  {/if}
</Dialog>
