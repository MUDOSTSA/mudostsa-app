<div class="flex items-center justify-center"><span class="loader"></span></div>

<style>
  :root {
    --size: 1rem;
  }
  .loader {
    width: var(--size);
    height: var(--size);
    display: inline-block;
    position: relative;
  }
  .loader::after,
  .loader::before {
    content: "";
    box-sizing: border-box;
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    background: #fff;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0.2;
    animation: animloader 2s linear infinite;
  }
  .loader::after {
    animation-delay: 1s;
  }

  @keyframes animloader {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }
</style>
