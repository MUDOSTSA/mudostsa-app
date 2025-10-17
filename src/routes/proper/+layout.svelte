<script lang="ts">
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  import { readNavigationLinks } from "$lib/supabase";
  import NavigationBar from "../../components/NavigationBar.svelte";
  import MaterialIcon from "../../components/MaterialIcon.svelte";
  import type { Link } from "$lib/types";
  import Title from "../../components/Title.svelte";
  import { navigationStack } from "$lib/stores/navigation";
  import Throbber from "../../components/Throbber.svelte";

  let { children } = $props();
  let links: Link[] = $state([]);
  let loading = $state(true);
  let canGoBack = $state(false);
  let currentUrl = $state("");
  let isNavigatingBack = false;

  // Subscribe to navigation stack
  $effect(() => {
    const unsubscribe = navigationStack.subscribe((stack) => {
      canGoBack = stack.length > 0;
    });
    return unsubscribe;
  });

  // Track current page and add to stack
  $effect(() => {
    const url = page.url.pathname;
    const title = page.data.title || "Page";

    // Only push if the URL has changed and we're not navigating back
    if (url !== currentUrl && !isNavigatingBack) {
      // Push the previous page to the stack before navigating
      if (currentUrl) {
        navigationStack.push(currentUrl, page.data.title || "Page");
      }
      currentUrl = url;
    } else if (isNavigatingBack) {
      // Just update the current URL without pushing
      currentUrl = url;
      isNavigatingBack = false;
    }
  });

  async function handleBack() {
    const previousPage = navigationStack.pop();
    if (previousPage) {
      // Set flag to prevent pushing during back navigation
      isNavigatingBack = true;
      await goto(previousPage.url);
    }
  }

  onMount(async () => {
    try {
      const { data: linksData } = await readNavigationLinks();
      links = linksData || [];
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>{page.data.title}</title>
</svelte:head>
<div class="bg-slate-900 min-h-dvh w-full flex">
  {#if loading}
    <div class="flex-1 flex items-center justify-center">
      <Throbber />
    </div>
  {:else}
    <NavigationBar {links} selected={page.data.title.toLowerCase()}
    ></NavigationBar>
    <div class="flex-1 flex flex-col h-screen overflow-hidden">
      <div
        class="py-4 mx-8 px-4 border-slate-800 border-b flex items-center justify-between"
      >
        <div
          class="flex items-center transition-all duration-200 gap-3 justify-center"
        >
          {#if canGoBack}
            <button
              onclick={handleBack}
              class="text-blue-400 hover:text-blue-300 transition-colors max-h-6 h-6 w-6 rounded-full hover:bg-slate-800"
              aria-label="Go back"
            >
              <MaterialIcon icon="arrow_back" size={1.5} />
            </button>
          {/if}
          <div class="text-blue-100 transition-all duration-200">
            <Title className="text-xl">{page.data.title}</Title>
          </div>
        </div>
      </div>
      <div class="flex-1 overflow-auto">
        {@render children()}
      </div>
    </div>
  {/if}
</div>
