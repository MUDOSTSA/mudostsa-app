<script lang="ts">
  import type { InventoryItem } from "$lib/types";
  import InventoryRow from "./InventoryRow.svelte";

  let { items }: { items: InventoryItem[] } = $props();
</script>

<table
  class="w-full min-w-260 text-white border border-white/20 rounded-lg overflow-hidden"
>
  <thead class="bg-slate-800/50">
    <tr class="border-b border-white/20">
      <th class="px-6 py-4 text-left font-medium">ID</th>
      <th class="px-6 py-4 text-left font-medium">Item</th>
      <th class="px-6 py-4 text-left font-medium">Quantity</th>
      <th class="px-6 py-4 text-left font-medium">Category</th>
      <th class="px-6 py-4 text-left font-medium">Location</th>
      <th class="px-6 py-4 text-left font-medium">Modified at</th>
      <th class="px-6 py-4"></th>
    </tr>
  </thead>
  <tbody>
    {#each items as item}
      <InventoryRow {item} />
    {/each}
  </tbody>
</table>
