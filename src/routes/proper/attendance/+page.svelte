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
  import Throbber from "../../../components/Throbber.svelte";

  let data: BasicAttendanceSheet[] = $state([]);
  let loading = $state(true);
  let selectedSheet: AttendanceSheet | null = $state(null);
  let attendanceRecords: AttendanceRecordAdapter[] = $state([]);
  let recordsLoading = $state(false);

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
</script>

<div class="p-4 w-full h-full overflow-hidden flex items-center justify-center">
  <div class="flex gap-2 items-center justify-start w-full h-full rounded-lg">
    <div
      class="p-4 box-sizing gap-2 flex flex-col rounded-md border bg-slate-800 w-1/5 border-slate-700 shadow white h-full"
    >
      <div class="flex gap-2 items-center">
        <Title>Sheets</Title>
        {#if loading}
          <div class="">
            <Throbber />
          </div>
        {:else}
          <div class="text-xs text-white/50">
            {data.length} sheet{data.length !== 1 ? "s" : ""}
          </div>
        {/if}
      </div>
      <button
        class="flex items-center justify-center text-sm py-1 hover:bg-blue-600 transition-colors duration-200 bg-blue-700 border border-blue-500 rounded-lg w-full text-white"
        ><MaterialIcon icon="add" size={1.2} /> Create New
      </button>
      <AttendanceSheetsDisplay
        {data}
        onSelect={(sheet) => {
          loadAttendanceSheet(sheet.id);
        }}
      />
    </div>
    <div
      class="w-4/5 box-sizing p-4 gap-2 flex flex-col rounded-md border bg-slate-800 border-slate-700 shadow white h-full"
    >
      {#if selectedSheet}
        <div class="flex items-start justify-between mb-2">
          <div>
            <Title>{selectedSheet.name}</Title>
            <div class="text-xs text-white/50">
              {attendanceRecords.length} record{attendanceRecords.length !== 1
                ? "s"
                : ""}
              {#if selectedSheet.for_event}
                • Event: {selectedSheet.for_event.event_title}
              {/if}
              {#if selectedSheet.locked}
                • <span class="text-amber-400">Locked</span>
              {/if}
            </div>
          </div>
        </div>
        <div class="flex-1 overflow-hidden">
          <AttendanceRecordsTable
            items={attendanceRecords}
            loading={recordsLoading}
            attendanceSheetId={selectedSheet.id}
            onRefresh={handleRefreshRecords}
          />
        </div>
      {:else}
        <div class="flex items-center justify-center h-full text-white/60">
          <div class="text-center">
            <MaterialIcon icon="assignment" size={3} />
            <p class="mt-2">Select an attendance sheet to view records</p>
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
