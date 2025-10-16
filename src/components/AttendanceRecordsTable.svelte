<script lang="ts">
  import { SortOrder } from "$lib/enums";
  import type { AttendanceRecordAdapter } from "$lib/types";
  import LogAttendanceDialog from "./LogAttendanceDialog.svelte";
  import DeleteAttendanceDialog from "./DeleteAttendanceDialog.svelte";

  import AttendanceRow from "./AttendanceRow.svelte";
  import MaterialIcon from "./MaterialIcon.svelte";
  import Throbber from "./Throbber.svelte";
  import { downloadCsv } from "$lib/csv";
  import TableHeader from "./TableHeader.svelte";

  let {
    items,
    loading = true,
    attendanceSheetId,
    onRefresh,
  }: {
    items: AttendanceRecordAdapter[];
    loading: boolean;
    attendanceSheetId?: number;
    onRefresh?: () => void | Promise<void>;
  } = $props();

  let sorting: { column: keyof AttendanceRecordAdapter; order: SortOrder } =
    $state({
      column: "created_at",
      order: SortOrder.descending,
    });
  let searchFilter = $state("");

  let sortedItems: AttendanceRecordAdapter[] = $derived(
    items
      .slice()
      .sort((a, b) => {
        const modifier = sorting.order === SortOrder.ascending ? 1 : -1;
        if (a[sorting.column] < b[sorting.column]) return -1 * modifier;
        if (a[sorting.column] > b[sorting.column]) return 1 * modifier;
        return 0;
      })
      .filter((item) =>
        `${item.name} ${item.id} ${item.role} ${item.committee} ${item.program} ${item.year}`
          .toLowerCase()
          .includes(searchFilter.toLowerCase())
      )
  );

  let logDialogShown = $state(false);
  let deleteDialogShown = $state(false);
  let selectedItems: { [key: string]: AttendanceRecordAdapter } = $state({});

  function handleRowClick(item: AttendanceRecordAdapter) {
    if (selectedItems[item.id]) {
      delete selectedItems[item.id];
    } else {
      selectedItems[item.id] = item;
    }
  }

  function handleDeleteClick() {
    if (Object.keys(selectedItems).length > 0) {
      deleteDialogShown = true;
    }
  }

  function handleSuccess() {
    selectedItems = {}; // Clear selection after successful operation
    onRefresh?.(); // Refresh the data
  }

  function exportToCSV() {
    let date = new Date();
    if (selectedItems && Object.keys(selectedItems).length > 0) {
      const itemsToExport = Object.values(selectedItems);
      downloadCsv(
        itemsToExport,
        `attendance_records_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.csv`
      );
      return;
    }
    downloadCsv(
      items,
      `attendance_records_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.csv`
    );
  }
</script>

<LogAttendanceDialog
  bind:shown={logDialogShown}
  {attendanceSheetId}
  onSuccess={handleSuccess}
/>
<DeleteAttendanceDialog
  bind:shown={deleteDialogShown}
  {selectedItems}
  onSuccess={handleSuccess}
/>

<div
  class="w-full relative overflow-hidden bg-slate-800 border-slate-700 border rounded-lg h-full flex flex-col items-center justify-start gap-2 py-2"
>
  <span class="text-white/30 text-sm"
    >{#if loading}
      <div class="flex gap-1">
        <Throbber --size={"1.2rem"}></Throbber>
        <span>Fetching</span>
      </div>
    {:else}
      <div class="flex items-center gap-2">
        <span>Showing {sortedItems.length} records</span>
        <button
          onclick={() => onRefresh?.()}
          class="flex items-center gap-1 px-2 text-xs hover:bg-slate-600 text-white/80 hover:text-white rounded-full transition-colors"
          title="Refresh"
        >
          <MaterialIcon icon="refresh" size={1.1} />
        </button>
      </div>
    {/if}</span
  >
  <div class=" w-full p-2 flex items-center justify-center gap-2 rounded-lg">
    <input
      type="text"
      placeholder="Search..."
      bind:value={searchFilter}
      class="w-full bg-transparent border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
    />
    <div class="flex items-center justify-center gap-2">
      <button
        onclick={() => (logDialogShown = true)}
        class="flex items-center justify-center gap-1 bg-blue-700 border-blue-500 border hover:bg-blue-600 text-white py-2 px-4 rounded-lg duration-200"
      >
        <MaterialIcon icon="add" size={1.2}></MaterialIcon>
        Log
      </button>
      <button
        onclick={exportToCSV}
        class="flex items-center justify-center gap-1 border-slate-500 bg-slate-700 border hover:bg-slate-600 text-white py-2 px-4 rounded-lg duration-200"
      >
        <MaterialIcon icon="arrow_outward" size={1.2}></MaterialIcon>Export
      </button>
    </div>
  </div>
  {#if selectedItems && Object.keys(selectedItems).length > 0}
    <div class="p-2 sticky w-full top-0">
      <div
        class="bg-blue-900/30 border gap-2 border-blue-800 rounded-lg w-full h-14 flex items-center justify-start p-2"
      >
        <button
          onclick={() => (selectedItems = {})}
          title="Clear selection"
          class="h-8 flex items-center justify-center rounded-full text-white/80 w-8 hover:bg-white/10"
          ><MaterialIcon icon="clear" size={1.3}></MaterialIcon></button
        >
        <span class="text-white/80 pr-4"
          >{Object.keys(selectedItems).length} selected</span
        >

        <button
          onclick={handleDeleteClick}
          title="Delete record(s)"
          class="h-8 flex items-center justify-center rounded-full text-white/80 w-10 hover:bg-white/10"
          ><MaterialIcon icon="delete" size={1.3} outlined={true}
          ></MaterialIcon></button
        >
      </div>
    </div>
  {/if}
  <div class="h-full relative w-full overflow-scroll">
    <table class="w-full border-collapse min-w-260 text-white rounded-lg">
      <thead class="bg-slate-800 sticky top-0 z-1">
        <tr>
          <TableHeader headerTitle="Record ID" column="id" {sorting}
          ></TableHeader>
          <TableHeader headerTitle="Member Name" column="name" {sorting}
          ></TableHeader>
          <TableHeader headerTitle="Member ID" column="student_number" {sorting}
          ></TableHeader>
          <TableHeader headerTitle="Program" column="program" {sorting}
          ></TableHeader>
          <TableHeader headerTitle="Year" column="year" {sorting}></TableHeader>
          <TableHeader headerTitle="Committee" column="committee" {sorting}
          ></TableHeader>
          <TableHeader headerTitle="Role" column="role" {sorting}></TableHeader>
          <TableHeader headerTitle="Logged At" column="created_at" {sorting}
          ></TableHeader>
        </tr>
      </thead>
      <tbody>
        {#each sortedItems as row}
          <AttendanceRow
            selected={selectedItems[row.id] ? true : false}
            selectable
            item={row}
            onclick={handleRowClick}
          />
        {/each}
      </tbody>
    </table>
    {#if sortedItems.length === 0}
      <div class="p-4 text-center text-gray-500">
        No attendance records found
      </div>
    {/if}
  </div>
</div>
