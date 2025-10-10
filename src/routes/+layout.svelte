<script lang="ts">
  import "../global.css";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { initializeAuth, currentUser } from "../lib/stores/user";

  onMount(async () => {
    await initializeAuth();
  });

  // React to auth state changes
  $: if ($currentUser.isAuthenticated) {
    goto("/proper/");
  } else {
    goto("/auth/signin");
  }
</script>

<div>
  <slot />
</div>
