<script lang="ts">
  import { userProfile } from "$lib/stores/user";
  import { readRows } from "$lib/supabase";
  import type { Event, RoomTambayanSchedule } from "$lib/types";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import MaterialIcon from "../../components/MaterialIcon.svelte";
  import Throbber from "../../components/Throbber.svelte";

  let events: Event[] = $state([]);
  let tambayans: RoomTambayanSchedule[] = $state([]);
  let loadingEvents = $state(true);
  let loadingTambayans = $state(true);

  // Get upcoming events (up to 6 for grid)
  let upcomingEvents = $derived(
    events
      .filter((event) => new Date(event.event_start) >= new Date())
      .sort(
        (a, b) =>
          new Date(a.event_start).getTime() - new Date(b.event_start).getTime()
      )
      .slice(0, 6)
  );

  // Get active tambayans (currently ongoing)
  let activeTambayans = $derived(
    tambayans
      .filter((tambayan) => {
        const now = new Date();
        return (
          now >= new Date(tambayan.time_start) &&
          now <= new Date(tambayan.time_end)
        );
      })
      .sort(
        (a, b) =>
          new Date(a.time_start).getTime() - new Date(b.time_start).getTime()
      )
  );

  // Get upcoming tambayans (future only, up to 6 for grid)
  let upcomingTambayans = $derived(
    tambayans
      .filter((tambayan) => new Date(tambayan.time_start) > new Date())
      .sort(
        (a, b) =>
          new Date(a.time_start).getTime() - new Date(b.time_start).getTime()
      )
      .slice(0, 6)
  );

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

  async function loadTambayans() {
    loadingTambayans = true;
    try {
      const result = await readRows("tambayan");
      tambayans = result.data || [];
    } catch (error) {
      console.error("Failed to load tambayans:", error);
      tambayans = [];
    } finally {
      loadingTambayans = false;
    }
  }

  onMount(() => {
    loadEvents();
    loadTambayans();
  });
</script>

<div class="p-4 md:p-6 lg:p-8 h-full overflow-auto">
  <div class="max-w-7xl mx-auto space-y-8">
    <!-- Welcome Section -->
    <div class="text-center space-y-2">
      <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
        Welcome{#if $userProfile}, {$userProfile.display_name}{/if}!
      </h1>
      <p class="text-lg md:text-xl text-white/70">MU-DOST SA Online System</p>
    </div>

    <!-- Upcoming Events Section -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl md:text-3xl font-bold text-white">
          Upcoming Events
        </h2>
        <button
          onclick={() => goto("/proper/events")}
          class="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
        >
          <span>View All Events</span>
          <MaterialIcon icon="arrow_forward" size={1.1} />
        </button>
      </div>

      {#if loadingEvents}
        <div
          class="flex items-center justify-center py-20 bg-slate-800 border border-slate-700 rounded-xl"
        >
          <div class="flex items-center gap-3 text-white/70">
            <Throbber --size="2rem" />
            <span>Loading events...</span>
          </div>
        </div>
      {:else if upcomingEvents.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each upcomingEvents as event}
            <button
              onclick={() => goto(`/proper/events/${event.id}`)}
              class="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:bg-slate-700/50 transition-colors duration-200 text-left group"
            >
              <div class="space-y-3">
                <!-- Icon -->
                <div
                  class="w-12 h-12 text-white/85 bg-gradient-to-br from-blue-600 to-sky-500 rounded-lg flex items-center justify-center"
                >
                  <MaterialIcon icon="event" size={1.5} />
                </div>

                <!-- Title -->
                <h3 class="text-lg font-bold text-white line-clamp-2">
                  {event.event_title}
                </h3>

                <!-- Date & Time -->
                <div class="space-y-1 text-xs text-white/60">
                  <div class="flex items-center gap-2">
                    <MaterialIcon icon="calendar_today" size={0.9} />
                    <span
                      >{new Date(event.event_start).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}</span
                    >
                  </div>
                  <div class="flex items-center gap-2">
                    <MaterialIcon icon="schedule" size={0.9} />
                    <span
                      >{new Date(event.event_start).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}</span
                    >
                  </div>
                </div>
              </div>
            </button>
          {/each}
        </div>
      {:else}
        <div
          class="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center"
        >
          <MaterialIcon icon="event_busy" size={3} />
          <p class="text-white/60 mt-4">No upcoming events</p>
        </div>
      {/if}
    </div>

    <!-- Active Room Tambayans Section -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2
          class="text-2xl md:text-3xl font-bold text-white flex items-center gap-2"
        >
          <span>Active Room Tambayans</span>
          <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
        </h2>
      </div>

      {#if loadingTambayans}
        <div
          class="flex items-center justify-center py-20 bg-slate-800 border border-slate-700 rounded-xl"
        >
          <div class="flex items-center gap-3 text-white/70">
            <Throbber --size="2rem" />
            <span>Loading tambayans...</span>
          </div>
        </div>
      {:else if activeTambayans.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each activeTambayans as tambayan}
            <button
              onclick={() => goto("/proper/tambayan")}
              class="bg-slate-800 border border-blue-500 ring-2 ring-sky-500/50 rounded-xl p-3 hover:bg-slate-700/50 transition-colors duration-200 text-left group relative"
            >
              <div
                class="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-blue-600 rounded-full text-xs font-medium text-white"
              >
                <span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"
                ></span>
                <span>Active Now</span>
              </div>
              <div class="space-y-2">
                <!-- Room -->
                <h3 class="text-lg font-bold text-white pr-20">
                  {tambayan.room}
                </h3>

                <!-- Campus Badge & Time Row -->
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class="inline-flex text-white items-center gap-1 px-2 py-0.5 rounded-full text-xs capitalize {tambayan.campus.toLowerCase() ===
                    'intramuros'
                      ? 'bg-red-800 border-red-600'
                      : 'bg-blue-800 border-blue-600'} border"
                  >
                    <MaterialIcon icon="location_on" size={0.9} />
                    {tambayan.campus}
                  </span>
                  <span class="text-xs text-white/60">
                    {new Date(tambayan.time_start).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <!-- Time -->
                <div class="text-xs text-white/50">
                  {new Date(tambayan.time_start).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })} - {new Date(tambayan.time_end).toLocaleTimeString(
                    "en-US",
                    {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    }
                  )}
                </div>
              </div>
            </button>
          {/each}
        </div>
      {:else}
        <div
          class="bg-slate-800 text-white/60 border border-slate-700 rounded-xl p-8 text-center"
        >
          <MaterialIcon icon="meeting_room" size={3} />
          <p class="text-white/60 mt-4">No active room tambayans right now</p>
        </div>
      {/if}
    </div>

    <!-- Upcoming Room Tambayans Section -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl md:text-3xl font-bold text-white">
          Upcoming Room Tambayans
        </h2>
        <button
          onclick={() => goto("/proper/tambayan")}
          class="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
        >
          <span>View All Schedules</span>
          <MaterialIcon icon="arrow_forward" size={1.1} />
        </button>
      </div>

      {#if loadingTambayans}
        <div
          class="flex items-center justify-center py-20 bg-slate-800 border border-slate-700 rounded-xl"
        >
          <div class="flex items-center gap-3 text-white/70">
            <Throbber --size="2rem" />
            <span>Loading tambayans...</span>
          </div>
        </div>
      {:else if upcomingTambayans.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each upcomingTambayans as tambayan}
            <button
              onclick={() => goto("/proper/tambayan")}
              class="bg-slate-800 border border-slate-700 rounded-xl p-3 hover:bg-slate-700/50 transition-colors duration-200 text-left group"
            >
              <div class="space-y-2">
                <!-- Room -->
                <h3 class="text-lg font-bold text-white">
                  {tambayan.room}
                </h3>

                <!-- Campus Badge & Time Row -->
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class="inline-flex text-white items-center gap-1 px-2 py-0.5 rounded-full text-xs capitalize {tambayan.campus.toLowerCase() ===
                    'intramuros'
                      ? 'bg-red-800 border-red-600'
                      : 'bg-blue-800 border-blue-600'} border"
                  >
                    <MaterialIcon icon="location_on" size={0.9} />
                    {tambayan.campus}
                  </span>
                  <span class="text-xs text-white/60">
                    {new Date(tambayan.time_start).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <!-- Time -->
                <div class="text-xs text-white/50">
                  {new Date(tambayan.time_start).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })} - {new Date(tambayan.time_end).toLocaleTimeString(
                    "en-US",
                    {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    }
                  )}
                </div>
              </div>
            </button>
          {/each}
        </div>
      {:else}
        <div
          class="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center"
        >
          <MaterialIcon icon="meeting_room_off" size={3} />
          <p class="text-white/60 mt-4">No upcoming room tambayans</p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  div {
    box-sizing: border-box;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
