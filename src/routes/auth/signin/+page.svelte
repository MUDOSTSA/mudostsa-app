<script lang="ts">
  import { signInSchema } from "$lib/zod/auth_forms";
  import { signIn } from "$lib/supabase";
  import { fetchUserProfile } from "$lib/stores/user";
  import { z } from "zod";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import Title from "../../../components/Title.svelte";

  let email = "";
  let password = "";
  let error: string | null = null;
  let loading = false;

  async function handleSubmit() {
    error = null;
    const result = signInSchema.safeParse({ email, password });
    if (!result.success) {
      error = result.error.issues.map((e: any) => e.message).join(", ");
      return;
    }
    loading = true;
    const { data, error: supaError } = await signIn(email, password);
    loading = false;
    if (supaError) {
      error = supaError.message;
    } else if (data?.user) {
      // Explicitly fetch user profile to ensure dashboard displays properly
      await fetchUserProfile(data.user.id);
      goto("/proper/");
    }
  }
</script>

<form
  class="w-5/6 md:min-w-100 backdrop-blur-webkit overflow-hidden md:w-1/3 p-8 bg-white/10 rounded-xl shadow space-y-6 border-2 border-white/10"
  on:submit|preventDefault={handleSubmit}
>
  <h2 class="text-2xl font-bold mb-4 text-white">Sign In</h2>
  {#if error}
    <div
      class="bg-yellow-900 text-yellow-200 border border-yellow-700 p-2 rounded-md"
    >
      {error}
    </div>
  {/if}
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
      class="w-full opacity-70 border-2 my-2 border-white text-blue-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-900 rounded-full px-4 py-2 transition-colors placeholder-white"
      type="password"
      bind:value={password}
      required
      autocomplete="current-password"
      placeholder="Enter your password"
    />
  </div>
  <button
    class="w-full bg-gradient-to-r bg-white border-2 border-white/10 text-black font-semibold py-2 rounded-full hover:bg-white/70 transition-colors disabled:opacity-50 shadow-sm"
    type="submit"
    disabled={loading}
  >
    {loading ? "Signing in..." : "Sign In"}
  </button>
  <div class="text-center mt-4">
    <a href="/auth/signup" class="text-white/70 hover:underline"
      >Don't have an account? Register</a
    >
  </div>
</form>

<style>
</style>
