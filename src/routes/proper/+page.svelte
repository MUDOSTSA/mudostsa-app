<script lang="ts">
  import {
    currentUser,
    userProfile,
    isLoadingProfile,
    userError,
  } from "$lib/stores/user";
</script>

<div class="p-6 text-blue-100">
  <h1 class="text-3xl font-bold mb-6">Dashboard</h1>

  {#if $isLoadingProfile}
    <div class="flex items-center gap-2">
      <div
        class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"
      ></div>
      <span>Loading profile...</span>
    </div>
  {:else if $userError}
    <div class="bg-red-900 text-red-200 border border-red-700 p-4 rounded-md">
      Error: {$userError}
    </div>
  {:else if $userProfile}
    <div class="bg-slate-800 p-6 rounded-lg border border-slate-700">
      <h2 class="text-xl font-semibold mb-4">Profile Information</h2>
      <div class="grid grid-cols-2 gap-4">
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
    <div class="text-yellow-200">No profile data available</div>
  {/if}
</div>
