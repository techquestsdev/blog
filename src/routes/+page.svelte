<script>
  import { onMount } from 'svelte';
  import NavLogo from '$lib/components/NavLogo.svelte';
  import { pages } from '$lib/js/nav.js';
  import { toggleThemeWithBurst } from '$lib/js/theme';
  import { triggerBurst } from '$lib/js/ascii-burst.js';

  onMount(() => {
    // A reveal ripple from the centre of the viewport when landing on home.
    triggerBurst(window.innerWidth / 2, window.innerHeight / 2);
  });
</script>

<main>
  <div class="container">
    <div class="row">
      <a href="/"><h1>Tech Quests</h1></a>
      <button class="pfpstart" on:click={toggleThemeWithBurst} aria-label="Toggle theme"
        ><NavLogo size="4rem" /></button
      >
    </div>
    <p>
      <span aria-hidden="true">▸</span> field notes of an SRE, logged from the tech wilds —
      <span class="m">no dragons, just YAML</span>.
    </p>
    <nav>
      {#each pages as { label, path } (path)}
        <a class="nav" href={path}>
          <span class="arrow" aria-hidden="true">&nbsp;></span><span
            class="slash"
            aria-hidden="true">/</span
          >{label}
        </a>
      {/each}
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
    background: none;
    padding: 0;
  }

  h1 {
    font-family: $font-family-display;
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

  p .m {
    color: var(--yellow);
  }

  // Staggered entrance for the hero on first load.
  .row,
  p,
  nav {
    animation: rise 0.85s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .row {
    animation-delay: 0.1s;
  }
  p {
    animation-delay: 0.28s;
  }
  nav {
    animation-delay: 0.46s;
  }

  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: none;
    }
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
      margin: 0;
      flex-shrink: 0;

      :global(.logo) {
        width: $font-2xl;
      }
    }
  }
</style>
