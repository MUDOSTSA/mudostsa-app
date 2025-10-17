<script lang="ts">
  import Dialog from "./Dialog.svelte";
  import { updateRow, readRows } from "$lib/supabase";
  import { editAttendanceSheetSchema } from "$lib/zod/attendance_forms";
  import { onMount } from "svelte";
  import type { Event as AppEvent, AttendanceSheet } from "$lib/types";

  let {
    shown = $bindable(false),
    sheet = null,
    onSuccess,
  }: {
    shown: boolean;
    sheet: AttendanceSheet | null;
    onSuccess?: () => void;
  } = $props();

  let formData = $state({
    name: "",
    event_id: undefined as number | undefined,
    locked: false,
    private: false,
    code: "",
  });

  let events: AppEvent[] = $state([]);
  let loadingEvents = $state(false);
  let isEditing = $state(false);
  let error = $state<string | null>(null);

  // Derived state for prefix detection
  let detectedPrefix = $derived.by(() => {
    const name = formData.name.trim();
    if (name.startsWith("RT-")) return "RT-";
    if (name.startsWith("M-")) return "M-";
    return null;
  });

  function generateRandomCode() {
    const name = formData.name.trim();

    if (name.startsWith("RT-")) {
      // RT- prefix: "RT[4-digit number]"
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      return `RT${randomNum}`;
    } else if (name.startsWith("M-")) {
      // M- prefix: "MEET[4-digit number]"
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      return `MEET${randomNum}`;
    } else {
      // Default: 8 character mixed case code
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let code = "";
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    }
  }

  function handleRandomize() {
    formData.code = generateRandomCode();
  }

  async function loadEvents() {
    loadingEvents = true;
    try {
      const result = await readRows("events");
      events = result.data || [];
    } catch (error) {
      console.error("Failed to load events:", error);
      events = [];
    } finally {
      loadingEvents = false;
    }
  }

  async function handleEdit() {
    if (!sheet?.id) {
      error = "No sheet selected for editing";
      return;
    }

    isEditing = true;
    error = null;

    try {
      // Validate the form data using the edit schema
      const validatedData = editAttendanceSheetSchema.parse(formData);

      const { error: updateError } = await updateRow(
        "attendance_sheets",
        sheet.id,
        {
          name: validatedData.name,
          for_event: validatedData.event_id || null,
          locked: validatedData.locked,
          private: validatedData.private,
          code: validatedData.code?.trim() || null,
        }
      );

      if (updateError) {
        error = updateError.message;
        return;
      }

      // Success
      shown = false;
      onSuccess?.();
    } catch (err: any) {
      if (err.errors) {
        // Zod validation errors
        error = err.errors.map((e: any) => e.message).join(", ");
      } else {
        error = err.message || "An unexpected error occurred";
      }
    } finally {
      isEditing = false;
    }
  }

  // Reset form when dialog is opened/closed
  $effect(() => {
    if (shown && sheet) {
      formData = {
        name: sheet.name,
        event_id: sheet.for_event?.id,
        locked: sheet.locked,
        private: sheet.private,
        code: sheet.code || "",
      };
      error = null;
      isEditing = false;
      loadEvents();
    } else if (!shown) {
      error = null;
      isEditing = false;
    }
  });
</script>

<Dialog title="Edit Attendance Sheet" bind:shown>
  <form
    onsubmit={(e) => {
      e.preventDefault();
      handleEdit();
    }}
    class="space-y-4 w-full px-4 py-4"
  >
    {#if error}
      <div class="bg-red-900 text-red-200 border border-red-700 p-3 rounded-md">
        {error}
      </div>
    {/if}

    <div>
      <label for="name" class="block text-sm font-medium text-white mb-2">
        Sheet Name *
      </label>
      <input
        id="name"
        type="text"
        bind:value={formData.name}
        class="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500"
        placeholder="Enter sheet name"
        required
      />
      <p class="text-slate-400 text-xs mt-1">
        Use prefixes: RT- for Room Tambayan, M- for Meetings
      </p>
      {#if detectedPrefix}
        <div
          class="bg-blue-900/30 border border-blue-700/50 text-blue-200 p-2 rounded-md mt-2 text-sm"
        >
          ✓ Editing attendance sheet for <strong
            >{detectedPrefix === "RT-" ? "Room Tambayan" : "Meeting"}</strong
          >
        </div>
      {/if}
    </div>

    <div>
      <label for="event_id" class="block text-sm font-medium text-white mb-2">
        Associated Event (Optional)
      </label>
      {#if loadingEvents}
        <div class="text-white/70 text-sm">Loading events...</div>
      {:else}
        <select
          id="event_id"
          bind:value={formData.event_id}
          class="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500"
        >
          <option value={undefined}>No associated event</option>
          {#each events as event}
            <option value={event.id}
              >{event.event_title} (ID: {event.id})</option
            >
          {/each}
        </select>
      {/if}
    </div>

    <div class="space-y-3">
      <h3 class="text-sm font-medium text-white">Sheet Settings</h3>

      <label class="flex items-center space-x-3">
        <input
          type="checkbox"
          bind:checked={formData.locked}
          class="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-2"
        />
        <span class="text-white text-sm">Locked</span>
        <span class="text-slate-400 text-xs"
          >Prevent new attendance records from being added</span
        >
      </label>

      <label class="flex items-center space-x-3">
        <input
          type="checkbox"
          bind:checked={formData.private}
          class="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-2"
        />
        <span class="text-white text-sm">Private</span>
        <span class="text-slate-400 text-xs"
          >Hide this sheet from public view</span
        >
      </label>
    </div>

    <div>
      <label for="code" class="block text-sm font-medium text-white mb-2">
        Access Code *
      </label>
      <div class="flex gap-2">
        <input
          type="text"
          id="code"
          bind:value={formData.code}
          placeholder="Enter access code for this sheet"
          class="flex-1 bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
        <button
          type="button"
          onclick={handleRandomize}
          class="bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white px-4 py-2 rounded-md transition-colors whitespace-nowrap"
          title="Generate random code"
        >
          🎲 Random
        </button>
      </div>
      <p class="text-slate-400 text-xs mt-1">
        Users will enter this code to log their attendance
      </p>
    </div>

    <div class="flex justify-center gap-2 pt-4">
      <button
        type="submit"
        class="bg-blue-700 hover:bg-blue-600 w-28 py-2 px-4 rounded-lg duration-200 border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-white"
        disabled={isEditing}
      >
        {isEditing ? "Saving..." : "Save"}
      </button>
      <button
        type="button"
        onclick={() => (shown = false)}
        class="bg-slate-800 py-2 px-4 border w-28 border-slate-600 hover:bg-slate-700 rounded-lg duration-200 disabled:opacity-50 whitespace-nowrap text-white"
        disabled={isEditing}
      >
        Cancel
      </button>
    </div>
  </form>
</Dialog>
