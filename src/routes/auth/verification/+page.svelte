<script>
  import Title from "../../../components/Title.svelte";
</script>

<div
  class="w-5/6 md:min-w-100 backdrop-blur-webkit overflow-hidden md:w-1/3 p-8 bg-white/10 rounded-xl shadow space-y-6 border-2 border-white/10"
>
  <div class="text-center space-y-4">
    <Title className="text-white text-xl ">Email Verification</Title>
    <p class="text-white/70 mt-5">
      A verification email has been sent to the email address that you have
      provided!
    </p>
    <a
      href="/auth/signin"
      class="inline-block w-full bg-gradient-to-r bg-white border-2 border-white/10 text-black font-semibold py-2 rounded-full hover:bg-white/70 transition-colors shadow-sm text-center"
    >
      Proceed to Sign In
    </a>
  </div>
</div>
