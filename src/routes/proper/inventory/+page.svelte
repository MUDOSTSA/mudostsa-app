<script lang="ts">
  import { readInventory, readRows } from "$lib/supabase";
  import type { InventoryItem } from "$lib/types";
  import { onMount } from "svelte";
  import InventoryTable from "../../../components/InventoryTable.svelte";

  let data: InventoryItem[] = $state([]);
  let loading = $state(true);

  async function loadInventoryData() {
    loading = true;
    try {
      const result = await readInventory();
      data = result.data || [];
    } catch (error) {
      console.error("Failed to load inventory:", error);
      data = [];
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    await loadInventoryData();
  });
</script>

<div class="p-4 h-full overflow-hidden">
  <InventoryTable items={data} {loading} onRefresh={loadInventoryData} />
</div>

<style>
  div {
    box-sizing: border-box;
  }
</style>
