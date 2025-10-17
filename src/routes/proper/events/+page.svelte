<script lang="ts">
  import { readRows } from "$lib/supabase";
  import type { Event } from "$lib/types";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import MaterialIcon from "../../../components/MaterialIcon.svelte";
  import Title from "../../../components/Title.svelte";
  import Throbber from "../../../components/Throbber.svelte";

  let events: Event[] = $state([]);
  let loading = $state(true);
  let searchQuery = $state("");

  // Filter events based on search query
  let filteredEvents = $derived(
    events.filter((event) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      return (
        event.event_title.toLowerCase().includes(query) ||
        event.event_description.toLowerCase().includes(query) ||
        event.event_heads?.some((head) => head.toLowerCase().includes(query))
      );
    })
  );

  async function loadEvents() {
    loading = true;
    try {
      const result = await readRows("events");
      events = result.data || [];
    } catch (error) {
      console.error("Failed to load events:", error);
      events = [];
    } finally {
      loading = false;
    }
  }

  function handleEventClick(eventId: number) {
    goto(`/proper/events/${eventId}`);
  }

  onMount(() => {
    loadEvents();
  });
</script>

<div class="p-2 sm:p-4 w-full h-full overflow-auto">
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          {#if loading}
            <Throbber />
          {/if}
        </div>
        <button
          onclick={loadEvents}
          class="flex items-center gap-1 px-2 text-xs hover:bg-slate-600 text-white/80 hover:text-white rounded-full transition-colors"
          title="Refresh"
          disabled={loading}
        >
          <MaterialIcon icon="refresh" size={1.1} />
        </button>
      </div>

      <!-- Search Bar -->
      <div class="mb-4">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search events by title, description, or event head..."
          class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      <!-- Count -->
      <div class="text-xs sm:text-sm text-white/50">
        {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
        {#if searchQuery && filteredEvents.length !== events.length}
          <span class="text-slate-500">of {events.length}</span>
        {/if}
      </div>
    </div>

    <!-- Events Grid -->
    {#if loading}
      <div class="flex items-center justify-center py-20">
        <div class="text-center text-white/60">
          <Throbber --size={"2rem"} />
          <p class="mt-4">Loading events...</p>
        </div>
      </div>
    {:else if filteredEvents.length === 0}
      <div
        class="flex flex-col items-center justify-center py-20 text-white/60"
      >
        <MaterialIcon icon="event_busy" size={3} />
        <p class="mt-4 text-lg">
          {searchQuery ? "No events match your search" : "No events available"}
        </p>
        {#if searchQuery}
          <button
            onclick={() => (searchQuery = "")}
            class="mt-4 text-blue-400 hover:text-blue-300 text-sm"
          >
            Clear search
          </button>
        {/if}
      </div>
    {:else}
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {#each filteredEvents as event}
          <button
            onclick={() => handleEventClick(event.id)}
            class="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-200 text-left group"
          >
            <!-- Event Icon -->
            <div class="flex items-center justify-between mb-3">
              <div
                class="bg-blue-600 p-2 text-white/85 rounded-lg group-hover:bg-blue-500 transition-colors"
              >
                <MaterialIcon icon="event" size={1.5} />
              </div>
              <span class="text-xs text-white/40">ID: {event.id}</span>
            </div>

            <!-- Event Title -->
            <h3
              class="text-white font-bold text-lg mb-2 line-clamp-2"
              title={event.event_title}
            >
              {event.event_title}
            </h3>

            <!-- Event Description -->
            <p
              class="text-white/70 text-sm mb-3 line-clamp-3"
              title={event.event_description}
            >
              {event.event_description}
            </p>

            <!-- Event Heads -->
            {#if event.event_heads && event.event_heads.length > 0}
              <div class="flex items-center gap-1 text-xs text-white/50 mb-2">
                <MaterialIcon icon="person" size={0.9} />
                <span class="line-clamp-1">
                  {event.event_heads.join(", ")}
                </span>
              </div>
            {/if}

            <!-- Created Date -->
            <div class="flex items-center gap-1 text-xs text-white/40 mt-auto">
              <MaterialIcon icon="schedule" size={0.9} />
              <span>{new Date(event.created_at).toLocaleDateString()}</span>
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
