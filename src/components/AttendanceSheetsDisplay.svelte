<script lang="ts">
  import type { BasicAttendanceSheet } from "$lib/types";
  import MaterialIcon from "./MaterialIcon.svelte";

  let {
    data = $bindable([]),
    onSelect,
    onRefresh,
    loading = false,
    selectedSheetId = null,
  }: {
    data: BasicAttendanceSheet[];
    onSelect: (sheet: BasicAttendanceSheet) => any;
    onRefresh?: () => void | Promise<void>;
    loading?: boolean;
    selectedSheetId?: number | null;
  } = $props();

  let searchQuery = $state("");

  // Filter sheets based on search query
  let filteredData = $derived(
    data.filter((sheet) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      const processed = processAttendanceSheetName(sheet.name);

      return (
        sheet.name.toLowerCase().includes(query) ||
        processed.name.toLowerCase().includes(query) ||
        sheet.event_title?.toLowerCase().includes(query) ||
        processed.event_title?.toLowerCase().includes(query)
      );
    })
  );

  function processAttendanceSheetName(name: string): {
    event_title: string | null | undefined;
    name: string;
  } {
    let [prefix, ...actual] = name.split("-");
    switch (prefix) {
      case "RT":
        return { event_title: "Room Tambayan", name: actual.join("-") || name };
      case "M":
        return { event_title: "Meeting", name: actual.join("-") || name };
      default:
        return { event_title: "No Event", name: actual.join("-") || name };
    }
  }
</script>

<div class="w-full h-full flex pt-4 flex-col overflow-hidden">
  <!-- Search bar -->
  <div class="px-4 mb-3 flex-shrink-0">
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Search..."
      class="w-full bg-transparent border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
    />
  </div>

  <!-- Count and refresh button -->
  <div class="flex items-center justify-between mb-2 px-4 flex-shrink-0">
    <span class="text-xs text-white/50">
      {filteredData.length} sheet{filteredData.length !== 1 ? "s" : ""}
      {#if searchQuery && filteredData.length !== data.length}
        <span class="text-slate-500">of {data.length}</span>
      {/if}
    </span>
    {#if onRefresh}
      <button
        onclick={() => onRefresh?.()}
        class="flex items-center gap-1 px-2 text-xs hover:bg-slate-600 text-white/80 hover:text-white rounded-full transition-colors"
        title="Refresh"
        disabled={loading}
      >
        <MaterialIcon icon="refresh" size={1.1} />
      </button>
    {/if}
  </div>

  <!-- Sheets list (scrollable) -->
  <div class="flex-1 overflow-y-auto">
    {#if filteredData.length === 0}
      <div class="flex flex-col items-center justify-center py-8 text-white/50">
        <MaterialIcon icon="search_off" size={2.5} />
        <p class="mt-2 text-sm">
          {searchQuery ? "No sheets match your search" : "No attendance sheets"}
        </p>
      </div>
    {:else}
      {#each filteredData as sheet}
        {@const processed = processAttendanceSheetName(sheet.name)}
        {@const isSelected = selectedSheetId === sheet.id}
        <button
          onclick={() => onSelect(sheet)}
          class="flex w-full hover:bg-slate-700/50 hover:cursor-pointer transition-colors duration-200 items-center justify-between py-2 px-4 border-b border-slate-700 {isSelected
            ? 'bg-blue-700/30 border-l-4 border-l-blue-500'
            : ''}"
        >
          <div class="flex flex-col gap-1 items-start min-w-0">
            <div class="flex items-center gap-2 w-full min-w-0">
              <span
                class="text-xs text-white px-1 border rounded-md border-blue-400 bg-blue-600 whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
                title={sheet.event_title ?? processed.event_title}
                >{sheet.event_title ?? processed.event_title}</span
              >
              <div class="flex items-center gap-1 flex-shrink-0">
                {#if sheet.locked}
                  <span class="text-yellow-400" title="Sheet is locked">
                    <MaterialIcon icon="lock" size={0.9} />
                  </span>
                {/if}
                {#if sheet.private}
                  <span class="text-purple-400" title="Private sheet">
                    <MaterialIcon icon="visibility_off" size={0.9} />
                  </span>
                {/if}
              </div>
            </div>
            <span
              class="text-white font-bold text-left whitespace-nowrap overflow-hidden text-ellipsis w-full"
              title={processed.name}>{processed.name}</span
            >
            <span class="text-white/50 text-xs text-left"
              >{new Date(sheet.created_at).toLocaleString()}</span
            >
          </div>
          <div class="flex items-center gap-1 text-white/70">
            <MaterialIcon icon="people" size={1.2}></MaterialIcon>
            <span>{sheet.count}</span>
          </div>
        </button>
      {/each}
    {/if}
  </div>
</div>
