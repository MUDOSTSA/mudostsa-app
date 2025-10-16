<script lang="ts">
  import {
    readAttendanceSheet,
    readAttendanceSheets,
    readInventory,
    readRows,
  } from "$lib/supabase";
  import {
    type BasicAttendanceSheet,
    type AttendanceSheet,
    type AttendanceRecordAdapter,
    normalizeAttendanceRecord,
  } from "$lib/types";
  import { onMount } from "svelte";
  import AttendanceRecordsTable from "../../../components/AttendanceRecordsTable.svelte";
  import Title from "../../../components/Title.svelte";
  import MaterialIcon from "../../../components/MaterialIcon.svelte";
  import AttendanceSheetsDisplay from "../../../components/AttendanceSheetsDisplay.svelte";
  import AddAttendanceSheetDialog from "../../../components/AddAttendanceSheetDialog.svelte";
  import DeleteAttendanceSheetDialog from "../../../components/DeleteAttendanceSheetDialog.svelte";
  import EditAttendanceSheetDialog from "../../../components/EditAttendanceSheetDialog.svelte";
  import Throbber from "../../../components/Throbber.svelte";

  let data: BasicAttendanceSheet[] = $state([]);
  let loading = $state(true);
  let selectedSheet: AttendanceSheet | null = $state(null);
  let attendanceRecords: AttendanceRecordAdapter[] = $state([]);
  let recordsLoading = $state(false);
  let addSheetDialogShown = $state(false);
  let deleteSheetDialogShown = $state(false);
  let editSheetDialogShown = $state(false);

  async function loadAttendanceSheets() {
    loading = true;
    try {
      const result = await readAttendanceSheets();
      data = result.data || [];
      console.log(result);
    } catch (error) {
      console.error("Failed to load attendance sheets:", error);
      data = [];
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    await loadAttendanceSheets();
  });

  async function loadAttendanceSheet(id: number) {
    recordsLoading = true;
    try {
      const result = await readAttendanceSheet(id);
      if (result.data) {
        selectedSheet = result.data;
        attendanceRecords = [];
        let member_count = result.data.member_records.length;
        for (let n of result.data.non_member_records) {
          attendanceRecords.push(normalizeAttendanceRecord(n));
        }
        for (let m of result.data.member_records) {
          attendanceRecords.push(normalizeAttendanceRecord(m));
        }

        console.log("Loaded attendance sheet:", result.data);
      } else {
        console.error("Failed to load attendance sheet:", result.error);
        selectedSheet = null;
        attendanceRecords = [];
      }
    } catch (error) {
      console.error("Error loading attendance sheet:", error);
      selectedSheet = null;
      attendanceRecords = [];
    } finally {
      recordsLoading = false;
    }
  }

  function handleRefreshRecords() {
    if (selectedSheet) {
      loadAttendanceSheet(selectedSheet.id);
    }
  }

  function handleCreateSheetSuccess() {
    loadAttendanceSheets();
  }

  function handleDeleteSheet() {
    deleteSheetDialogShown = true;
  }

  function handleDeleteSheetSuccess() {
    selectedSheet = null;
    attendanceRecords = [];
    loadAttendanceSheets();
  }

  function handleEditSheet() {
    editSheetDialogShown = true;
  }

  function handleEditSheetSuccess() {
    if (selectedSheet) {
      loadAttendanceSheet(selectedSheet.id);
    }
    loadAttendanceSheets();
  }
</script>

<AddAttendanceSheetDialog
  bind:shown={addSheetDialogShown}
  onSuccess={handleCreateSheetSuccess}
/>
<DeleteAttendanceSheetDialog
  bind:shown={deleteSheetDialogShown}
  sheetName={selectedSheet?.name || ""}
  sheetId={selectedSheet?.id || 0}
  onSuccess={handleDeleteSheetSuccess}
/>
<EditAttendanceSheetDialog
  bind:shown={editSheetDialogShown}
  sheet={selectedSheet}
  onSuccess={handleEditSheetSuccess}
/>

<div class="p-2 sm:p-4 w-full h-full overflow-auto">
  <div
    class="flex flex-col lg:flex-row gap-2 items-stretch justify-start w-full min-h-full lg:h-full rounded-lg"
  >
    <!-- Sheets Sidebar -->
    <div
      class="p-3 sm:p-4 box-sizing gap-2 flex flex-col rounded-md border bg-slate-800 w-full lg:w-1/4 xl:w-1/5 border-slate-700 shadow white min-h-[400px] lg:min-h-[600px] lg:h-full"
    >
      <div class="flex gap-2 items-center flex-shrink-0">
        <Title>Sheets</Title>
        {#if loading}
          <div class="">
            <Throbber />
          </div>
        {/if}
      </div>
      <button
        onclick={() => (addSheetDialogShown = true)}
        class="flex items-center justify-center text-sm py-1 sm:py-2 hover:bg-blue-600 transition-colors duration-200 bg-blue-700 border border-blue-500 rounded-lg w-full text-white flex-shrink-0"
        ><MaterialIcon icon="add" size={1.2} />
        <span class="hidden sm:inline">Create New</span><span class="sm:hidden"
          >New</span
        >
      </button>
      <div class="flex-1 min-h-[300px] overflow-hidden">
        <AttendanceSheetsDisplay
          {data}
          {loading}
          onRefresh={loadAttendanceSheets}
          onSelect={(sheet) => {
            loadAttendanceSheet(sheet.id);
          }}
        />
      </div>
    </div>

    <!-- Records Display -->
    <div
      class="w-full lg:w-3/4 xl:w-4/5 box-sizing p-3 sm:p-4 gap-2 flex flex-col rounded-md border bg-slate-800 border-slate-700 shadow white min-h-[500px] lg:min-h-[600px] lg:h-full flex-1"
    >
      {#if selectedSheet}
        <div
          class="flex flex-col sm:flex-row items-start justify-between mb-2 gap-2 flex-shrink-0"
        >
          <div class="flex-1 min-w-0">
            <Title>{selectedSheet.name}</Title>
            <div class="text-xs sm:text-sm text-white/50 break-words">
              {attendanceRecords.length} record{attendanceRecords.length !== 1
                ? "s"
                : ""}
              {#if selectedSheet.for_event}
                <span class="hidden sm:inline">•</span>
                <span class="block sm:inline"
                  >Event: {selectedSheet.for_event.event_title}</span
                >
              {/if}
              {#if selectedSheet.locked}
                <span class="hidden sm:inline">•</span>
                <span class="block sm:inline text-amber-400">Locked</span>
              {/if}
            </div>
          </div>
        </div>
        <div class="flex-1 flex flex-col overflow-hidden min-h-[400px]">
          <AttendanceRecordsTable
            items={attendanceRecords}
            loading={recordsLoading}
            attendanceSheetId={selectedSheet.id}
            locked={selectedSheet.locked}
            onRefresh={handleRefreshRecords}
            onDeleteSheet={handleDeleteSheet}
            onEditSheet={handleEditSheet}
          />
        </div>
      {:else}
        <div
          class="flex items-center justify-center h-full min-h-[400px] text-white/60 flex-1"
        >
          <div class="text-center p-4">
            <MaterialIcon icon="assignment" size={3} />
            <p class="mt-2 text-sm sm:text-base">
              Select an attendance sheet to view records
            </p>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  div {
    box-sizing: border-box;
  }
</style>
