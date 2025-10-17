<script lang="ts">
  import type { RoomTambayanSchedule } from "$lib/types";
  import MaterialIcon from "./MaterialIcon.svelte";
  import { goto } from "$app/navigation";

  let {
    schedules,
  }: {
    schedules: RoomTambayanSchedule[];
  } = $props();

  let currentIndex = $state(0);

  function nextSlide() {
    currentIndex = (currentIndex + 1) % schedules.length;
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + schedules.length) % schedules.length;
  }

  function goToSlide(index: number) {
    currentIndex = index;
  }

  function formatDateTime(date: Date): string {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function handleTambayanClick() {
    goto("/proper/tambayan");
  }
</script>

{#if schedules.length > 0}
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
        {#each schedules as schedule, index}
          <div class="min-w-full">
            <button
              onclick={handleTambayanClick}
              class="w-full text-left hover:bg-slate-700/50 transition-colors duration-200"
            >
              <div class="p-8 md:p-12">
                <div class="flex flex-col md:flex-row gap-6">
                  <!-- Tambayan Icon Placeholder -->
                  <div
                    class="flex-shrink-0 w-full md:w-48 h-48 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center"
                  >
                    <MaterialIcon icon="meeting_room" size={4} />
                  </div>

                  <!-- Tambayan Details -->
                  <div class="flex-1 space-y-4">
                    <div>
                      <h2
                        class="text-3xl md:text-4xl font-bold text-white mb-2"
                      >
                        {schedule.room}
                      </h2>
                      <div class="flex flex-wrap gap-4 text-sm">
                        <span
                          class="inline-flex items-center gap-1 px-3 py-1 rounded-full capitalize {schedule.campus.toLowerCase() ===
                          'intramuros'
                            ? 'bg-red-800 border-red-600'
                            : 'bg-blue-800 border-blue-600'} border"
                        >
                          <MaterialIcon icon="location_on" size={1.1} />
                          {schedule.campus}
                        </span>
                      </div>
                    </div>

                    <div class="space-y-2">
                      <div class="flex items-start gap-2 text-white/80">
                        <MaterialIcon icon="schedule" size={1.3} />
                        <div>
                          <div class="font-medium">Start:</div>
                          <div class="text-sm text-white/60">
                            {formatDateTime(schedule.time_start)}
                          </div>
                        </div>
                      </div>

                      <div class="flex items-start gap-2 text-white/80">
                        <MaterialIcon icon="schedule" size={1.3} />
                        <div>
                          <div class="font-medium">End:</div>
                          <div class="text-sm text-white/60">
                            {formatDateTime(schedule.time_end)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {#if schedule.attendance_sheet}
                      <div class="flex items-center gap-2 text-white/70">
                        <MaterialIcon icon="assignment" size={1.1} />
                        <span class="text-sm">
                          Attendance sheet available
                        </span>
                      </div>
                    {/if}

                    <div
                      class="flex items-center gap-2 text-green-400 font-medium pt-2"
                    >
                      <span>View All Schedules</span>
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
      {#if schedules.length > 1}
        <button
          onclick={prevSlide}
          class="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors duration-200 backdrop-blur-sm"
          aria-label="Previous tambayan"
        >
          <MaterialIcon icon="chevron_left" size={1.5} />
        </button>

        <button
          onclick={nextSlide}
          class="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors duration-200 backdrop-blur-sm"
          aria-label="Next tambayan"
        >
          <MaterialIcon icon="chevron_right" size={1.5} />
        </button>
      {/if}
    </div>

    <!-- Dots Indicator -->
    {#if schedules.length > 1}
      <div class="flex justify-center gap-2 mt-4">
        {#each schedules as _, index}
          <button
            onclick={() => goToSlide(index)}
            class="w-2 h-2 rounded-full transition-all duration-200 {index ===
            currentIndex
              ? 'bg-green-500 w-8'
              : 'bg-white/30 hover:bg-white/50'}"
            aria-label="Go to slide {index + 1}"
          ></button>
        {/each}
      </div>
    {/if}
  </div>
{:else}
  <div class="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
    <MaterialIcon icon="meeting_room_off" size={3} />
    <p class="text-white/60 mt-4">No upcoming room tambayans</p>
  </div>
{/if}
