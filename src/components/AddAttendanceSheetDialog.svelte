<script lang="ts">
  import Dialog from "./Dialog.svelte";
  import { createAttendanceSheetSchema } from "$lib/zod/attendance_forms";
  import { createRow, readRows } from "$lib/supabase";
  import { currentUser } from "$lib/stores/user";
  import { onMount } from "svelte";
  import type { Event as AppEvent } from "$lib/types";

  let {
    shown = $bindable(false),
    onSuccess,
  }: {
    shown: boolean;
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
  let errors = $state<Record<string, string>>({});
  let isSubmitting = $state(false);
  let loadingEvents = $state(false);

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

  onMount(() => {
    if (shown) {
      loadEvents();
    }
  });

  function resetForm() {
    formData = {
      name: "",
      event_id: undefined,
      locked: false,
      private: false,
      code: "",
    };
    errors = {};
    isSubmitting = false;
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!$currentUser.isAuthenticated || !$currentUser.auth) {
      errors.form = "You must be logged in to create attendance sheets";
      return;
    }

    isSubmitting = true;
    errors = {};

    try {
      // Validate form data with Zod
      const validatedData = createAttendanceSheetSchema.parse(formData);

      // Create the attendance sheet
      const { error } = await createRow("attendance_sheets", {
        name: validatedData.name,
        for_event: validatedData.event_id || null,
        locked: validatedData.locked,
        private: validatedData.private,
        code: validatedData.code?.trim() || null,
      });

      if (error) {
        errors.form = error.message;
        return;
      }

      // Success
      resetForm();
      shown = false;
      onSuccess?.();
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        error.errors.forEach((err: any) => {
          errors[err.path[0]] = err.message;
        });
      } else {
        errors.form = error.message || "An unexpected error occurred";
      }
    } finally {
      isSubmitting = false;
    }
  }

  // Reset form when dialog is opened
  $effect(() => {
    if (shown) {
      resetForm();
      loadEvents();
    }
  });
</script>

<Dialog title="Create New Attendance Sheet" bind:shown>
  <form onsubmit={handleSubmit} class="space-y-4 w-full px-4 py-4">
    {#if errors.form}
      <div class="bg-red-900 text-red-200 border border-red-700 p-3 rounded-md">
        {errors.form}
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
        placeholder="Enter sheet name (e.g., RT-Weekly Meeting, M-Board Meeting)"
        required
      />
      {#if errors.name}
        <p class="text-red-400 text-sm mt-1">{errors.name}</p>
      {/if}
      <p class="text-slate-400 text-xs mt-1">
        Use prefixes: RT- for Room Tambayan, M- for Meetings
      </p>
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
      {#if errors.event_id}
        <p class="text-red-400 text-sm mt-1">{errors.event_id}</p>
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
        Access Code (Optional)
      </label>
      <input
        type="text"
        id="code"
        bind:value={formData.code}
        placeholder="Enter access code for this sheet"
        class="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
      />
      <p class="text-slate-400 text-xs mt-1">
        Users will enter this code to log their attendance
      </p>
    </div>

    <div class="flex justify-center pt-4 gap-2">
      <button
        type="submit"
        class="bg-blue-700 hover:bg-blue-600 w-28 py-2 px-4 rounded-lg duration-200 border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating..." : "Create"}
      </button>
      <button
        type="button"
        onclick={() => (shown = false)}
        class="bg-slate-800 py-2 px-4 border w-28 border-slate-600 hover:bg-slate-700 rounded-lg duration-200 disabled:opacity-50 whitespace-nowrap text-white"
        disabled={isSubmitting}
      >
        Cancel
      </button>
    </div>
  </form>
</Dialog>
