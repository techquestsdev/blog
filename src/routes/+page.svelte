<script context="module">
  // Module scope persists for the whole session, so this only stays true for
  // the very first time the homepage mounts (a hard load or first SPA visit).
  // Later client-side navigations back to "/" skip the hero reveal below,
  // letting the normal page-fly transition do the work instead.
  let visited = false;
</script>

<script>
  import { onMount } from 'svelte';
  import NavLogo from '$lib/components/NavLogo.svelte';
  import { pages } from '$lib/js/nav.js';
  import { toggleThemeWithBurst } from '$lib/js/theme';
  import { triggerBurst } from '$lib/js/ascii-burst.js';

  const firstVisit = !visited;

  onMount(() => {
    if (firstVisit) {
      // A reveal ripple from the centre of the viewport when landing on home
      // for the first time only.
      triggerBurst(window.innerWidth / 2, window.innerHeight / 2);
    }
    visited = true;
  });
</script>

<main class:first-visit={firstVisit}>
  <div class="container">
    <div class="row">
      <a href="/"><h1>Tech Quests</h1></a>
      <button class="pfpstart" on:click={toggleThemeWithBurst} aria-label="Toggle theme"
        ><NavLogo size="4rem" /></button
      >
    </div>
    <p>An SRE's field notes <span class="dash">—</span> homelabs, platforms, and code.</p>
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
    font-weight: $font-weight-display;
    letter-spacing: $letter-spacing-display;
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

  .dash {
    color: var(--yellow);
  }

  // Staggered entrance for the hero, but only on the very first load — on
  // later client-side navigations back to "/" the page-level fly transition
  // already handles the reveal, so replaying this would fight with it.
  :global(.first-visit) {
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
