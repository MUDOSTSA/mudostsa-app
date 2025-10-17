<script lang="ts">
  import { SortOrder } from "$lib/enums";
  import type {
    RoomTambayanSchedule,
    RoomTambayanScheduleNormalized,
  } from "$lib/types";
  import { normalizeRoomTambayanSchedule } from "$lib/types";
  import { goto } from "$app/navigation";
  import Dialog from "./Dialog.svelte";

  import MaterialIcon from "./MaterialIcon.svelte";
  import Throbber from "./Throbber.svelte";
  import { downloadCsv } from "$lib/csv";
  import TambayanScheduleRow from "./TambayanScheduleRow.svelte";

  import TableHeader from "./TableHeader.svelte";
  import AddTambayanScheduleDialog from "./AddTambayanScheduleDialog.svelte";
  import EditTambayanScheduleDialog from "./EditTambayanScheduleDialog.svelte";
  import DeleteTambayanScheduleDialog from "./DeleteTambayanScheduleDialog.svelte";
  import LinkAttendanceSheetDialog from "./LinkAttendanceSheetDialog.svelte";

  let {
    items,
    loading = true,
    onRefresh,
  }: {
    items: RoomTambayanSchedule[];
    loading: boolean;
    onRefresh?: () => void | Promise<void>;
  } = $props();
  let sorting: {
    column: keyof RoomTambayanScheduleNormalized;
    order: SortOrder;
  } = $state({
    column: "created_at",
    order: SortOrder.descending,
  });
  let searchFilter = $state("");

  let normalizedItems: RoomTambayanScheduleNormalized[] = $derived(
    items.map(normalizeRoomTambayanSchedule)
  );

  let sortedItems: RoomTambayanScheduleNormalized[] = $derived(
    normalizedItems
      .slice()
      .sort((a, b) => {
        //should display selected items on top then do the sort order

        const modifier = sorting.order === SortOrder.ascending ? 1 : -1;
        const aVal = a[sorting.column];
        const bVal = b[sorting.column];

        // Handle null values
        if (aVal === null && bVal === null) return 0;
        if (aVal === null) return 1;
        if (bVal === null) return -1;

        if (aVal < bVal) return -1 * modifier;
        if (aVal > bVal) return 1 * modifier;
        return 0;
      })
      .filter((item) =>
        `${item.room} ${item.campus} ${item.time_start} ${item.time_end} ${item.attendance_sheet_code}`
          .toLowerCase()
          .includes(searchFilter.toLowerCase())
      )
  );
  let addDialogShown = $state(false);
  let editDialogShown = $state(false);
  let deleteDialogShown = $state(false);
  let linkSheetDialogShown = $state(false);
  let itemToEdit: RoomTambayanSchedule | null = $state(null);
  let itemToLink: RoomTambayanSchedule | null = $state(null);
  let selectedItems: { [key: string]: RoomTambayanScheduleNormalized } = $state(
    {}
  );

  function handleRowClick(item: RoomTambayanScheduleNormalized) {
    if (selectedItems[item.id]) {
      delete selectedItems[item.id];
    } else {
      selectedItems[item.id] = item;
    }
  }

  function handleEditClick() {
    const selectedItemIds = Object.keys(selectedItems);
    if (selectedItemIds.length === 1) {
      const selectedId = selectedItemIds[0];
      const selectedItem = items.find(
        (item) => item.id.toString() === selectedId
      );
      if (selectedItem) {
        itemToEdit = selectedItem;
        editDialogShown = true;
      }
    }
  }

  function handleDeleteClick() {
    if (Object.keys(selectedItems).length > 0) {
      deleteDialogShown = true;
    }
  }

  function handleLinkSheetClick() {
    const selectedItemIds = Object.keys(selectedItems);
    if (selectedItemIds.length === 1) {
      const selectedId = selectedItemIds[0];
      const selectedItem = items.find(
        (item) => item.id.toString() === selectedId
      );
      if (selectedItem) {
        itemToLink = selectedItem;
        linkSheetDialogShown = true;
      }
    }
  }

  function handleGoToAttendanceSheet() {
    const selectedItemIds = Object.keys(selectedItems);
    if (selectedItemIds.length === 1) {
      const selectedItem = selectedItems[selectedItemIds[0]];
      if (
        selectedItem.has_attendance_sheet &&
        selectedItem.attendance_sheet_id
      ) {
        goto(`/proper/attendance?sheet=${selectedItem.attendance_sheet_id}`);
      }
    }
  }

  function handleSuccess() {
    selectedItems = {}; // Clear selection after successful delete
    onRefresh?.(); // Refresh the data
  }
  function exportToCSV() {
    let date = new Date();
    if (selectedItems && Object.keys(selectedItems).length > 0) {
      const itemsToExport = Object.values(selectedItems);
      downloadCsv(
        itemsToExport,
        `room_tambayan_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.csv`
      );
      return;
    }
    downloadCsv(
      items,
      `room_tambayan_schedule_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.csv`
    );
  }
</script>

<!--<AddInventoryDialog bind:shown={addDialogShown} onSuccess={handleSuccess}
></AddInventoryDialog>
<EditInventoryDialog
  bind:shown={editDialogShown}
  bind:item={itemToEdit}
  onSuccess={handleSuccess}
></EditInventoryDialog>
<DeleteConfirmationDialog
  bind:shown={deleteDialogShown}
  {selectedItems}
  onSuccess={handleSuccess}
></DeleteConfirmationDialog>-->

<AddTambayanScheduleDialog
  bind:shown={addDialogShown}
  onSuccess={handleSuccess}
/>
<EditTambayanScheduleDialog
  bind:shown={editDialogShown}
  bind:item={itemToEdit}
  onSuccess={handleSuccess}
/>
<DeleteTambayanScheduleDialog
  bind:shown={deleteDialogShown}
  {selectedItems}
  onSuccess={handleSuccess}
/>
<LinkAttendanceSheetDialog
  bind:shown={linkSheetDialogShown}
  schedule={itemToLink}
  onSuccess={handleSuccess}
/>
<div
  class="w-full relative overflow-hidden bg-slate-800 border-slate-700 border rounded-lg h-full flex flex-col items-center justify-start gap-2 py-2"
>
  <span class="text-white/30 text-sm"
    >{#if loading}
      <div class="flex gap-1">
        <Throbber --size={"1.2rem"}></Throbber>
        <span class="hidden sm:inline">Fetching</span>
      </div>
    {:else}
      <div class="flex items-center gap-2">
        <span class="text-xs sm:text-sm"
          >Showing {sortedItems.length} item{sortedItems.length !== 1
            ? "s"
            : ""}</span
        >
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
  <div
    class="w-full p-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 rounded-lg"
  >
    <input
      type="text"
      placeholder="Search..."
      bind:value={searchFilter}
      class="w-full bg-transparent border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
    />
    <div class="flex items-center justify-center gap-2">
      <button
        onclick={() => (addDialogShown = true)}
        class="flex-1 sm:flex-initial flex items-center justify-center gap-1 bg-blue-700 border-blue-500 border hover:bg-blue-600 text-white py-2 px-4 rounded-lg duration-200"
      >
        <MaterialIcon icon="add" size={1.2}></MaterialIcon>
        <span class="hidden sm:inline">Add</span>
      </button>
      <button
        onclick={exportToCSV}
        class="flex-1 sm:flex-initial flex items-center justify-center gap-1 border-slate-500 bg-slate-700 border hover:bg-slate-600 text-white py-2 px-4 rounded-lg duration-200"
      >
        <MaterialIcon icon="arrow_outward" size={1.2}></MaterialIcon><span
          class="hidden sm:inline">Export</span
        >
      </button>
    </div>
  </div>
  {#if selectedItems && Object.keys(selectedItems).length > 0}
    <div class="p-2 sticky w-full top-0 z-10">
      <div
        class="bg-blue-900/30 border gap-2 border-blue-800 rounded-lg w-full min-h-14 flex flex-wrap items-center justify-start p-2"
      >
        <button
          onclick={() => (selectedItems = {})}
          title="Clear selection"
          class="h-8 flex items-center justify-center rounded-full text-white/80 w-8 hover:bg-white/10"
          ><MaterialIcon icon="clear" size={1.3}></MaterialIcon></button
        >
        <span class="text-white/80 pr-2 text-sm sm:text-base"
          >{Object.keys(selectedItems).length} selected</span
        >
        {#if Object.keys(selectedItems).length === 1}
          <button
            onclick={handleEditClick}
            title="Edit item"
            class="h-8 flex items-center justify-center rounded-full text-white/80 w-10 hover:bg-white/10"
            ><MaterialIcon icon="edit" size={1.3}></MaterialIcon></button
          >
          <button
            onclick={handleLinkSheetClick}
            title="Manage attendance sheet link"
            class="h-8 flex items-center justify-center rounded-full text-white/80 w-10 hover:bg-white/10"
            ><MaterialIcon icon="link" size={1.3}></MaterialIcon></button
          >
          {#if Object.values(selectedItems)[0]?.has_attendance_sheet}
            <button
              onclick={handleGoToAttendanceSheet}
              title="Go to attendance sheet"
              class="h-8 flex items-center justify-center rounded-full text-white/80 w-10 hover:bg-white/10"
              ><MaterialIcon icon="open_in_new" size={1.3}
              ></MaterialIcon></button
            >
          {/if}
        {/if}

        <button
          onclick={handleDeleteClick}
          title="Delete item(s)"
          class="h-8 flex items-center justify-center rounded-full text-white/80 w-10 hover:bg-white/10"
          ><MaterialIcon icon="delete" size={1.3} outlined={true}
          ></MaterialIcon></button
        >
      </div>
    </div>
  {/if}
  <div class="h-full relative w-full overflow-x-auto overflow-y-auto">
    <table class="w-full border-collapse min-w-[1000px] text-white rounded-lg">
      <thead class="bg-slate-800 sticky top-0 z-1">
        <tr>
          <TableHeader headerTitle="ID" column="id" {sorting}></TableHeader>
          <TableHeader headerTitle="Room" column="room" {sorting}></TableHeader>
          <TableHeader headerTitle="Campus" column="campus" {sorting}
          ></TableHeader>
          <TableHeader headerTitle="Time Start" column="time_start" {sorting}
          ></TableHeader>
          <TableHeader headerTitle="Time End" column="time_end" {sorting}
          ></TableHeader>
          <TableHeader headerTitle="Created at" column="created_at" {sorting}
          ></TableHeader>
          <th class="px-6 py-3 text-left font-medium">Attendance Sheet</th>
        </tr>
      </thead>
      <tbody>
        {#each sortedItems as row}
          <TambayanScheduleRow
            selected={selectedItems[row.id] ? true : false}
            selectable
            item={row}
            onclick={handleRowClick}
          />
        {/each}
      </tbody>
    </table>
    {#if sortedItems.length === 0}
      <div class="p-4 text-center text-gray-500">No items found</div>
    {/if}
  </div>
</div>
