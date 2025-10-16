<script lang="ts">
  import type { RoomTambayanSchedule } from "$lib/types";
  import MaterialIcon from "./MaterialIcon.svelte";

  let {
    item,
    selectable = false,
    selected = false,
    onclick,
  }: {
    item: RoomTambayanSchedule;
    selectable?: boolean;
    selected?: boolean;
    onclick?: (item: RoomTambayanSchedule) => any;
  } = $props();

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
</tr>

<style>
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    /* display: none; <- Crashes Chrome on hover */
    -webkit-appearance: none;
    margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
  }

  input[type="number"] {
    -moz-appearance: textfield; /* Firefox */
  }
</style>
