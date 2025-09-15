<script lang="ts">
  import Dialog from "./Dialog.svelte";
  import { deleteRow, updateRow } from "$lib/supabase";
  import type {
    InventoryItem,
    InventoryItemWithSelectedQuantity,
  } from "$lib/types";
  import MaterialIcon from "./MaterialIcon.svelte";

  let {
    shown = $bindable(false),
    selectedItems = {},
    onSuccess,
  }: {
    shown: boolean;
    selectedItems: { [key: string]: InventoryItemWithSelectedQuantity };
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

      for (const id of itemIds) {
        const item = selectedItems[id];
        const selectedQuantity = item.selectedQuantity || item.quantity;

        if (selectedQuantity < item.quantity) {
          // Update the item with reduced quantity
          const newQuantity = item.quantity - selectedQuantity;
          promises.push(
            updateRow("inventory", parseInt(id), {
              quantity: newQuantity,
              updated_at: new Date().toISOString(),
            })
          );
        } else {
          // Delete the entire item if selected quantity >= total quantity
          promises.push(deleteRow("inventory", parseInt(id)));
        }
      }

      const results = await Promise.all(promises);

      // Check if any operations failed
      const failedOperations = results.filter((result) => result.error);

      if (failedOperations.length > 0) {
        error = `Failed to process ${failedOperations.length} item(s)`;
        return;
      }

      // Success - close dialog and notify parent
      shown = false;
      onSuccess?.();
    } catch (err) {
      error = "Failed to process items";
      console.error("Delete/Update error:", err);
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

<Dialog bind:shown title="Process Items" onClose={handleClose}>
  <div class="space-y-4 min-w-96 px-4 py-4">
    <!-- Warning Message -->
    <div
      class="bg-yellow-900/20 border border-yellow-500/50 text-yellow-400 px-4 py-3 rounded-lg"
    >
      <div class="flex items-center gap-2 mb-2">
        <MaterialIcon icon="warning" size={1.2} />
        <span class="font-medium">Review Action</span>
      </div>
      <p class="text-sm">
        Deleting items is destructive. Consider editing items instead and
        setting the quantity to 0. Only delete items when absolutely necessary.
      </p>
    </div>

    <!-- Confirmation Question -->
    <div class="text-white">
      <p class="font-medium mb-3">
        Confirm the action for the following item{itemCount > 1 ? "s" : ""}:
      </p>
    </div>

    <!-- Selected Items Display -->
    <div
      class="bg-slate-800/50 border border-slate-700 rounded-lg p-4 max-h-64 overflow-y-auto"
    >
      {#each Object.values(selectedItems) as item}
        {@const selectedQuantity = item.selectedQuantity || item.quantity}
        {@const willDelete = selectedQuantity >= item.quantity}
        <div
          class="flex justify-between items-center py-2 border-b border-slate-600 last:border-b-0"
        >
          <div class="flex-1">
            <div class="text-white font-medium">{item.name}</div>
            <div class="text-sm text-white/60">
              ID: #{item.id} • Selected: {selectedQuantity} of {item.quantity} •
              {item.category}
            </div>
            <div
              class="text-xs {willDelete
                ? 'text-red-400'
                : 'text-yellow-400'} mt-1 font-medium"
            >
              {#if willDelete}
                Deletion
              {:else}
                Reduction to {item.quantity - selectedQuantity}
              {/if}
            </div>
            {#if item.description}
              <div class="text-xs text-white/50 mt-1">{item.description}</div>
            {/if}
          </div>
          <div class="text-right text-sm text-white/60">
            {item.location}
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
      {itemCount} item{itemCount > 1 ? "s" : ""} selected for processing
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center justify-center gap-3 pt-4">
      <button
        type="button"
        onclick={handleDelete}
        class=" bg-blue-700 border border-blue-500 hover:bg-blue-600 disabled:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        disabled={isDeleting}
      >
        {#if isDeleting}
          Processing...
        {:else}
          <MaterialIcon icon="check" size={1.1} />
          Continue
        {/if}
      </button>
      <button
        type="button"
        onclick={handleClose}
        class=" bg-slate-800 border border-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        disabled={isDeleting}
      >
        Cancel
      </button>
    </div>
  </div>
</Dialog>
