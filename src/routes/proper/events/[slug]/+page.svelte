<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { readRows } from "$lib/supabase";
  import type { Event } from "$lib/types";
  import { onMount } from "svelte";
  import MaterialIcon from "../../../../components/MaterialIcon.svelte";
  import Title from "../../../../components/Title.svelte";
  import Throbber from "../../../../components/Throbber.svelte";

  let event: Event | null = $state(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  // Get event ID from URL parameter
  const eventId = $derived(parseInt($page.params.slug ?? "0"));

  async function loadEvent() {
    loading = true;
    error = null;

    try {
      const result = await readRows("events", {
        id: eventId,
      });

      if (result.data && result.data.length > 0) {
        event = result.data[0] as Event;
      } else {
        error = "Event not found";
        event = null;
      }
    } catch (err) {
      console.error("Failed to load event:", err);
      error = "Failed to load event details";
      event = null;
    } finally {
      loading = false;
    }
  }

  function handleBack() {
    goto("/proper/events");
  }

  onMount(() => {
    if (!isNaN(eventId)) {
      loadEvent();
    } else {
      error = "Invalid event ID";
      loading = false;
    }
  });
</script>

<div class="p-2 sm:p-4 w-full h-full overflow-auto">
  <div class="max-w-4xl mx-auto">
    <!-- Back and Refresh Buttons -->
    <div class="flex items-center justify-end mb-4">
      <button
        onclick={loadEvent}
        class="flex items-center gap-1 px-2 text-xs hover:bg-slate-600 text-white/80 hover:text-white rounded-full transition-colors"
        title="Refresh"
      >
        <MaterialIcon icon="refresh" size={1.1} />
      </button>
    </div>

    {#if loading}
      <div class="flex items-center justify-center py-20">
        <div class="text-center text-white/60">
          <Throbber --size={"2rem"} />
          <p class="mt-4">Loading event details...</p>
        </div>
      </div>
    {:else if error}
      <div
        class="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center"
      >
        <MaterialIcon icon="error" size={3} />
        <h2 class="text-white text-xl font-bold mt-4 mb-2">Error</h2>
        <p class="text-white/70 mb-6">{error}</p>
        <button
          onclick={handleBack}
          class="bg-blue-700 hover:bg-blue-600 border border-blue-500 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Return to Events
        </button>
      </div>
    {:else if event}
      <!-- Event Details Card -->
      <div
        class="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden"
      >
        <!-- Header -->
        <div
          class="bg-gradient-to-r bg-[url(/crystal_pattern.png)] bg-blue-950 border-b border-slate-700 p-6 sm:p-8"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-blue-200 text-xs font-mono"
                  >ID: {event.id}</span
                >
              </div>
              <Title className="text-2xl sm:text-3xl">{event.event_title}</Title
              >
            </div>
          </div>

          <!-- Event Dates -->
          <div
            class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-blue-700/30 border border-blue-600 backdrop-blur-2xl rounded-lg p-4"
          >
            <div>
              <div class="flex items-center gap-2 text-blue-200 text-xs mb-1">
                <MaterialIcon icon="event_available" size={0.9} />
                <span>Start Date</span>
              </div>
              <p class="text-white font-medium">
                {new Date(event.event_start).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <div class="flex items-center gap-2 text-blue-200 text-xs mb-1">
                <MaterialIcon icon="event_busy" size={0.9} />
                <span>End Date</span>
              </div>
              <p class="text-white font-medium">
                {new Date(event.event_end).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <!-- Event Heads -->
          <div class="mt-4">
            <div class="flex items-center gap-2 text-blue-200 text-xs mb-2">
              <MaterialIcon icon="group" size={0.9} />
              <span
                >Event Head{event.event_heads && event.event_heads.length > 1
                  ? "s"
                  : ""}</span
              >
            </div>
            <p class="text-white">
              {event.event_heads && event.event_heads.length > 0
                ? event.event_heads.join(", ")
                : "No heads"}
            </p>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 sm:p-8 space-y-6">
          <!-- Description Section -->
          <div>
            <h3
              class="text-white font-semibold text-lg mb-3 flex items-center gap-2"
            >
              <MaterialIcon icon="description" size={1.3} />
              Description
            </h3>
            <div class="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <p class="text-white/80 whitespace-pre-wrap leading-relaxed">
                {event.event_description}
              </p>
            </div>
          </div>

          <!-- Metadata Section -->
          <div>
            <h3
              class="text-white font-semibold text-lg mb-3 flex items-center gap-2"
            >
              <MaterialIcon icon="info" size={1.3} />
              Details
            </h3>
            <div class="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span class="text-white/50 text-sm">Event ID</span>
                  <p class="text-white font-mono">{event.id}</p>
                </div>
                <div>
                  <span class="text-white/50 text-sm">Created</span>
                  <p class="text-white">
                    {new Date(event.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
