<script lang="ts">
  import type { InventoryItem } from "$lib/types";

  let { item }: { item: InventoryItem } = $props();
</script>

<tr class="border-b border-white/10 hover:bg-white/5 transition-colors">
  <td class="px-6 py-8">{item.id}</td>
  <td class="px-6 py-8 max-w-64">
    <div class="flex flex-col">
      <span class="font-medium">{item.name}</span>
      <span class="opacity-40 text-sm">{item.description}</span>
    </div>
  </td>
  <td class="px-6 py-8 flex items-center justify-center"
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
  <td class="px-6 py-8">{item.category}</td>
  <td class="px-6 py-8">{item.location}</td>
  <td class="px-6 py-8 flex flex-col"
    ><span class="text-sm">{new Date(item.updated_at).toLocaleString()}</span>
    <span class="text-sm opacity-50">
      by {item.last_modified_by.display_name}</span
    ></td
  >
  <td></td>
</tr>
