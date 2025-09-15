<script lang="ts">
  import type { SelectableInventoryItem } from "$lib/types";
  import InventoryRow from "./InventoryRow.svelte";
  export let rows: SelectableInventoryItem[] = [];
  export let requesting = false;
</script>

<tbody>
  {#each rows as row}
    <InventoryRow
      selectable={requesting}
      selected={row.selected}
      item={row.item}
    />
  {/each}
</tbody>
