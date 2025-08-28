<script lang="ts">
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { readRows } from "$lib/supabase";
  import NavigationBar from "../../components/NavigationBar.svelte";
  import type { Link } from "$lib/types";
  import { currentUser, signOutUser } from "$lib/stores/user";
  import Title from "../../components/Title.svelte";

  let { children } = $props();
  let links: Link[] = $state([]);
  let loading = $state(true);

  onMount(async () => {
    try {
      const { data: linksData } = await readRows("navigation");
      links = linksData || [];
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      loading = false;
    }
  });

  const handleSignOut = async () => {
    await signOutUser();
  };
</script>

<svelte:head>
  <title>{page.data.title}</title>
</svelte:head>
<div class="bg-slate-900 min-h-dvh w-full flex">
  {#if loading}
    <div class="flex-1 flex items-center justify-center">
      <div class="text-blue-100">Loading...</div>
    </div>
  {:else}
    <NavigationBar {links} selected={page.data.title.toLowerCase()}
    ></NavigationBar>
    <div class="flex-1 flex flex-col h-screen overflow-hidden">
      <div class="p-4 flex items-center justify-between">
        <div class="text-blue-100">
          <Title>{page.data.title}</Title>
        </div>
        <button
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          onclick={handleSignOut}
        >
          Sign out
        </button>
      </div>
      <div class="flex-1 overflow-scroll">
        {@render children()}
      </div>
    </div>
  {/if}
</div>
