<script>
  import pfpinDark from '$lib/assets/pfpin-dark.json?raw';
  import pfpinLight from '$lib/assets/pfpin-light.json?raw';
  import { theme, toggleTheme } from '$lib/js/theme';
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
      <a href="/"><h1>Tech Quests</h1></a>
      <button class="pfpstart" on:click={toggleTheme} aria-label="Toggle theme"></button>
    </div>
    <p>The saga of a SRE sharing his technological adventures.</p>
    <nav>
      <a class="nav" href="/projects">
        <span class="arrow">&nbsp;></span><span class="slash">/</span>Projects
      </a>
      <a class="nav" href="/blog">
        <span class="arrow">&nbsp;></span><span class="slash">/</span>Blog
      </a>
      <a class="nav" href="/videos">
        <span class="arrow">&nbsp;></span><span class="slash">/</span>Videos
      </a>
      <a class="nav" href="/about">
        <span class="arrow">&nbsp;></span><span class="slash">/</span>About
      </a>
      <a class="nav" href="/contact">
        <span class="arrow">&nbsp;></span><span class="slash">/</span>Contact
      </a>
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
    display: inline-flex;
    height: $font-3xl;
    aspect-ratio: 800 / 410;
    background: none;
    padding: 0;

    :global(svg) {
      width: 100% !important;
      height: 100% !important;
    }
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
      font-family: $font-family-mono;
    }
  }

  p {
    font-size: $font-sm;
    margin: $spacing-lg 0;
  }

  @media (max-width: $breakpoint-mobile) {
    nav {
      flex-direction: column;
      gap: $spacing-md;
    }
    .row {
      gap: $spacing-lg;
      align-items: center;
    }
    h1 {
      font-size: $font-2xl;
    }
    .pfpstart {
      width: auto;
      height: $font-2xl;
      aspect-ratio: 800 / 410;
      margin: 0;
      flex-shrink: 0;
      visibility: visible;
    }
  }
</style>
