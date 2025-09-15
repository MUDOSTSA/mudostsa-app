<script lang="ts">
  let {
    icon,
    size,
    outlined = false,
  }: { icon: string; size: number; outlined?: boolean } = $props();
</script>

{#if outlined}
  <span class="material-symbols-outlined" style="font-size: {size}rem"
    >{icon}</span
  >
{:else}
  <span class="material-icons" style="font-size: {size}rem">{icon}</span>
{/if}
