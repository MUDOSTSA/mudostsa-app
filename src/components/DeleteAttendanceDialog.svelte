<script lang="ts">
  import Dialog from "./Dialog.svelte";
  import { deleteRow } from "$lib/supabase";
  import type { AttendanceRecordAdapter } from "$lib/types";
  import MaterialIcon from "./MaterialIcon.svelte";

  let {
    shown = $bindable(false),
    selectedItems = {},
    onSuccess,
  }: {
    shown: boolean;
    selectedItems: { [key: string]: AttendanceRecordAdapter };
    onSuccess?: () => void;
  } = $props();

  let isDeleting = $state(false);
  let error = $state("");

  async function handleDelete() {
    isDeleting = true;
    error = "";

    try {
      const itemIds = Object.keys(selectedItems);
      const promises = [];

      //Check if member first
      for (const id of itemIds) {
        const item = selectedItems[id];
        if (item.is_member) {
          const memberId = id.replace("m-", "");
          promises.push(deleteRow("attendance_record", parseInt(memberId)));
        } else {
          const nonMemberId = id.replace("nm-", "");
          promises.push(
            deleteRow("non_member_attendance_record", parseInt(nonMemberId))
          );
        }
      }

      const results = await Promise.all(promises);

      // Check if any operations failed
      const failedOperations = results.filter((result) => result.error);

      if (failedOperations.length > 0) {
        error = `Failed to delete ${failedOperations.length} record(s)`;
        return;
      }

      // Success - close dialog and notify parent
      shown = false;
      onSuccess?.();
    } catch (err) {
      error = "Failed to delete attendance records";
      console.error("Delete error:", err);
    } finally {
      isDeleting = false;
    }
  }

  function handleClose() {
    if (!isDeleting) {
      error = "";
      shown = false;
    }
  }

  // Reset error when dialog opens
  $effect(() => {
    if (shown) {
      error = "";
    }
  });

  let itemCount = $derived(Object.keys(selectedItems).length);
</script>

<Dialog bind:shown title="Delete Attendance Records" onClose={handleClose}>
  <div class="space-y-4 min-w-96 px-4 py-4">
    <!-- Warning Message -->
    <div
      class="bg-yellow-900/20 border border-yellow-500/50 text-yellow-400 px-4 py-3 rounded-lg"
    >
      <div class="flex items-center gap-2 mb-2">
        <MaterialIcon icon="warning" size={1.2} />
        <span class="font-medium">Confirm Deletion</span>
      </div>
      <p class="text-sm">
        Are you sure you want to delete the selected attendance record{itemCount >
        1
          ? "s"
          : ""}? This action cannot be undone.
      </p>
    </div>

    <!-- Selected Items Display -->
    <div
      class="bg-slate-800/50 border border-slate-700 rounded-lg p-4 max-h-64 overflow-y-auto"
    >
      {#each Object.values(selectedItems) as item}
        <div
          class="flex justify-between items-center py-2 border-b border-slate-600 last:border-b-0"
        >
          <div class="flex-1">
            <div class="text-white font-medium">
              {item.name}
            </div>
            <div class="text-sm text-white/60">
              ID: #{item.id} | Member ID: {item.student_number}
            </div>
            <div class="text-xs text-white/50 mt-1">
              {new Date(item.created_at).toLocaleString()}
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- Error Message -->
    {#if error}
      <div
        class="bg-red-900/20 border border-red-500/50 text-red-400 px-3 py-2 rounded-lg text-sm"
      >
        {error}
      </div>
    {/if}

    <!-- Summary -->
    <div class="text-center text-white/80 text-sm">
      {itemCount} attendance record{itemCount > 1 ? "s" : ""} selected for deletion
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center justify-center gap-3 pt-4">
      <button
        type="button"
        onclick={handleDelete}
        class="bg-red-700 border border-red-500 hover:bg-red-600 disabled:bg-red-800 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        disabled={isDeleting}
      >
        {#if isDeleting}
          Deleting...
        {:else}
          <MaterialIcon icon="delete" size={1.1} />
          Delete
        {/if}
      </button>
      <button
        type="button"
        onclick={handleClose}
        class="bg-slate-800 border border-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        disabled={isDeleting}
      >
        Cancel
      </button>
    </div>
  </div>
</Dialog>
