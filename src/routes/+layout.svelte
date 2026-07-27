<script>
  import '../app.scss';
  import '$lib/assets/fonts/fira-mono.css';
  import '$lib/assets/fonts/inter.css';
  import '$lib/assets/fonts/pixelify-sans.css';
  import { page, navigating } from '$app/stores';
  import PageHead from '$lib/components/PageHead.svelte';
  import AsciiField from '$lib/components/AsciiField.svelte';
  import NavLogo from '$lib/components/NavLogo.svelte';
  import Analytics from '$lib/components/Analytics.svelte';
  import { toggleThemeWithBurst } from '$lib/js/theme.js';
  import { pages } from '$lib/js/nav.js';
  import { fly } from 'svelte/transition';

  export let data;

  let prevTwoPages = ['', ''];
  $: {
    prevTwoPages = [prevTwoPages[1], data.pathname];
  }

  function xy(path, isIn = true) {
    if (path === prevTwoPages[0]) {
      return { x: 0, y: 0 };
    }

    let currDepth = path.split('/').length;
    let prevDepth = prevTwoPages[0].split('/').length;
    const getParentPath = (p) => '/' + p.split('/')[1];
    const currParent = getParentPath(path);
    const prevParent = getParentPath(prevTwoPages[0]);
    let currParentIdx = pages.findIndex((page) => page.path === currParent);
    let prevParentIdx = pages.findIndex((page) => page.path === prevParent);

    if (path === '/') {
      currParentIdx = prevParentIdx >= 0 ? prevParentIdx : 0;
      currDepth = 1;
    }
    if (prevTwoPages[0] === '/') {
      prevParentIdx = currParentIdx >= 0 ? currParentIdx : 0;
      prevDepth = 1;
    }

    // Fallback to 0 if page not found in navigation
    if (currParentIdx === -1) currParentIdx = 0;
    if (prevParentIdx === -1) prevParentIdx = 0;

    const xDiff = currParentIdx - prevParentIdx;
    const yDiff = currDepth - prevDepth;

    // Ensure we don't return NaN values
    const xValue = isNaN(xDiff) ? 0 : xDiff * 20;
    const yValue = isNaN(yDiff) ? 0 : yDiff * 20;

    // Return numeric values in pixels for the fly transition
    // Apply direction for in vs out transitions
    return {
      x: isIn ? xValue : -xValue,
      y: isIn ? yValue : -yValue
    };
  }
</script>

<AsciiField />

{#if $navigating}
  <div class="nav-progress" aria-hidden="true"></div>
{/if}

<PageHead
  title={$page.error ? $page.status : $page.data.meta.title}
  description={$page.error ? $page.error.message : $page.data.meta.description}
  type={$page.data.meta.type}
  jsonLd={$page.data.meta.jsonLd}
  image={$page.data.meta.image ?? {
    img: {
      src: '/blog.png',
      w: 1200,
      h: 630
    }
  }}
/>

<Analytics />

<a class="skip" href="#main">Skip to content</a>

{#if $page.url.pathname !== '/'}
  <header>
    <div class="row">
      <a href="/"><h1>Tech Quests</h1></a>
      <button class="pfp" on:click={toggleThemeWithBurst} aria-label="Toggle theme">
        <NavLogo size="2.5rem" />
      </button>
    </div>
    <nav>
      {#each pages as { label, path } (path)}
        <a class="nav" href={path}>
          <span class="arrow" aria-hidden="true">&nbsp;></span><span
            class="slash"
            aria-hidden="true">/</span
          >{label}<span class="path" aria-hidden="true">{path}</span>
        </a>
      {/each}
    </nav>
  </header>
{/if}

<div class="container">
  {#key data.pathname}
    <div
      class="transition"
      in:fly={{
        duration: 260,
        delay: 60,
        ...xy(data.pathname)
      }}
      out:fly={{
        duration: 150,
        ...xy(data.pathname, false)
      }}
    >
      <div id="main" class="page" role="main">
        <slot />
      </div>
    </div>
  {/key}
</div>

{#if $page.url.pathname !== '/'}
  <footer class="site-footer">
    <span><span aria-hidden="true">⚔</span> forged in vim &amp; regret</span>
    <a class="external" href="/contact"
      >send a raven <span class="arrow" aria-hidden="true">❯</span></a
    >
  </footer>
{/if}

<style lang="scss">
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 $spacing-7xl;
    height: $spacing-8xl;
    overflow: hidden;
    transition: transform 0.1s ease;
    transform: translateY(0);
    flex-shrink: 0;

    .row {
      @include flex(row, null, center);
      gap: $spacing-xl;

      .pfp {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      h1 {
        font-family: $font-family-display;
        font-size: $font-base;
        color: var(--txt);
        margin: 0;
      }
    }

    nav {
      display: flex;
      gap: $spacing-4xl;

      a {
        font-size: $font-base;
        font-family: $font-family-mono;

        .path {
          color: var(--txt-3);
          margin-left: 0.4ch;
          font-size: 0.8em;
        }
      }
    }
  }

  .container {
    flex: 1 0 auto;
    display: grid;
  }

  // Indeterminate top progress bar shown while navigating between pages.
  .nav-progress {
    position: fixed;
    top: 0;
    left: 0;
    height: 2px;
    width: 100%;
    z-index: $z-index-modal;
    background: linear-gradient(90deg, transparent, var(--green), transparent);
    animation: nav-slide 0.9s ease-in-out infinite;
  }

  @keyframes nav-slide {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(100%);
    }
  }

  .site-footer {
    display: flex;
    justify-content: space-between;
    gap: $spacing-md;
    flex-wrap: wrap;
    padding: $spacing-xl $spacing-7xl;
    font-family: $font-family-mono;
    font-size: $font-xs;
    color: var(--txt-3);
    border-top: 1px solid var(--bg-3);

    a {
      color: var(--txt-3);
    }
    a:hover {
      color: var(--txt);
    }

    @media (max-width: $breakpoint-tablet) {
      padding: $spacing-xl;
    }
  }

  .skip {
    position: absolute;
    left: $spacing-md;
    top: $spacing-md;
    padding: $spacing-xs $spacing-md;
    background: var(--bg-2);
    color: var(--txt);
    border: 1px solid var(--bg-3);
    z-index: $z-index-sticky;
    transform: translateY(-200%);
    transition: transform 0.2s ease;
  }

  .skip:focus-visible {
    transform: translateY(0);
  }

  .transition {
    grid-column-start: 1;
    grid-column-end: 2;
    grid-row-start: 1;
    grid-row-end: 2;
  }

  .page {
    height: 100%;
  }

  // Below desktop: drop the faint /path hints and shrink the nav so the five
  // themed labels keep fitting as the viewport narrows.
  @media (max-width: $breakpoint-desktop) {
    header nav {
      gap: $spacing-xl;

      a {
        font-size: $font-sm;

        .path {
          display: none;
        }
      }
    }
  }

  @media (max-width: $breakpoint-tablet) {
    header {
      padding: 0 $spacing-xl;
      gap: $spacing-md;

      nav {
        gap: $spacing-md;

        a {
          font-size: $font-xs;
        }
      }
    }
  }

  @media (max-width: $breakpoint-mobile) {
    header nav {
      display: none;
    }
  }
</style>
