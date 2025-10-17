<script lang="ts">
  import type { RoomTambayanScheduleNormalized } from "$lib/types";
  import MaterialIcon from "./MaterialIcon.svelte";
  import { goto } from "$app/navigation";

  let {
    item,
    selectable = false,
    selected = false,
    onclick,
  }: {
    item: RoomTambayanScheduleNormalized;
    selectable?: boolean;
    selected?: boolean;
    onclick?: (item: RoomTambayanScheduleNormalized) => any;
  } = $props();

  let copied = $state(false);

  function formatDateTime(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    const formatted = new Intl.DateTimeFormat("en-US", options).format(date);
    const [dayPart, timePart] = formatted.split(" at ") || [formatted, ""];

    return `${dayPart} at ${timePart}`;
  }

  function navigateToSheet(e: Event) {
    e.stopPropagation();
    if (item.attendance_sheet_id) {
      goto(`/proper/attendance?sheet=${item.attendance_sheet_id}`);
    }
  }

  async function copyCode(e: Event) {
    e.stopPropagation();
    const code =
      item.attendance_sheet_code || `Sheet #${item.attendance_sheet_id}`;

    try {
      await navigator.clipboard.writeText(code);
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }
</script>

<tr
  class="border-b border-white/10 transition-colors {selectable
    ? 'cursor-pointer'
    : ''} {selected
    ? 'bg-blue-600/20 hover:bg-blue-600/25'
    : 'hover:bg-white/5'}"
>
  <td
    onclick={() => {
      if (selectable) {
        onclick?.({ ...item });
      }
    }}
    class=" px-6 py-8 font-mono">{item.id}</td
  >
  <td
    onclick={() => {
      if (selectable) {
        onclick?.({ ...item });
      }
    }}
    class="px-6 py-8 max-w-64"
  >
    <div class="flex flex-col">
      <span class="font-bold">{item.room}</span>
    </div>
  </td>

  <td
    onclick={() => {
      if (selectable) {
        onclick?.({ ...item });
      }
    }}
    class="px-6 py-8"
    ><span
      class="capitalize {item.campus.toLowerCase() == 'intramuros'
        ? 'bg-red-800 border-red-600'
        : 'bg-green-800 border-green-600'} px-2 py-1 rounded-md border"
    >
      {item.campus}
    </span></td
  >
  <td
    onclick={() => {
      if (selectable) {
        onclick?.({ ...item });
      }
    }}
    class="px-6 py-8">{formatDateTime(new Date(item.time_start))}</td
  >
  <td
    onclick={() => {
      if (selectable) {
        onclick?.({ ...item });
      }
    }}
    class="px-6 py-8">{formatDateTime(new Date(item.time_end))}</td
  >
  <td
    onclick={() => {
      if (selectable) {
        onclick?.({ ...item });
      }
    }}
    class="px-6 py-8">{new Date(item.created_at).toLocaleString()}</td
  >
  <td class="px-6 py-8">
    {#if item.has_attendance_sheet}
      <div class="flex items-center gap-2">
        <button
          type="button"
          onclick={copyCode}
          class="flex items-center justify-center bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white px-2 py-1.5 rounded-md transition-colors"
          title={copied ? "Copied!" : "Copy code"}
        >
          <MaterialIcon icon={copied ? "check" : "content_copy"} size={1.1} />
        </button>
        <button
          type="button"
          onclick={navigateToSheet}
          class="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 border border-blue-500 text-white text-md px-3 py-1.5 rounded-md transition-colors w-fit font-mono"
          title="Go to attendance sheet (ID: {item.attendance_sheet_id})"
        >
          <MaterialIcon icon="assignment" size={1.1} />
          <span
            >{item.attendance_sheet_code ||
              `Sheet #${item.attendance_sheet_id}`}</span
          >
          <MaterialIcon icon="open_in_new" size={1} />
        </button>
      </div>
    {:else}
      <div
        role="button"
        tabindex="0"
        onclick={() => {
          if (selectable) {
            onclick?.({ ...item });
          }
        }}
        onkeydown={(e) => {
          if (selectable && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onclick?.({ ...item });
          }
        }}
        class="flex items-center gap-2 {selectable ? 'cursor-pointer' : ''}"
      >
        <MaterialIcon icon="link_off" size={1.2} />
        <span class="text-white/40">Not Linked</span>
      </div>
    {/if}
  </td>
</tr>
