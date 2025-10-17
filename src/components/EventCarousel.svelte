<script lang="ts">
  import type { Event } from "$lib/types";
  import MaterialIcon from "./MaterialIcon.svelte";
  import { goto } from "$app/navigation";

  let {
    events,
  }: {
    events: Event[];
  } = $props();

  let currentIndex = $state(0);

  function nextSlide() {
    currentIndex = (currentIndex + 1) % events.length;
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + events.length) % events.length;
  }

  function goToSlide(index: number) {
    currentIndex = index;
  }

  function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function handleEventClick(eventId: number) {
    goto(`/proper/events/${eventId}`);
  }
</script>

{#if events.length > 0}
  <div class="relative w-full">
    <!-- Main Carousel -->
    <div
      class="relative overflow-hidden rounded-xl bg-slate-800 border border-slate-700"
    >
      <!-- Slides Container -->
      <div
        class="flex transition-transform duration-500 ease-out"
        style="transform: translateX(-{currentIndex * 100}%)"
      >
        {#each events as event, index}
          <div class="min-w-full">
            <button
              onclick={() => handleEventClick(event.id)}
              class="w-full text-left hover:bg-slate-700/50 transition-colors duration-200"
            >
              <div class="p-8 md:p-12">
                <div class="flex flex-col md:flex-row gap-6">
                  <!-- Event Image/Icon Placeholder -->
                  <div
                    class="flex-shrink-0 w-full md:w-48 h-48 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
                  >
                    <MaterialIcon icon="event" size={4} />
                  </div>

                  <!-- Event Details -->
                  <div class="flex-1 space-y-4">
                    <div>
                      <h2
                        class="text-3xl md:text-4xl font-bold text-white mb-2"
                      >
                        {event.event_title}
                      </h2>
                      <div class="flex flex-wrap gap-4 text-sm text-white/60">
                        <div class="flex items-center gap-1">
                          <MaterialIcon icon="calendar_today" size={1.1} />
                          <span>{formatDate(event.event_start)}</span>
                        </div>
                        <div class="flex items-center gap-1">
                          <MaterialIcon icon="schedule" size={1.1} />
                          <span>
                            {new Date(event.event_start).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p class="text-white/80 line-clamp-3 text-base md:text-lg">
                      {event.event_description}
                    </p>

                    {#if event.event_heads && event.event_heads.length > 0}
                      <div class="flex items-center gap-2">
                        <MaterialIcon icon="person" size={1.1} />
                        <span class="text-white/60 text-sm">
                          {event.event_heads.join(", ")}
                        </span>
                      </div>
                    {/if}

                    <div
                      class="flex items-center gap-2 text-blue-400 font-medium pt-2"
                    >
                      <span>View Details</span>
                      <MaterialIcon icon="arrow_forward" size={1.2} />
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>
        {/each}
      </div>

      <!-- Navigation Arrows -->
      {#if events.length > 1}
        <button
          onclick={prevSlide}
          class="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors duration-200 backdrop-blur-sm"
          aria-label="Previous event"
        >
          <MaterialIcon icon="chevron_left" size={1.5} />
        </button>

        <button
          onclick={nextSlide}
          class="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors duration-200 backdrop-blur-sm"
          aria-label="Next event"
        >
          <MaterialIcon icon="chevron_right" size={1.5} />
        </button>
      {/if}
    </div>

    <!-- Dots Indicator -->
    {#if events.length > 1}
      <div class="flex justify-center gap-2 mt-4">
        {#each events as _, index}
          <button
            onclick={() => goToSlide(index)}
            class="w-2 h-2 rounded-full transition-all duration-200 {index ===
            currentIndex
              ? 'bg-blue-500 w-8'
              : 'bg-white/30 hover:bg-white/50'}"
            aria-label="Go to slide {index + 1}"
          ></button>
        {/each}
      </div>
    {/if}
  </div>
{:else}
  <div class="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
    <MaterialIcon icon="event_busy" size={3} />
    <p class="text-white/60 mt-4">No upcoming events</p>
  </div>
{/if}

<style>
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
