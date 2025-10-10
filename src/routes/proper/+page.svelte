<script lang="ts">
  import {
    currentUser,
    userProfile,
    isLoadingProfile,
    userError,
  } from "$lib/stores/user";
</script>

<div class="p-4 h-full overflow-hidden">
  <div class="space-y-6">
    {#if $isLoadingProfile}
      <div class="bg-slate-800 border-slate-700 border rounded-lg p-6">
        <div class="flex items-center gap-2 text-blue-100">
          <div
            class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"
          ></div>
          <span>Loading profile...</span>
        </div>
      </div>
    {:else if $userError}
      <div class="bg-red-900 text-red-200 border border-red-700 p-6 rounded-lg">
        Error: {$userError}
      </div>
    {:else if $userProfile}
      <div class="bg-slate-800 border-slate-700 border rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4 text-white">
          Profile Information
        </h2>
        <div class="grid grid-cols-2 gap-4 text-blue-100">
          <div>
            <span class="text-blue-300 font-medium">Display Name:</span>
            <p>{$userProfile.display_name}</p>
          </div>
          <div>
            <span class="text-blue-300 font-medium">Email:</span>
            <p>{$userProfile.email}</p>
          </div>
          <div>
            <span class="text-blue-300 font-medium">First Name:</span>
            <p>{$userProfile.first_name}</p>
          </div>
          <div>
            <span class="text-blue-300 font-medium">Last Name:</span>
            <p>{$userProfile.last_name}</p>
          </div>
          <div>
            <span class="text-blue-300 font-medium">Position:</span>
            <p>{$userProfile.position}</p>
          </div>
        </div>
      </div>
    {:else}
      <div class="bg-slate-800 border-slate-700 border rounded-lg p-6">
        <div class="text-yellow-200">No profile data available</div>
      </div>
    {/if}
  </div>
</div>

<style>
  div {
    box-sizing: border-box;
  }
</style>
