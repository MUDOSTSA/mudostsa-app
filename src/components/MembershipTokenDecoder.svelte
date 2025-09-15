<script lang="ts">
  import { verifyEncryptedMembershipToken } from "$lib/crypto";

  let {
    onResult,
  }: {
    onResult?: (result: any) => void;
  } = $props();

  let input = $state("");
  let result = $state<any>(null);
  let isProcessing = $state(false);

  async function processToken() {
    if (!input.trim()) return;

    isProcessing = true;
    result = null;

    try {
      const verificationResult = verifyEncryptedMembershipToken(input.trim());
      result = verificationResult;
      onResult?.(verificationResult);
    } catch (error) {
      result = {
        error: error instanceof Error ? error.message : "Invalid token",
        isValid: false,
      };
      onResult?.(result);
    } finally {
      isProcessing = false;
    }
  }

  function clearInput() {
    input = "";
    result = null;
  }
</script>

<div class="space-y-4">
  <div>
    <label for="token-input" class="block text-white/80 text-sm mb-2">
      MUDOSTSA Encrypted Token
    </label>
    <div class="relative">
      <textarea
        id="token-input"
        bind:value={input}
        placeholder="Paste encrypted membership token or scan QR code data..."
        class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 pr-10"
        rows="3"
        aria-describedby="token-input-hint"
      ></textarea>
      <p id="token-input-hint" class="sr-only">
        Paste an encrypted MUDOSTSA membership token to verify its authenticity
      </p>
      {#if input}
        <button
          onclick={clearInput}
          class="absolute top-2 right-2 text-white/40 hover:text-white/80 transition-colors"
          title="Clear input"
          aria-label="Clear token input field"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      {/if}
    </div>
  </div>

  <div class="flex gap-2">
    <button
      onclick={processToken}
      disabled={!input.trim() || isProcessing}
      class="bg-blue-700 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white text-sm transition-colors flex items-center gap-2"
    >
      {#if isProcessing}
        <div
          class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
        ></div>
        Processing...
      {:else}
        🔍 Verify Token
      {/if}
    </button>
  </div>

  {#if result}
    <div
      class="p-4 rounded-lg border {result.error
        ? 'bg-red-900/20 border-red-500/50'
        : 'bg-green-900/20 border-green-500/50'}"
      role="alert"
      aria-live="polite"
    >
      {#if result.error}
        <div class="text-red-400">
          <p class="font-semibold flex items-center gap-2">
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            Invalid Token
          </p>
          <p class="text-sm mt-1 text-red-300">{result.error}</p>
        </div>
      {:else}
        <div class="text-green-400">
          <p class="font-semibold flex items-center gap-2">
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            Valid MUDOSTSA Member
          </p>
          <dl class="text-sm mt-3 space-y-2 text-green-100">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt class="text-green-300">Name:</dt>
                <dd class="font-medium ml-2">{result.membershipInfo.name}</dd>
              </div>
              <div>
                <dt class="text-green-300">ID:</dt>
                <dd class="font-medium ml-2">#{result.membershipInfo.id}</dd>
              </div>
              <div>
                <dt class="text-green-300">Position:</dt>
                <dd class="font-medium ml-2">
                  {result.membershipInfo.position || "N/A"}
                </dd>
              </div>
              <div>
                <dt class="text-green-300">Token Age:</dt>
                <dd class="font-medium ml-2">
                  {result.hoursOld.toFixed(1)} hours
                </dd>
              </div>
            </div>
            <div class="pt-2 border-t border-green-500/30">
              <dt class="text-green-300">Generated:</dt>
              <dd class="font-medium ml-2">
                {new Date(result.timestamp).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      {/if}
    </div>
  {/if}
</div>
