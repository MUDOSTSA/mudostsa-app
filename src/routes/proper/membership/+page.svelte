<script lang="ts">
  import { currentUser } from "$lib/stores/user";
  import QRCode from "qrcode";
  import { createEncryptedMembershipToken } from "$lib/crypto";
  import type { MembershipInfo } from "$lib/types";
  import { onMount } from "svelte";

  let membershipInfo: MembershipInfo = $state({
    id: $currentUser.auth?.id || "NULL",
    position: $currentUser.profile?.position || "Member",
    name:
      [$currentUser.profile?.first_name, $currentUser.profile?.last_name]
        .join(" ")
        .trim() || "Unnamed Account",
    active: $currentUser.profile?.membership || false,
  });

  // Create encrypted membership token
  let encryptedToken = $state("");
  let dataURL = $state("");
  // Generate encrypted token
  $effect(() => {
    try {
      encryptedToken = createEncryptedMembershipToken(
        $currentUser.auth?.id || "INVALID_ID"
      );
    } catch (error) {
      console.error("Failed to create encrypted token:", error);
    }
  });
  $effect(() => {
    if (encryptedToken) {
      QRCode.toDataURL(encryptedToken, {
        errorCorrectionLevel: "H",
      })
        .then((url) => {
          dataURL = url;
        })
        .catch((err) => {
          console.error("Failed to generate QR code:", err);
        });
    }
  });
</script>

<div class="max-w-4xl mx-auto p-6 space-y-6">
  <!-- Membership Information -->
  <section class="bg-slate-800 rounded-lg p-6 border border-slate-700">
    <h2 class="text-lg font-semibold text-white mb-4">
      Membership Information
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="flex flex-col gap-1">
        <span class="text-sm text-white/60">Full Name</span>
        <div class="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2">
          <span class="text-white font-medium">{membershipInfo.name}</span>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-sm text-white/60">Position</span>
        <div class="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2">
          <span class="text-white font-medium"
            >{membershipInfo.position || "Member"}</span
          >
        </div>
      </div>
    </div>

    <div class="mt-4 flex flex-col gap-1">
      <span class="text-sm text-white/60">Membership Status</span>
      <div
        class="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 w-fit"
      >
        <span class="text-white font-medium flex items-center gap-2">
          <div
            class="w-2 h-2 rounded-full {membershipInfo.active
              ? 'bg-green-500'
              : 'bg-red-500'}"
          ></div>
          {membershipInfo.active ? "Active" : "Inactive"}
        </span>
      </div>
    </div>
  </section>

  <!-- QR Code Section -->
  <section class="bg-slate-800 rounded-lg p-6 border border-slate-700">
    <h2 class="text-lg font-semibold text-white mb-4">Member QR Code</h2>
    <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
      <div class="flex items-start gap-3">
        <svg
          class="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <div>
          <p class="text-blue-200 font-medium text-sm">
            Attendance Verification
          </p>
          <p class="text-blue-200/80 text-sm mt-1">
            Please present this QR Code so that you may be logged for attendance
            during events
          </p>
        </div>
      </div>
    </div>
    <div class="flex flex-col items-center space-y-4">
      <div
        class="bg-white p-4 flex items-center justify-center rounded-lg shadow-lg"
        role="img"
        aria-label="QR Code containing encrypted membership information"
      >
        <img src={dataURL} alt="QR Code" />
      </div>
    </div>
  </section>
</div>
