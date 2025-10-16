<script lang="ts">
  import Title from "./Title.svelte";

  let { title, shown = $bindable(false), onClose = null, children } = $props();

  let mouseDownOnBackdrop = $state(false);

  function handleClose() {
    if (onClose) {
      onClose();
    } else {
      shown = false;
    }
  }

  function handleBackdropMouseDown(e: MouseEvent) {
    // Only set to true if the mousedown is on the backdrop itself
    if (e.target === e.currentTarget) {
      mouseDownOnBackdrop = true;
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    // Only close if both mousedown and mouseup happened on the backdrop
    if (e.target === e.currentTarget && mouseDownOnBackdrop) {
      handleClose();
    }
    mouseDownOnBackdrop = false;
  }
</script>

{#if shown}
  <div
    role="dialog"
    tabindex="-1"
    onkeydown={(e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    }}
    onmousedown={handleBackdropMouseDown}
    onclick={handleBackdropClick}
    class="absolute top-0 left-0 bg-black/50 w-screen h-screen flex items-center justify-center z-20"
  >
    <div
      onkeydown={(e) => {
        if (e.key === "Escape") {
          handleClose();
        }
      }}
      role="dialog"
      tabindex="-1"
      onclick={(e) => {
        e.stopPropagation();
      }}
      class="bg-slate-900 border lg:w-1/2 w-5/6 flex-col flex items-center justify-center border-slate-700 rounded-lg px-4 py-2"
    >
      <div class="w-full"><Title className="text-lg">{title}</Title></div>
      {@render children()}
    </div>
  </div>
{/if}
