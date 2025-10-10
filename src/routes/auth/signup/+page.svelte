<script lang="ts">
  import { signUpSchema } from "$lib/zod/auth_forms";
  import { signUp } from "$lib/supabase";
  import { z } from "zod";
  import { goto } from "$app/navigation";
  import type { UserPosition } from "$lib/enums";
  import Title from "../../../components/Title.svelte";

  let email = "";
  let password = "";
  let displayName = "";
  let firstName = "";
  let lastName = "";
  let position: UserPosition = "member";
  let positionTitle = "";
  let error: string | null = null;
  let loading = false;

  const positions: UserPosition[] = [
    "member",
    "committee_member",
    "officer",
    "executive",
  ];

  async function handleSubmit() {
    error = null;
    const result = signUpSchema.safeParse({
      email,
      password,
      displayName,
      firstName,
      lastName,
      position,
      positionTitle,
    });
    if (!result.success) {
      error = result.error.issues.map((e: any) => e.message).join(", ");
      return;
    }
    loading = true;
    const { error: supaError } = await signUp(email, password, {
      displayName,
      firstName,
      lastName,
      position,
      positionTitle,
    });
    loading = false;
    if (supaError) {
      error = supaError.message;
    } else {
      goto("/auth/verification");
    }
  }
</script>

<form
  class="w-5/6 md:min-w-100 backdrop-blur-webkit overflow-hidden md:w-1/3 p-8 bg-white/10 rounded-xl shadow space-y-6 border-2 border-white/10"
  on:submit|preventDefault={handleSubmit}
>
  <h2 class="text-2xl font-bold mb-4 text-white">Sign Up</h2>
  {#if error}
    <div
      class="bg-yellow-900 text-yellow-200 border border-yellow-700 p-2 rounded-md"
    >
      {error}
    </div>
  {/if}
  <div>
    <label for="displayName"
      ><Title className="opacity-70">Display Name</Title></label
    >
    <input
      id="displayName"
      class="w-full opacity-70 border-2 my-2 border-white text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-900 rounded-full px-4 py-2 transition-colors placeholder-white"
      type="text"
      bind:value={displayName}
      required
      placeholder="Enter your display name"
    />
  </div>
  <div>
    <label for="firstName"
      ><Title className="opacity-70">First Name</Title></label
    >
    <input
      id="firstName"
      class="w-full opacity-70 border-2 my-2 border-white text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-900 rounded-full px-4 py-2 transition-colors placeholder-white"
      type="text"
      bind:value={firstName}
      required
      placeholder="Enter your first name"
    />
  </div>
  <div>
    <label for="lastName"><Title className="opacity-70">Last Name</Title></label
    >
    <input
      id="lastName"
      class="w-full opacity-70 border-2 my-2 border-white text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-900 rounded-full px-4 py-2 transition-colors placeholder-white"
      type="text"
      bind:value={lastName}
      required
      placeholder="Enter your last name"
    />
  </div>
  <div>
    <label for="position"><Title className="opacity-70">Position</Title></label>
    <div class="relative">
      <select
        id="position"
        class="w-full opacity-70 border-2 my-2 border-white text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-900 rounded-full px-4 py-2 transition-colors appearance-none pr-10 backdrop-blur-webkit bg-black/30"
        bind:value={position}
        required
        style="-webkit-appearance: none; -moz-appearance: none; appearance: none;"
      >
        {#each positions as pos}
          <option value={pos}
            >{pos
              .replace("_", " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}</option
          >
        {/each}
      </select>
      <svg
        class="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  </div>
  <div>
    <label for="positionTitle"
      ><Title className="opacity-70">Position Title</Title></label
    >
    <input
      id="positionTitle"
      class="w-full opacity-70 border-2 my-2 border-white text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-900 rounded-full px-4 py-2 transition-colors placeholder-white"
      type="text"
      bind:value={positionTitle}
      required
      placeholder="Enter your position title"
    />
  </div>
  <div>
    <label for="email"><Title className="opacity-70">Email</Title></label>
    <input
      id="email"
      class="w-full opacity-70 border-2 my-2 border-white text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-900 rounded-full px-4 py-2 transition-colors placeholder-white"
      type="email"
      bind:value={email}
      required
      autocomplete="email"
      placeholder="Enter your email"
    />
  </div>
  <div>
    <label for="password"><Title className="opacity-70">Password</Title></label>
    <input
      id="password"
      class="w-full opacity-70 border-2 my-2 border-white text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-900 rounded-full px-4 py-2 transition-colors placeholder-white"
      type="password"
      bind:value={password}
      required
      autocomplete="new-password"
      placeholder="Enter your password"
    />
  </div>
  <button
    class="w-full bg-gradient-to-r bg-white border-2 border-white/10 text-black font-semibold py-2 rounded-full hover:bg-white/70 transition-colors disabled:opacity-50 shadow-sm"
    type="submit"
    disabled={loading}
  >
    {loading ? "Signing up..." : "Sign Up"}
  </button>
  <div class="text-center mt-4">
    <a href="/auth/signin" class="text-white/70 hover:underline"
      >Already have an account? Sign In</a
    >
  </div>
</form>

<style>
  select {
    /* Remove default arrow in Firefox */
    background-image: none !important;
  }

  select option {
    background-color: rgba(15, 23, 42, 0.95); /* Dark background for options */
    color: white;
    padding: 8px 12px;
    border: none;
  }

  select option:hover,
  select option:focus {
    background-color: rgba(30, 41, 59, 0.95); /* Slightly lighter on hover */
  }

  select option:checked {
    background-color: rgba(
      59,
      130,
      246,
      0.8
    ); /* Blue background for selected */
  }
</style>
