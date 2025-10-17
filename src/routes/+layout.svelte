<script lang="ts">
  import "../global.css";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import {
    initializeAuth,
    currentUser,
    isLoadingAuth,
  } from "../lib/stores/user";
  import Throbber from "../components/Throbber.svelte";

  let { children } = $props();
  let hasAttemptedAuth = $state(false);

  onMount(async () => {
    await initializeAuth();
    hasAttemptedAuth = true;
  });

  // React to auth state changes only after auth has been attempted
  $effect(() => {
    if (hasAttemptedAuth && !$isLoadingAuth) {
      if ($currentUser.isAuthenticated) {
        goto("/proper/");
      } else {
        goto("/auth/signin");
      }
    }
  });
</script>

<div>
  {#if !hasAttemptedAuth || $isLoadingAuth}
    <div
      class="bg-slate-900 min-h-screen w-full flex items-center justify-center"
    >
      <Throbber />
    </div>
  {:else}
    {@render children()}
  {/if}
</div>
