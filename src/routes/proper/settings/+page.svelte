<script>
  import { signOutUser } from "$lib/stores/user";
  import { goto } from "$app/navigation";

  const handleSignOut = async () => {
    const success = await signOutUser();
    if (success) {
      goto("/auth/signin");
    }
  };
</script>

<div class="p-4 h-full overflow-hidden">
  <div class="space-y-6">
    <!-- Account Section -->
    <div class="bg-slate-800 border-slate-700 border rounded-lg p-6">
      <h2 class="text-lg font-semibold text-white mb-4">Account</h2>
      <div class="space-y-4">
        <button
          class="bg-red-800 hover:bg-red-700 border border-red-600 text-white px-6 py-2 rounded-md transition-colors font-medium"
          onclick={handleSignOut}
        >
          Sign Out
        </button>
        <p class="text-sm text-slate-400">
          You will be redirected to the sign in page after signing out.
        </p>
      </div>
    </div>
  </div>
</div>

<style>
  div {
    box-sizing: border-box;
  }
</style>
