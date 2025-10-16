<script lang="ts">
  import Dialog from "./Dialog.svelte";
  import { deleteRow } from "$lib/supabase";
  import MaterialIcon from "./MaterialIcon.svelte";

  let {
    shown = $bindable(false),
    sheetName = "",
    sheetId = 0,
    onSuccess,
  }: {
    shown: boolean;
    sheetName: string;
    sheetId: number;
    onSuccess?: () => void;
  } = $props();

  let isDeleting = $state(false);
  let error = $state<string | null>(null);

  async function handleDelete() {
    if (!sheetId) {
      error = "No sheet selected for deletion";
      return;
    }

    isDeleting = true;
    error = null;

    try {
      const { error: deleteError } = await deleteRow(
        "attendance_sheets",
        sheetId
      );

      if (deleteError) {
        error = deleteError.message;
        return;
      }

      // Success
      shown = false;
      onSuccess?.();
    } catch (err: any) {
      error = err.message || "An unexpected error occurred";
    } finally {
      isDeleting = false;
    }
  }

  // Reset error when dialog is closed
  $effect(() => {
    if (!shown) {
      error = null;
      isDeleting = false;
    }
  });
</script>

<Dialog title="Delete Attendance Sheet" bind:shown>
  <div class="text-center">
    <div
      class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4 text-red-500"
    >
      <MaterialIcon icon="warning" size={1.5} />
    </div>

    <p class="text-gray-300 mb-6">
      Are you sure you want to delete the attendance sheet
      <span class="font-semibold text-white">"{sheetName}"</span>?
      <br /><br />
      <span class="text-red-400 font-medium">This action cannot be undone.</span
      >
      All attendance records in this sheet will be permanently deleted.
    </p>

    {#if error}
      <div
        class="bg-red-900 text-red-200 border border-red-700 p-3 rounded-md mb-4"
      >
        {error}
      </div>
    {/if}

    <div class="flex justify-center gap-3 pt-4">
      <button
        type="button"
        onclick={handleDelete}
        class="bg-red-700 border border-red-500 hover:bg-red-600 disabled:bg-red-800 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
        disabled={isDeleting}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
      <button
        type="button"
        onclick={() => (shown = false)}
        class="bg-slate-800 border border-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
        disabled={isDeleting}
      >
        Cancel
      </button>
    </div>
  </div>
</Dialog>
