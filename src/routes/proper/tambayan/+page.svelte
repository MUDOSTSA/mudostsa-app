<script lang="ts">
  import { readInventory, readRows } from "$lib/supabase";
  import type { RoomTambayanSchedule } from "$lib/types";
  import { onMount } from "svelte";
  import TambayanScheduleTable from "../../../components/TambayanScheduleTable.svelte";

  let data: RoomTambayanSchedule[] = $state([]);
  let loading = $state(true);

  async function loadRoomTambayanData() {
    loading = true;
    try {
      const result = await readRows("tambayan");
      data = result.data || [];
    } catch (error) {
      console.error("Failed to load Room Tambayan schedule:", error);
      data = [];
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    await loadRoomTambayanData();
  });
</script>

<div class="p-4 h-full overflow-hidden">
  <TambayanScheduleTable
    items={data}
    {loading}
    onRefresh={loadRoomTambayanData}
  />
</div>

<style>
  div {
    box-sizing: border-box;
  }
</style>
