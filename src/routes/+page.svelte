<script>
  import Toggle from '$lib/components/Toggle.svelte';
  import pfpinDark from '$lib/assets/pfpin-dark.json?raw';
  import pfpinLight from '$lib/assets/pfpin-light.json?raw';
  import { theme } from '$lib/js/theme';
  import { onMount } from 'svelte';

  let lottie;
  let animation;

  $: currentTheme = $theme;

  // Load animation function
  function loadAnimation(theme) {
    const node = document.querySelector('.pfpstart');

    // Destroy the existing animation to avoid multiple instances
    if (animation) {
      animation.destroy();
    }

    // Load the new animation based on the current theme
    animation = lottie.loadAnimation({
      name: 'pfp',
      container: node,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: theme === 'dark' ? JSON.parse(pfpinDark) : JSON.parse(pfpinLight)
    });
  }

  onMount(async () => {
    lottie = await import('lottie-web/build/player/lottie_light.min.js');
    loadAnimation(currentTheme);
  });

  // Watch for theme changes to reload the animation
  $: {
    if (lottie) {
      loadAnimation(currentTheme);
    }
  }
</script>

<main>
  <div class="container">
    <div class="row">
      <h1>Tech Quests</h1>
      <div class="pfpstart"></div>
    </div>
    <p>The saga of a SRE sharing his technological adventures.</p>
    <nav>
      <a class="nav" href="/projects">
        <span class="arrow">&nbsp;></span><span class="slash">/</span>Projects
      </a>
      <a class="nav" href="/blog">
        <span class="arrow">&nbsp;></span><span class="slash">/</span>Blog
      </a>
      <a class="nav" href="/about">
        <span class="arrow">&nbsp;></span><span class="slash">/</span>About
      </a>
      <a class="nav" href="/contact">
        <span class="arrow">&nbsp;></span><span class="slash">/</span>Contact
      </a>
      <Toggle />
    </nav>
  </div>
</main>

<style lang="scss">
  main {
    @include flex(row, center, center);

    height: 100%;
    max-height: calc(100vh - $spacing-10xl);
    margin: 0 $spacing-xl;
  }

  .row {
    @include flex(row, null, center);
    gap: $spacing-2xl;
  }

  .pfpstart {
    width: $spacing-6xl;
    height: $spacing-6xl;
    margin-top: $spacing-xs;
    margin-left: $spacing-base;
  }

  h1 {
    font-size: $font-3xl;
    margin: 0;
  }

  nav {
    display: flex;
    gap: $spacing-3xl;

    a {
      font-size: $font-base;
      font-family: 'Fira Mono', monospace;
    }
  }

  p {
    font-size: $font-sm;
    margin: $spacing-lg 0;
  }

  @media (max-width: $breakpoint-mobile) {
    nav {
      flex-direction: column;
      gap: $spacing-sm;
    }
    .row {
      flex-direction: column-reverse;
      gap: $spacing-sm;
      align-items: flex-start;
    }
    .pfpstart {
      visibility: hidden;
    }
  }
</style>
