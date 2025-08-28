<script lang="ts">
  import { userProfile } from "$lib/stores/user";
  import type { Link } from "$lib/types";
  import { fade } from "svelte/transition";
  import type { TransitionConfig } from "svelte/transition";

  const animate = (node: Element, params?: any): TransitionConfig =>
    fade(node, { duration: 200 });

  export let collapsed = true;
  export let links: Link[] = [];
  export let selected = "home";
  export let tempExpand = false;
</script>

<nav
  onmouseenter={() => (tempExpand = true)}
  onmouseleave={() => (tempExpand = false)}
  class="{collapsed && !tempExpand
    ? 'w-18'
    : 'w-52 '} border-r border-blue-800 rounded-r-xl overflow-hidden h-screen gap-2 transition-all duration-200 p-4 flex items-start justify-start flex-col bg-blue-950"
>
  <div class="w-full flex-1 gap-2 flex items-start justify-start flex-col">
    <button
      onclick={() => (collapsed = !collapsed)}
      class="flex text-blue-100 p-2 rounded-lg opacity-80 hover:opacity-100 transition-all duration-200 hover:bg-blue-900/50 items-center justify-start"
    >
      <span class="material-icons text-sm">menu</span>
    </button>
    {#each links as link}
      <a
        href={link.href}
        class="{link.name.toLowerCase() == selected
          ? 'opacity-100 bg-blue-900/50 '
          : ''} flex w-full gap-2 text-blue-100 p-2 rounded-lg opacity-80 hover:opacity-100 transition-all duration-200 hover:bg-blue-900/50 items-center justify-start"
      >
        <span class="material-icons text-sm">{link.icon}</span>
        {#if !collapsed || tempExpand}
          <span
            transition:animate={{ duration: 200 }}
            class="text-blue-100 text-sm">{link.name}</span
          >
        {/if}
      </a>
    {/each}
  </div>
  <div
    class="bg-blue-800/50 flex gap-2 items-center border-blue-800 border w-full h-10 rounded-lg p-1"
  >
    <div
      class="rounded-full h-full aspect-square flex items-center justify-center"
    >
      <span class="material-icons account-icon text-blue-100"
        >account_circle</span
      >
    </div>
    {#if !collapsed || tempExpand}
      <div
        transition:animate={{ duration: 200 }}
        class="flex items-center gap-2 text-blue-100 w-full justify-between"
      >
        <div class="flex flex-col items-start flex-1 w-18">
          <span class="text-sm font-bold text-blue-100 truncate w-full"
            >{$userProfile?.display_name}</span
          >
          <span class="text-[10px] font-bold text-blue-100/50 truncate w-full"
            >{$userProfile?.position}</span
          >
        </div>
        <a
          href="/proper/settings"
          class="flex items-center text-blue-100/80 group hover:text-blue-100 duration-200 transition-color p-2"
          ><span
            class="material-icons group-hover:rotate-[480deg] transition-all duration-1200"
            style="font-size:20px;">settings</span
          ></a
        >
      </div>
    {/if}
  </div>
</nav>

<style>
  .account-icon {
    font-size: 28px !important;
  }
</style>
