<script>
  import { onMount } from 'svelte';
  import { theme } from '$lib/js/theme';
  import pfpinDark from '$lib/assets/pfpin-dark.json?raw';
  import pfpinLight from '$lib/assets/pfpin-light.json?raw';

  export let size = '2rem';

  let container;
  let lottie;
  let animation;
  let ready = false;

  $: currentTheme = $theme;

  function loadAnimation(theme) {
    if (!lottie || !container) return;

    if (animation) {
      animation.destroy();
    }

    animation = lottie.loadAnimation({
      name: 'nav-logo',
      container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: theme === 'dark' ? JSON.parse(pfpinDark) : JSON.parse(pfpinLight)
    });

    ready = true;
  }

  onMount(async () => {
    lottie = await import('lottie-web/build/player/lottie_light.min.js');
    loadAnimation(currentTheme);
  });

  $: if (lottie) {
    loadAnimation(currentTheme);
  }
</script>

<div class="logo" class:ready style={`width: ${size};`} bind:this={container}></div>

<style lang="scss">
  .logo {
    display: inline-flex;
    aspect-ratio: 800 / 410;

    :global(svg) {
      width: 100% !important;
      height: 100% !important;
    }
  }
</style>
