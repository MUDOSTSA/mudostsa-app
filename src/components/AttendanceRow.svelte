<script lang="ts">
  import type {
    AttendanceRecordAdapter,
    MemberAttendanceRecord,
  } from "$lib/types";

  let {
    item,
    selected = false,
    selectable = false,
    onclick,
  }: {
    item: AttendanceRecordAdapter;
    selected?: boolean;
    selectable?: boolean;
    onclick?: (item: AttendanceRecordAdapter) => void;
  } = $props();

  function handleClick() {
    if (selectable && onclick) {
      onclick(item);
    }
  }
</script>

<tr
  class="border-b border-slate-700 hover:bg-slate-700/50 {selected
    ? 'bg-blue-900/30'
    : ''} {selectable ? 'cursor-pointer' : ''}"
  onclick={handleClick}
  role={selectable ? "button" : undefined}
  tabindex={selectable ? 0 : undefined}
>
  <td class="px-4 py-3 text-sm text-white font-mono">{item.id}</td>
  <td class="px-4 py-3 text-sm text-white">{item.name}</td>
  <td class="px-4 py-3 text-sm text-white">{item.student_number}</td>
  <td class="px-4 py-3 text-sm text-white">{item.program}</td>
  <td class="px-4 py-3 text-sm text-white">{item.year}</td>
  <td class="px-4 py-3 text-sm text-white">{item.committee}</td>
  <td class="px-4 py-3 text-sm text-white">{item.role}</td>
  <td class="px-4 py-3 text-sm text-white/60">
    {new Date(item.created_at).toLocaleDateString()}
    {new Date(item.created_at).toLocaleTimeString()}
  </td>
</tr>
