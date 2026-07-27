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
  import { quintOut } from 'svelte/easing';

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
    const xValue = isNaN(xDiff) ? 0 : xDiff * 12;
    const yValue = isNaN(yDiff) ? 0 : yDiff * 12;

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
          >{label}
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
        duration: 340,
        delay: 90,
        easing: quintOut,
        ...xy(data.pathname)
      }}
      out:fly={{
        duration: 180,
        easing: quintOut,
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
    <div class="foot-inner">
      <span class="flavor"><span aria-hidden="true">⚔</span> forged in vim &amp; regret</span>
      <div class="foot-right">
        <span class="copy">© {data.year} Tech Quests</span>
        <span class="foot-social">
          <a
            class="external"
            href="https://github.com/techquestsdev"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"><iconify-icon icon="ph:github-logo"></iconify-icon></a
          >
          <a href="/blog/rss.xml" target="_blank" rel="noopener noreferrer" aria-label="RSS feed"
            ><iconify-icon icon="ph:rss"></iconify-icon></a
          >
        </span>
      </div>
    </div>
  </footer>
{/if}

<style lang="scss">
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: $spacing-xl;
    padding: 0 $spacing-7xl;
    min-height: $spacing-8xl;
    transition: transform 0.1s ease;
    transform: translateY(0);
    flex-shrink: 0;

    .row {
      @include flex(row, null, center);
      gap: $spacing-xl;
      flex-shrink: 0;

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
        white-space: nowrap;
      }
    }

    nav {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: $spacing-sm $spacing-xl;

      a {
        font-size: $font-sm;
        font-family: $font-family-mono;
        white-space: nowrap;
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
    border-top: 1px solid var(--bg-3);
    font-family: $font-family-mono;
    font-size: $font-xs;
    color: var(--txt-3);

    a {
      color: var(--txt-3);
      text-decoration: none;
      transition: color $transition-fast;
    }
    a:hover {
      color: var(--txt);
    }

    // Constrain footer content to the page's content width and center it, so it
    // lines up with the article column instead of hugging the screen edges.
    .foot-inner {
      max-width: $width-content;
      margin: 0 auto;
      padding: $spacing-xl;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: $spacing-sm $spacing-3xl;
      flex-wrap: wrap;
    }

    .foot-right {
      display: flex;
      align-items: center;
      gap: $spacing-lg;
    }

    .foot-social {
      display: flex;
      gap: $spacing-md;
      font-size: $font-sm;

      iconify-icon {
        padding-right: 0;
        vertical-align: middle;
      }
    }

    @media (max-width: $breakpoint-tablet) {
      .foot-inner {
        flex-direction: column;
        text-align: center;
        gap: $spacing-md;
      }
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

  @media (max-width: $breakpoint-tablet) {
    header {
      padding: 0 $spacing-xl;
      gap: $spacing-md;

      nav {
        gap: $spacing-sm $spacing-md;

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
