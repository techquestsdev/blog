<script>
  import NavLogo from '$lib/components/NavLogo.svelte';
  import { pages } from '$lib/js/nav.js';
  import { toggleTheme } from '$lib/js/theme';
  import { triggerBurst } from '$lib/js/ascii-burst.js';

  function onLogoClick(e) {
    toggleTheme();
    triggerBurst(e.clientX, e.clientY);
  }
</script>

<main>
  <div class="container">
    <div class="row">
      <a href="/"><h1>Tech Quests</h1></a>
      <button class="pfpstart" on:click={onLogoClick} aria-label="Toggle theme"><NavLogo size="4rem" /></button>
    </div>
    <p>▸ field notes of an SRE, logged from the tech wilds — <span class="m">no dragons, just YAML</span>.</p>
    <nav>
      {#each pages as { label, path } (path)}
        <a class="nav" href={path}>
          <span class="arrow" aria-hidden="true">&nbsp;></span><span class="slash" aria-hidden="true">/</span>{label}
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
