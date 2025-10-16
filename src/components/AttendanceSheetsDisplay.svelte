<script lang="ts">
  import type { BasicAttendanceSheet } from "$lib/types";
  import MaterialIcon from "./MaterialIcon.svelte";

  let {
    data = $bindable([]),
    onSelect,
  }: {
    data: BasicAttendanceSheet[];
    onSelect: (sheet: BasicAttendanceSheet) => any;
  } = $props();

  function processAttendanceSheetName(name: string): {
    event_title: string | null | undefined;
    name: string;
  } {
    let [prefix, actual] = name.split("-");
    switch (prefix) {
      case "RT":
        return { event_title: "Room Tambayan", name: actual || name };
      case "M":
        return { event_title: "Meeting", name: actual || name };
      default:
        return { event_title: null, name: actual || name };
    }
  }
</script>

<div class="w-full flex pt-4 flex-col">
  {#each data as sheet}
    {@const processed = processAttendanceSheetName(sheet.name)}
    <button
      onclick={() => onSelect(sheet)}
      class="flex w-full hover:bg-slate-700/50 hover:cursor-pointer transition-colors duration-200 items-center justify-between py-2 px-4 border-b border-slate-700"
    >
      <div class="flex flex-col gap-1 items-start">
        <span
          class="text-xs text-white px-1 border rounded-md border-blue-400 bg-blue-600"
          >{sheet.event_title ?? processed.event_title}</span
        >
        <span class="text-white font-bold">{processed.name}</span>
        <span class="text-white/50 text-xs"
          >{new Date(sheet.created_at).toLocaleString()}</span
        >
      </div>
      <div class="flex items-center gap-1 text-white/70">
        <MaterialIcon icon="people" size={1.2}></MaterialIcon>
        <span>{sheet.count}</span>
      </div>
    </button>
  {/each}
</div>
