<script lang="ts">
  import { readInventory, readRows } from "$lib/supabase";
  import type { InventoryItem } from "$lib/types";
  import { onMount } from "svelte";
  import InventoryTable from "../../../components/InventoryTable.svelte";

  let data: InventoryItem[] = [];
  onMount(async () => {
    const result = await readInventory();
    data = result.data || [];
  });
</script>

<div class="p-12">
  <InventoryTable items={data} />
</div>
