<script lang="ts">
  import { signOutUser } from "$lib/stores/user";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { getVersion } from "@tauri-apps/api/app";
  import MaterialIcon from "../../../components/MaterialIcon.svelte";
  import { openUrl } from "@tauri-apps/plugin-opener";

  let currentVersion = $state("");
  let latestVersion = $state("");
  let checkingUpdates = $state(false);
  let updateError = $state("");
  let updateAvailable = $state(false);

  const GITHUB_REPO = "MUDOSTSA/mudostsa-app";
  const GITHUB_RELEASES_URL = `https://github.com/${GITHUB_REPO}/releases`;

  onMount(async () => {
    try {
      currentVersion = await getVersion();
    } catch (error) {
      console.error("Failed to get app version:", error);
      currentVersion = "Unknown";
    }
  });

  async function checkForUpdates() {
    checkingUpdates = true;
    updateError = "";
    latestVersion = "";
    updateAvailable = false;

    try {
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch latest release");
      }

      const data = await response.json();
      latestVersion = data.tag_name.replace(/^v/, ""); // Remove 'v' prefix if present

      // Compare versions
      if (compareVersions(latestVersion, currentVersion) > 0) {
        updateAvailable = true;
      }
    } catch (error: any) {
      console.error("Failed to check for updates:", error);
      updateError = error.message || "Failed to check for updates";
    } finally {
      checkingUpdates = false;
    }
  }

  function compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split(".").map(Number);
    const parts2 = v2.split(".").map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }

    return 0;
  }

  async function openReleasesPage() {
    try {
      // Use window.open for external URLs in Tauri v2
      await openUrl(GITHUB_RELEASES_URL);
    } catch (error) {
      console.error("Failed to open releases page:", error);
    }
  }

  const handleSignOut = async () => {
    const success = await signOutUser();
    if (success) {
      goto("/auth/signin");
    }
  };
</script>

<div class="p-4 h-full overflow-hidden">
  <div class="space-y-6">
    <!-- Updates Section -->
    <div class="bg-slate-800 border-slate-700 border rounded-lg p-6">
      <h2 class="text-lg font-semibold text-white mb-4">Updates</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-white">Current Version</p>
            <p class="text-xs text-slate-400 mt-1">
              {currentVersion || "Loading..."}
            </p>
          </div>
          <button
            class="bg-blue-700 hover:bg-blue-600 border border-blue-500 text-white px-4 py-2 rounded-md transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onclick={checkForUpdates}
            disabled={checkingUpdates}
          >
            <MaterialIcon icon="refresh" size={1.2} />
            {checkingUpdates ? "Checking..." : "Check for Updates"}
          </button>
        </div>

        {#if latestVersion}
          <div
            class="border rounded-md p-4 {updateAvailable
              ? 'bg-blue-900/30 border-blue-600'
              : 'bg-green-900/30 border-green-600'}"
          >
            {#if updateAvailable}
              <div class="flex items-start gap-3">
                <MaterialIcon icon="info" size={1.5} />
                <div class="flex-1">
                  <p class="text-white font-medium">
                    Update Available: v{latestVersion}
                  </p>
                  <p class="text-sm text-slate-300 mt-1">
                    A new version is available for download.
                  </p>
                  <button
                    class="mt-3 bg-blue-700 hover:bg-blue-600 border border-blue-500 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium flex items-center gap-2"
                    onclick={openReleasesPage}
                  >
                    <MaterialIcon icon="open_in_new" size={1.1} />
                    View Releases
                  </button>
                </div>
              </div>
            {:else}
              <div class="flex items-start gap-3 text-white">
                <MaterialIcon icon="check_circle" size={1.5} />
                <div>
                  <p class="text-white font-medium">You're up to date!</p>
                  <p class="text-sm text-slate-300 mt-1">
                    Version {latestVersion} is the latest version.
                  </p>
                </div>
              </div>
            {/if}
          </div>
        {/if}

        {#if updateError}
          <div class="bg-red-900/30 border border-red-600 rounded-md p-4">
            <div class="flex items-start gap-3">
              <MaterialIcon icon="error" size={1.5} />
              <div>
                <p class="text-white font-medium">Error Checking Updates</p>
                <p class="text-sm text-red-300 mt-1">{updateError}</p>
              </div>
            </div>
          </div>
        {/if}

        <div class="text-xs text-slate-400 pt-2">
          <a
            href={GITHUB_RELEASES_URL}
            onclick={(e) => {
              e.preventDefault();
              openReleasesPage();
            }}
            class="text-blue-400 hover:text-blue-300 underline"
          >
            View all releases on GitHub
          </a>
        </div>
      </div>
    </div>

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
