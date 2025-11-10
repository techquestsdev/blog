<script>
  import '../app.scss';
  import '$lib/assets/fonts/fira-mono.css';
  import '$lib/assets/fonts/fira-code-variable.css';
  import { page } from '$app/stores';
  import PageHead from '$lib/components/PageHead.svelte';
  import Toggle from '$lib/components/Toggle.svelte';
  import LogoLight from '$lib/components/LogoLight.svelte';
  import LogoDark from '$lib/components/LogoDark.svelte';
  import Analytics from '$lib/components/Analytics.svelte';
  import { fly } from 'svelte/transition';
  import { theme } from '$lib/js/theme';

  $: currentTheme = $theme;

  export let data;

  const pages = [
    { name: 'Projects', path: '/projects' },
    { name: 'Blog', path: '/blog' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

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

<PageHead
  title={$page.error ? $page.status : $page.data.meta.title}
  description={$page.error ? $page.error.message : $page.data.meta.description}
  type={$page.data.meta.type}
  image={$page.data.meta.image ?? {
    img: {
      src: '/blog.png',
      w: 1200,
      h: 630
    }
  }}
/>

<Analytics />

<header class:home={$page.url.pathname === '/'}>
  <div class="row">
    <a href="/"><h1>Tech Quests</h1></a>
    {#if currentTheme === 'dark'}
      <a class="pfp" href="/" aria-label="homepage"><LogoDark --width="2rem" --height="2rem" /></a>
    {:else}
      <a class="pfp" href="/" aria-label="homepage"><LogoLight --width="2rem" --height="2rem" /></a>
    {/if}
  </div>
  <nav>
    {#each pages as { name, path } (path)}
      <a class="nav" href={path}>
        <span class="arrow">&nbsp;></span><span class="slash">/</span>{name}
      </a>
    {/each}
  </nav>
  <Toggle />
</header>

<div class="container">
  {#key data.pathname}
    <div
      class="transition"
      in:fly={{
        duration: 100,
        delay: 50,
        ...xy(data.pathname)
      }}
      out:fly={{
        duration: 100,
        ...xy(data.pathname, false)
      }}
    >
      <slot />
    </div>
  {/key}
</div>

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

    &.home {
      justify-content: flex-end;
      position: relative;
      z-index: $z-index-sticky;

      .row {
        display: none;
      }

      nav {
        display: none;
      }
    }

    .row {
      @include flex(row, null, center);
      gap: $spacing-xl;

      .pfp {
        display: flex;
        margin-top: $spacing-3xs;
      }

      h1 {
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
      }
    }
  }

  .container {
    height: 100%;
    display: grid;
  }

  .transition {
    grid-column-start: 1;
    grid-column-end: 2;
    grid-row-start: 1;
    grid-row-end: 2;
  }

  @media (max-width: $breakpoint-tablet) {
    header {
      padding: 0 $spacing-md;
      gap: $spacing-md;

      nav {
        gap: $spacing-md;
      }
    }
  }

  @media (max-width: $breakpoint-mobile) {
    header nav {
      display: none;
    }
  }
</style>
