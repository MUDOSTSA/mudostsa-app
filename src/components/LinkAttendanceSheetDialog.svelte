<script lang="ts">
  import Dialog from "./Dialog.svelte";
  import MaterialIcon from "./MaterialIcon.svelte";
  import { updateRow, readRows, createRow } from "$lib/supabase";
  import { currentUser } from "$lib/stores/user";
  import type { RoomTambayanSchedule, BasicAttendanceSheet } from "$lib/types";
  import { onMount } from "svelte";

  let {
    shown = $bindable(false),
    schedule = null,
    onSuccess,
  }: {
    shown: boolean;
    schedule: RoomTambayanSchedule | null;
    onSuccess?: () => void;
  } = $props();

  let attendanceSheets: BasicAttendanceSheet[] = $state([]);
  let loadingSheets = $state(false);
  let isSubmitting = $state(false);
  let error = $state<string | null>(null);
  let selectedSheetId = $state<number | null>(null);
  let showCreateNew = $state(false);

  // Form data for creating new sheet
  let newSheetData = $state({
    name: "",
    code: "",
  });

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

  function generateRandomCode() {
    // Generate RT[4-digit number] format for Room Tambayan
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `RT${randomNum}`;
  }

  function handleRandomizeCode() {
    newSheetData.code = generateRandomCode();
  }

  async function handleLinkExisting() {
    if (!schedule?.id || selectedSheetId === null) {
      error = "Please select an attendance sheet to link";
      return;
    }

    if (!$currentUser.isAuthenticated || !$currentUser.auth) {
      error = "You must be logged in to link attendance sheets";
      return;
    }

    isSubmitting = true;
    error = null;

    try {
      const result = await updateRow("tambayan", schedule.id, {
        attendance_sheet: selectedSheetId,
      });

      if (result.error) {
        error = result.error.message || "Failed to link attendance sheet";
        return;
      }

      // Success
      shown = false;
      resetForm();
      onSuccess?.();
    } catch (err: any) {
      error = err.message || "An unexpected error occurred";
    } finally {
      isSubmitting = false;
    }
  }

  async function handleCreateAndLink() {
    if (!schedule?.id) {
      error = "No schedule selected";
      return;
    }

    if (!newSheetData.name.trim()) {
      error = "Please enter a name for the new attendance sheet";
      return;
    }

    if (!newSheetData.code.trim()) {
      error = "Please enter an access code for the new attendance sheet";
      return;
    }

    if (!$currentUser.isAuthenticated || !$currentUser.auth) {
      error = "You must be logged in to create attendance sheets";
      return;
    }

    isSubmitting = true;
    error = null;

    try {
      // Create the new attendance sheet
      const createResult = await createRow("attendance_sheets", {
        name: newSheetData.name.trim(),
        code: newSheetData.code.trim(),
        locked: false,
        private: false,
        for_event: null,
      });

      if (createResult.error || !createResult.data) {
        error =
          createResult.error?.message || "Failed to create attendance sheet";
        return;
      }

      const newSheetId = createResult.data[0]?.id;

      // Link the new sheet to the schedule
      const linkResult = await updateRow("tambayan", schedule.id, {
        attendance_sheet: newSheetId,
      });

      if (linkResult.error) {
        error = linkResult.error.message || "Failed to link attendance sheet";
        return;
      }

      // Success
      shown = false;
      resetForm();
      onSuccess?.();
    } catch (err: any) {
      error = err.message || "An unexpected error occurred";
    } finally {
      isSubmitting = false;
    }
  }

  async function handleUnlink() {
    if (!schedule?.id) {
      error = "No schedule selected";
      return;
    }

    if (!$currentUser.isAuthenticated || !$currentUser.auth) {
      error = "You must be logged in to unlink attendance sheets";
      return;
    }

    isSubmitting = true;
    error = null;

    try {
      const result = await updateRow("tambayan", schedule.id, {
        attendance_sheet: null,
      });

      if (result.error) {
        error = result.error.message || "Failed to unlink attendance sheet";
        return;
      }

      // Success
      shown = false;
      resetForm();
      onSuccess?.();
    } catch (err: any) {
      error = err.message || "An unexpected error occurred";
    } finally {
      isSubmitting = false;
    }
  }

  function resetForm() {
    selectedSheetId = null;
    showCreateNew = false;
    newSheetData = {
      name: "",
      code: "",
    };
    error = null;
    isSubmitting = false;
  }

  // Load sheets when dialog opens
  $effect(() => {
    if (shown && schedule) {
      loadAttendanceSheets();
      selectedSheetId = schedule.attendance_sheet?.id || null;

      // Pre-fill new sheet name with schedule info
      if (!schedule.attendance_sheet) {
        const date = new Date(schedule.time_start);
        newSheetData.name = `RT-${schedule.room} ${date.toLocaleDateString()}`;
        newSheetData.code = generateRandomCode();
      }
    } else if (!shown) {
      resetForm();
    }
  });
</script>

<Dialog bind:shown title="Manage Attendance Sheet">
  {#if schedule}
    <div class="px-4 py-4 w-full space-y-4 text-white">
      {#if error}
        <div
          class="bg-red-900/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm"
        >
          {error}
        </div>
      {/if}

      <!-- Schedule Info -->
      <div class="bg-slate-900/50 border border-slate-600 rounded-lg p-3">
        <div class="text-sm text-white/60">
          <p>
            Schedule: <span class="text-white font-semibold"
              >{schedule.room} - {schedule.campus}</span
            >
          </p>
          <p>
            Time: <span class="text-white"
              >{new Date(schedule.time_start).toLocaleString()}</span
            >
          </p>
        </div>
      </div>

      <!-- Current Link Status -->
      {#if schedule.attendance_sheet}
        <div class="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3">
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1">
              <p class="text-sm text-blue-200 font-semibold mb-1">
                Currently Linked
              </p>
              <p class="text-white">{schedule.attendance_sheet.name}</p>
              <p class="text-white/50 text-xs mt-1">
                ID: {schedule.attendance_sheet.id}
              </p>
            </div>
            <button
              onclick={handleUnlink}
              disabled={isSubmitting}
              class="flex items-center gap-1 px-3 py-1 bg-red-700 hover:bg-red-600 border border-red-500 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MaterialIcon icon="link_off" size={1} />
              Unlink
            </button>
          </div>
        </div>
      {:else}
        <!-- Tab Selection -->
        <div class="flex gap-2 border-b border-slate-700 pb-2">
          <button
            onclick={() => (showCreateNew = false)}
            class="px-4 py-2 text-sm rounded-t-lg transition-colors {!showCreateNew
              ? 'bg-blue-700 border-blue-500 border-b-2 text-white'
              : 'text-white/60 hover:text-white'}"
          >
            Link Existing
          </button>
          <button
            onclick={() => (showCreateNew = true)}
            class="px-4 py-2 text-sm rounded-t-lg transition-colors {showCreateNew
              ? 'bg-blue-700 border-blue-500 border-b-2 text-white'
              : 'text-white/60 hover:text-white'}"
          >
            Create & Link New
          </button>
        </div>

        {#if !showCreateNew}
          <!-- Link Existing Sheet -->
          <div class="space-y-3">
            <label class="block">
              <span class="text-sm font-medium mb-2 block"
                >Select Attendance Sheet</span
              >
              {#if loadingSheets}
                <div class="flex items-center gap-2 text-white/60">
                  <MaterialIcon icon="hourglass_empty" size={1.2} />
                  <span>Loading sheets...</span>
                </div>
              {:else}
                <select
                  bind:value={selectedSheetId}
                  class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  disabled={isSubmitting}
                >
                  <option value={null}>-- Select a sheet --</option>
                  {#each attendanceSheets as sheet}
                    <option value={sheet.id}
                      >{sheet.name} (ID: {sheet.id})</option
                    >
                  {/each}
                </select>
              {/if}
            </label>

            {#if attendanceSheets.length === 0 && !loadingSheets}
              <p class="text-white/50 text-sm">
                No attendance sheets available. Create one using the "Create &
                Link New" tab.
              </p>
            {/if}
          </div>
        {:else}
          <!-- Create New Sheet -->
          <div class="space-y-3">
            <label class="block">
              <span class="text-sm font-medium mb-2 block">Sheet Name *</span>
              <input
                type="text"
                bind:value={newSheetData.name}
                placeholder="Enter sheet name"
                class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                disabled={isSubmitting}
              />
              <p class="text-slate-400 text-xs mt-1">
                RT- prefix recommended for Room Tambayan sheets
              </p>
            </label>

            <label class="block">
              <span class="text-sm font-medium mb-2 block">Access Code *</span>
              <div class="flex gap-2">
                <input
                  type="text"
                  bind:value={newSheetData.code}
                  placeholder="Enter access code"
                  class="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onclick={handleRandomizeCode}
                  class="bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                  title="Generate random code"
                  disabled={isSubmitting}
                >
                  🎲 Random
                </button>
              </div>
              <p class="text-slate-400 text-xs mt-1">
                RT#### format will be used for Room Tambayan
              </p>
            </label>
          </div>
        {/if}
      {/if}

      <!-- Action Buttons -->
      <div class="flex justify-center gap-2 pt-4">
        {#if !schedule.attendance_sheet}
          {#if !showCreateNew}
            <button
              onclick={handleLinkExisting}
              disabled={isSubmitting || selectedSheetId === null}
              class="bg-blue-700 hover:bg-blue-600 w-32 py-2 px-4 rounded-lg duration-200 border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isSubmitting ? "Linking..." : "Link Sheet"}
            </button>
          {:else}
            <button
              onclick={handleCreateAndLink}
              disabled={isSubmitting}
              class="bg-blue-700 hover:bg-blue-600 w-40 py-2 px-4 rounded-lg duration-200 border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isSubmitting ? "Creating..." : "Create & Link"}
            </button>
          {/if}
        {/if}
        <button
          onclick={() => (shown = false)}
          disabled={isSubmitting}
          class="bg-slate-800 py-2 px-4 border w-28 border-slate-600 hover:bg-slate-700 rounded-lg duration-200 disabled:opacity-50 whitespace-nowrap"
        >
          Cancel
        </button>
      </div>
    </div>
  {:else}
    <div class="text-center py-8 text-white/60">No schedule selected</div>
  {/if}
</Dialog>
