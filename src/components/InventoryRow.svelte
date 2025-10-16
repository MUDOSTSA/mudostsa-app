<script lang="ts">
  import type {
    InventoryItem,
    InventoryItemWithSelectedQuantity,
  } from "$lib/types";
  import MaterialIcon from "./MaterialIcon.svelte";

  let {
    item,
    selectable = false,
    selected = false,
    onclick,
    onselectedquantitychanged,
  }: {
    item: InventoryItem;
    selectable?: boolean;
    selected?: boolean;
    onclick?: (item: InventoryItemWithSelectedQuantity) => any;
    onselectedquantitychanged?: (
      item: InventoryItemWithSelectedQuantity,
      quantity: number
    ) => any;
  } = $props();
  let selectedQuantity = $state(item.quantity);
  let editingRequestQuantity = $state(false);
  let selectedQuantityInputRef: HTMLInputElement | null = $state(null);
  $effect(() => {
    if (selectedQuantity > item.quantity) {
      selectedQuantity = item.quantity;
    }
    if (selectedQuantity < 0) {
      selectedQuantity = 0;
    }
    if (!selectedQuantity && !editingRequestQuantity) {
      selectedQuantity = 0;
    }
  });
  $effect(() => {
    if (editingRequestQuantity) {
      selectedQuantityInputRef?.focus();
      selectedQuantityInputRef?.select();
    } else {
      onselectedquantitychanged?.(
        { ...item, selectedQuantity },
        selectedQuantity
      );
    }
  });
</script>

<tr
  class="border-b border-white/10 transition-colors {selectable
    ? 'cursor-pointer'
    : ''} {selected
    ? 'bg-blue-600/20 hover:bg-blue-600/25'
    : 'hover:bg-white/5'}"
>
  <td class="px-2 min-w-15 py-2 cursor-default"
    >{#if selected}<div
        class=" bg-slate-800 p-1 rounded-lg border border-slate-600 flex flex-col items-center justify-center gap-1"
      >
        <button
          class="pointer-events-auto hover:text-yellow-200"
          onclick={(e) => {
            e.stopPropagation();
            selectedQuantity = Math.min(item.quantity, selectedQuantity + 1);
            onselectedquantitychanged?.(
              { ...item, selectedQuantity },
              selectedQuantity
            );
          }}
          ><MaterialIcon icon="arrow_drop_up" size={1.5}></MaterialIcon></button
        >
        <button
          class="w-8 flex items-center justify-center"
          onclick={(e) => {
            e.stopPropagation();
            editingRequestQuantity = !editingRequestQuantity;
          }}
          >{#if editingRequestQuantity}<input
              bind:this={selectedQuantityInputRef}
              class="bg-slate-700 rounded-lg flex items-center justify-center text-center"
              onclick={(e) => e.stopPropagation()}
              onblur={(e) => {
                e.stopPropagation();
                editingRequestQuantity = false;
              }}
              onkeydown={(e) => {
                if (e.key === "Enter") {
                  e.stopPropagation();
                  editingRequestQuantity = false;
                }
              }}
              bind:value={selectedQuantity}
              type="number"
              min="0"
              max={item.quantity}
            />{:else}{selectedQuantity}{/if}</button
        >
        <button
          class="hover:text-yellow-200 pointer-events-auto"
          onclick={(e) => {
            e.stopPropagation();
            selectedQuantity = Math.max(0, selectedQuantity - 1);
            onselectedquantitychanged?.(
              { ...item, selectedQuantity },
              selectedQuantity
            );
          }}
          ><MaterialIcon icon="arrow_drop_down" size={1.5}
          ></MaterialIcon></button
        >
      </div>{/if}</td
  >
  <td
    onclick={() => {
      if (selectable) {
        onclick?.({ ...item, selectedQuantity });
      }
    }}
    class=" px-6 py-8 font-mono">{item.id}</td
  >
  <td
    onclick={() => {
      if (selectable) {
        onclick?.({ ...item, selectedQuantity });
      }
    }}
    class="px-6 py-8 max-w-64"
  >
    <div class="flex flex-col">
      <span class="font-medium">{item.name}</span>
      <span class="opacity-40 text-sm">{item.description}</span>
    </div>
  </td>
  <td
    onclick={() => {
      if (selectable) {
        onclick?.({ ...item, selectedQuantity });
      }
    }}
    class="px-6 py-8 flex items-center justify-center"
    ><span
      class="h-8 flex justify-center items-center w-8 text-center text-sm {item.quantity ==
      0
        ? 'bg-pink-700 border-pink-500'
        : item.quantity == 1
          ? 'bg-fuchsia-700 border-fuchsia-500'
          : 'bg-blue-800 border-blue-600'} border rounded-full font-bold"
      >{item.quantity}</span
    ></td
  >
  <td
    onclick={() => {
      if (selectable) {
        onclick?.({ ...item, selectedQuantity });
      }
    }}
    class="px-6 py-8">{item.category}</td
  >
  <td
    onclick={() => {
      if (selectable) {
        onclick?.({ ...item, selectedQuantity });
      }
    }}
    class="px-6 py-8">{item.location}</td
  >
  <td
    onclick={() => {
      if (selectable) {
        onclick?.({ ...item, selectedQuantity });
      }
    }}
    class="px-6 py-8 flex flex-col"
    ><span class="text-sm">{new Date(item.updated_at).toLocaleString()}</span>
    <span class="text-sm opacity-50">
      by {item.last_modified_by.display_name}</span
    ></td
  >
</tr>

<style>
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    /* display: none; <- Crashes Chrome on hover */
    -webkit-appearance: none;
    margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
  }

  input[type="number"] {
    -moz-appearance: textfield; /* Firefox */
  }
</style>
