<script lang="ts">
  import Dialog from "./Dialog.svelte";
  import { insertInventoryItemSchema } from "$lib/zod/inventory_forms";
  import { createRow } from "$lib/supabase";
  import { currentUser } from "$lib/stores/user";

  let {
    shown = $bindable(false),
    onSuccess,
  }: {
    shown: boolean;
    onSuccess?: () => void;
  } = $props();

  let formData = $state({
    name: "",
    description: "",
    quantity: 0,
    category: "",
    location: "",
  });

  let errors = $state<Record<string, string>>({});
  let isSubmitting = $state(false);

  function resetForm() {
    formData = {
      name: "",
      description: "",
      quantity: 0,
      category: "",
      location: "",
    };
    errors = {};
    isSubmitting = false;
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();

    if (!$currentUser.isAuthenticated || !$currentUser.auth) {
      errors.form = "You must be logged in to add items";
      return;
    }

    isSubmitting = true;
    errors = {};

    try {
      // Validate form data with Zod
      const validatedData = insertInventoryItemSchema.parse(formData);

      // Add user tracking fields
      const inventoryItem = {
        ...validatedData,
        added_by: $currentUser.auth?.id,
        last_modified_by: $currentUser.auth?.id,
      };

      // Insert into database
      const result = await createRow("inventory", inventoryItem);

      if (result.error) {
        errors.form = result.error.message || "Failed to add item";
        return;
      }

      // Success - close dialog and notify parent
      shown = false;
      resetForm();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        // Handle Zod validation errors
        if (error.name === "ZodError") {
          const zodError = error as any;
          zodError.errors?.forEach((err: any) => {
            if (err.path?.length > 0) {
              errors[err.path[0]] = err.message;
            }
          });
        } else {
          errors.form = error.message;
        }
      } else {
        errors.form = "An unexpected error occurred";
      }
    } finally {
      isSubmitting = false;
    }
  }

  // Reset form when dialog closes
  $effect(() => {
    if (!shown) {
      resetForm();
    }
  });
</script>

<Dialog bind:shown title={"Add Item"}>
  <form
    class="flex px-4 py-4 flex-col w-full text-white gap-2"
    onsubmit={handleSubmit}
  >
    {#if errors.form}
      <div
        class="bg-red-900/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm"
      >
        {errors.form}
      </div>
    {/if}
    <div class="flex w-full gap-2 justify-center">
      <label for="name" class="flex flex-1 ml-[2px] flex-col gap-1">
        <span class="text-sm">Name</span>
        <input
          class="bg-slate-800 p-2 -ml-[2px] rounded-lg border border-slate-700 {errors.name
            ? 'border-red-500'
            : ''}"
          placeholder="Name"
          type="text"
          id="name"
          name="name"
          bind:value={formData.name}
          disabled={isSubmitting}
          required
        />
        {#if errors.name}
          <span class="text-red-400 text-xs">{errors.name}</span>
        {/if}
      </label>

      <label for="quantity" class="flex ml-[2px] w-24 flex-col gap-1">
        <span class="text-sm">Quantity</span>
        <input
          class="bg-slate-800 p-2 -ml-[2px] rounded-lg border border-slate-700 {errors.quantity
            ? 'border-red-500'
            : ''}"
          type="number"
          placeholder="Quantity"
          id="quantity"
          name="quantity"
          bind:value={formData.quantity}
          disabled={isSubmitting}
          min="0"
          required
        />
        {#if errors.quantity}
          <span class="text-red-400 text-xs">{errors.quantity}</span>
        {/if}
      </label>
    </div>
    <label for="description" class="flex ml-[2px] flex-col gap-1">
      <span class="text-sm">Description</span>
      <textarea
        placeholder="Description"
        class="bg-slate-800 p-2 -ml-[2px] rounded-lg border border-slate-700 resize-none {errors.description
          ? 'border-red-500'
          : ''}"
        id="description"
        name="description"
        bind:value={formData.description}
        disabled={isSubmitting}
        rows="3"
      ></textarea>
      {#if errors.description}
        <span class="text-red-400 text-xs">{errors.description}</span>
      {/if}
    </label>
    <label for="category" class="flex ml-[2px] flex-col gap-1">
      <span class="text-sm">Category</span>
      <input
        placeholder="Category"
        class="bg-slate-800 p-2 -ml-[2px] rounded-lg border border-slate-700 {errors.category
          ? 'border-red-500'
          : ''}"
        type="text"
        id="category"
        name="category"
        bind:value={formData.category}
        disabled={isSubmitting}
        required
      />
      {#if errors.category}
        <span class="text-red-400 text-xs">{errors.category}</span>
      {/if}
    </label>
    <label for="location" class="flex ml-[2px] flex-col gap-1">
      <span class="text-sm">Location</span>
      <input
        placeholder="Location"
        class="bg-slate-800 p-2 -ml-[2px] rounded-lg border border-slate-700 {errors.location
          ? 'border-red-500'
          : ''}"
        type="text"
        id="location"
        name="location"
        bind:value={formData.location}
        disabled={isSubmitting}
        required
      />
      {#if errors.location}
        <span class="text-red-400 text-xs">{errors.location}</span>
      {/if}
    </label>

    <div class="flex justify-center pt-4 gap-2">
      <button
        class="bg-blue-700 hover:bg-blue-600 w-28 py-2 px-4 rounded-lg duration-200 border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Adding..." : "Add Item"}
      </button>
      <button
        class="bg-slate-800 py-2 px-4 border w-28 border-slate-600 hover:bg-slate-700 rounded-lg duration-200 disabled:opacity-50"
        type="button"
        disabled={isSubmitting}
        onclick={() => (shown = false)}
      >
        Cancel
      </button>
    </div>
  </form>
</Dialog>
