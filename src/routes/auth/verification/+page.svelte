<script>
  import { Styles } from "$lib/styles";
  import Title from "../../../components/Title.svelte";
</script>

<div
  class="bg-slate-900 flex items-center gap-4 justify-center flex-col py-8 px-12 border rounded-md border-slate-700"
>
  <Title>Verification sent</Title>
  <span class="text-blue-100 opacity-70">
    A verification email has been sent to the email address that you have
    provided!</span
  >
  <a href="/auth/signin" class="{Styles.button.primary} px-4 mt-4 py-2"
    >Proceed to sign in</a
  >
</div>
