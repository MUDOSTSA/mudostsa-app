<script lang="ts">
  import MembershipTokenDecoder from "$lib/../components/MembershipTokenDecoder.svelte";
  
  let verificationHistory = $state<any[]>([]);

  function handleVerificationResult(result: any) {
    const historyEntry = {
      timestamp: new Date().toISOString(),
      ...result
    };
    verificationHistory = [historyEntry, ...verificationHistory.slice(0, 9)]; // Keep last 10
  }

  function clearHistory() {
    verificationHistory = [];
  }
</script>

<svelte:head>
  <title>MUDOSTSA - Membership Verification</title>
</svelte:head>

<div class="max-w-4xl mx-auto p-6 space-y-6">
  <div class="text-center">
    <h1 class="text-2xl font-bold text-white mb-2">Membership Verification</h1>
    <p class="text-white/60">Scan or verify MUDOSTSA encrypted membership tokens</p>
  </div>

  <!-- Token Decoder -->
  <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
    <h2 class="text-lg font-semibold text-white mb-4">Token Verification</h2>
    <MembershipTokenDecoder onResult={handleVerificationResult} />
  </div>

  <!-- Verification History -->
  {#if verificationHistory.length > 0}
    <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-white">Recent Verifications</h2>
        <button
          onclick={clearHistory}
          class="text-white/60 hover:text-white text-sm transition-colors"
        >
          Clear History
        </button>
      </div>
      
      <div class="space-y-3 max-h-96 overflow-y-auto">
        {#each verificationHistory as entry, index}
          <div class="bg-slate-900 rounded-lg p-4 border border-slate-600">
            <div class="flex justify-between items-start mb-2">
              <span class="text-xs text-white/60">
                {new Date(entry.timestamp).toLocaleString()}
              </span>
              <span class="text-xs px-2 py-1 rounded-full {entry.error ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}">
                {entry.error ? 'Invalid' : 'Valid'}
              </span>
            </div>
            
            {#if entry.error}
              <p class="text-red-400 text-sm">{entry.error}</p>
            {:else}
              <div class="text-sm space-y-1">
                <p class="text-white">
                  <span class="text-white/60">Name:</span> {entry.membershipInfo.name}
                </p>
                <p class="text-white">
                  <span class="text-white/60">ID:</span> #{entry.membershipInfo.id}
                </p>
                <p class="text-white">
                  <span class="text-white/60">Position:</span> {entry.membershipInfo.position || 'N/A'}
                </p>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Instructions -->
  <div class="bg-blue-900/10 border border-blue-500/30 rounded-lg p-6">
    <h3 class="text-blue-400 font-semibold mb-2">📱 How to Use</h3>
    <ul class="text-blue-200/80 text-sm space-y-1">
      <li>1. Scan a MUDOSTSA membership QR code with any QR scanner</li>
      <li>2. Copy the encrypted token from the scanner result</li>
      <li>3. Paste the token in the verification field above</li>
      <li>4. Click "Verify Token" to decrypt and validate membership</li>
      <li>5. Results show member details if the token is valid</li>
    </ul>
  </div>
</div>
