<script lang="ts">
  import { SortOrder } from "$lib/enums";

  let {
    headerTitle,
    column,
    sorting,
  }: {
    headerTitle: string;
    column: string;
    sorting: { column: string; order: SortOrder };
  } = $props();

  function toggleSort() {
    if (sorting.column === column) {
      sorting.order =
        sorting.order === SortOrder.ascending
          ? SortOrder.descending
          : SortOrder.ascending;
    } else {
      sorting.column = column;
      sorting.order = SortOrder.ascending;
    }
  }
</script>

<th class="px-6 py-4 text-left font-medium"
  ><button onclick={toggleSort} class="flex items-center gap-2">
    <span class="whitespace-nowrap">{headerTitle}</span
    >{#if sorting.column == column}
      {#if sorting.order == SortOrder.ascending}
        <span class="material-icons">arrow_upward</span>
      {:else}
        <span class="material-icons">arrow_downward</span>
      {/if}
    {/if}
  </button></th
>

<style>
  .material-icons {
    font-size: 12px;
  }
</style>
