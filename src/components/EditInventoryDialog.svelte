<script lang="ts">
  import Dialog from "./Dialog.svelte";
  import { insertInventoryItemSchema } from "$lib/zod/inventory_forms";
  import { updateRow } from "$lib/supabase";
  import { currentUser } from "$lib/stores/user";
  import type { InventoryItem } from "$lib/types";

  let {
    shown = $bindable(false),
    item = $bindable(null),
    onSuccess,
  }: {
    shown: boolean;
    item: InventoryItem | null;
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
    if (item) {
      formData = {
        name: item.name,
        description: item.description || "",
        quantity: item.quantity,
        category: item.category,
        location: item.location,
      };
    } else {
      formData = {
        name: "",
        description: "",
        quantity: 0,
        category: "",
        location: "",
      };
    }
    errors = {};
    isSubmitting = false;
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();

    if (!$currentUser.isAuthenticated || !$currentUser.auth) {
      errors.form = "You must be logged in to edit items";
      return;
    }

    if (!item) {
      errors.form = "No item selected for editing";
      return;
    }

    isSubmitting = true;
    errors = {};

    try {
      // Validate form data with Zod
      const validatedData = insertInventoryItemSchema.parse(formData);

      // Update item in database
      const updateData = {
        ...validatedData,
        last_modified_by: $currentUser.auth.id,
        updated_at: new Date().toISOString(),
      };

      const result = await updateRow("inventory", item.id, updateData);

      if (result.error) {
        errors.form = result.error.message || "Failed to update item";
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

  // Reset form when dialog opens or item changes
  $effect(() => {
    if (shown && item) {
      resetForm();
    }
  });
</script>

<Dialog bind:shown title={"Edit Item"}>
  {#if item}
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

      <!-- Item info -->
      <div class="bg-slate-900/50 border border-slate-600 rounded-lg p-3 mb-2">
        <div class="text-sm text-white/60">
          <p>Item ID: <span class="text-white font-mono">#{item.id}</span></p>
          <p>
            Created: <span class="text-white"
              >{new Date(item.created_at).toLocaleDateString()}</span
            >
          </p>
          <p>
            Last Modified: <span class="text-white"
              >{new Date(item.updated_at).toLocaleDateString()}</span
            >
          </p>
        </div>
      </div>

      <div class="flex w-full gap-2 justify-center">
        <label for="edit-name" class="flex flex-1 ml-[2px] flex-col gap-1">
          <span class="text-sm">Name</span>
          <input
            class="bg-slate-800 p-2 -ml-[2px] rounded-lg border border-slate-700 {errors.name
              ? 'border-red-500'
              : ''}"
            placeholder="Name"
            type="text"
            id="edit-name"
            name="name"
            bind:value={formData.name}
            disabled={isSubmitting}
            required
          />
          {#if errors.name}
            <span class="text-red-400 text-xs">{errors.name}</span>
          {/if}
        </label>

        <label for="edit-quantity" class="flex ml-[2px] w-24 flex-col gap-1">
          <span class="text-sm">Quantity</span>
          <input
            class="bg-slate-800 p-2 -ml-[2px] rounded-lg border border-slate-700 {errors.quantity
              ? 'border-red-500'
              : ''}"
            type="number"
            placeholder="Quantity"
            id="edit-quantity"
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

      <label for="edit-description" class="flex ml-[2px] flex-col gap-1">
        <span class="text-sm">Description</span>
        <textarea
          placeholder="Description"
          class="bg-slate-800 p-2 -ml-[2px] rounded-lg border border-slate-700 resize-none {errors.description
            ? 'border-red-500'
            : ''}"
          id="edit-description"
          name="description"
          bind:value={formData.description}
          disabled={isSubmitting}
          rows="3"
        ></textarea>
        {#if errors.description}
          <span class="text-red-400 text-xs">{errors.description}</span>
        {/if}
      </label>

      <label for="edit-category" class="flex ml-[2px] flex-col gap-1">
        <span class="text-sm">Category</span>
        <input
          placeholder="Category"
          class="bg-slate-800 p-2 -ml-[2px] rounded-lg border border-slate-700 {errors.category
            ? 'border-red-500'
            : ''}"
          type="text"
          id="edit-category"
          name="category"
          bind:value={formData.category}
          disabled={isSubmitting}
          required
        />
        {#if errors.category}
          <span class="text-red-400 text-xs">{errors.category}</span>
        {/if}
      </label>

      <label for="edit-location" class="flex ml-[2px] flex-col gap-1">
        <span class="text-sm">Location</span>
        <input
          placeholder="Location"
          class="bg-slate-800 p-2 -ml-[2px] rounded-lg border border-slate-700 {errors.location
            ? 'border-red-500'
            : ''}"
          type="text"
          id="edit-location"
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
          class="bg-blue-700 whitespace-nowrap hover:bg-blue-600 w-32 py-2 px-4 rounded-lg duration-200 border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Update Item"}
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
  {:else}
    <div class="text-center py-8 text-white/60">
      No item selected for editing
    </div>
  {/if}
</Dialog>
