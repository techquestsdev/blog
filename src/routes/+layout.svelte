<script>
  import '../app.scss';
  import '$lib/assets/fonts/fira-mono.css';
  import '$lib/assets/fonts/inter.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import PageHead from '$lib/components/PageHead.svelte';
  import Analytics from '$lib/components/Analytics.svelte';
  import { theme, toggleTheme, setTheme } from '$lib/js/theme.js';
  import { pages } from '$lib/js/nav.js';

  export let data;

  let menuOpen = false;
  // Close the mobile menu whenever the route changes.
  $: if (data.pathname) menuOpen = false;

  // Theme the toggle switches to; anything other than 'light' counts as dark.
  $: next = $theme === 'light' ? 'dark' : 'light';

  onMount(() => {
    // app.html's inline script set color-scheme already; sync the store so the label is right.
    const scheme = document.documentElement.getAttribute('color-scheme');
    if (scheme) setTheme(scheme);
  });

  // Theme switch: a horizontal accent line sweeps down while the new theme is revealed behind it.
  function switchTheme() {
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      toggleTheme();
      return;
    }
    const line = document.createElement('div');
    line.className = 'sweep';
    document.body.append(line);
    document.startViewTransition(() => toggleTheme()).finished.finally(() => line.remove());
  }
</script>

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

<svelte:window on:keydown={(e) => e.key === 'Escape' && (menuOpen = false)} />

<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="m" viewBox="-375 -215 770 390"
    ><g fill="none" stroke-linecap="round"
      ><path
        stroke="currentColor"
        stroke-width="30"
        d="M-350 0A155 155 0 0 1-71.9-94L71.9 94A155 155 0 1 0 71.9-94L-71.9 94"
      /><path
        style="stroke:var(--a1,currentColor)"
        stroke-width="22"
        d="M-142.5 90.9A105 105 0 0 1-285.9 52.5"
      /><path
        style="stroke:var(--a2,currentColor)"
        stroke-width="22"
        d="M124.9-192.6A205 205 0 0 1 372.5-102.5"
      /></g
    ></symbol
  >
</svg>

<header class="top">
  <div class="g">
    <a class="logo" href="/" aria-label="TechQuests home"
      ><svg class="mk" aria-hidden="true"><use href="#m" /></svg><span class="word"
        >techquests<span>.</span>dev</span
      ></a
    >
    <nav class="nav" class:open={menuOpen} id="nav" aria-label="Main">
      {#each pages as { label, path }, i (path)}
        {@const active = $page.url.pathname === path || $page.url.pathname.startsWith(path + '/')}
        <a href={path} aria-current={active ? 'page' : undefined}
          ><span class="i" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><span class="n"
            >{label}</span
          ></a
        >
      {/each}
    </nav>
    <div class="tools">
      <button
        class="iconbtn"
        data-testid="theme-toggle"
        aria-label="Switch to {next} theme"
        on:click={switchTheme}
        ><svg
          class="od-icon"
          style="--od-icon-size:20px"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
          ><circle cx="12" cy="12" r="9" /><path
            d="M12 3a9 9 0 0 1 0 18z"
            fill="currentColor"
          /></svg
        ></button
      >
      <button
        class="iconbtn menu"
        aria-label="Open menu"
        aria-expanded={menuOpen}
        aria-controls="nav"
        on:click={() => (menuOpen = !menuOpen)}
        ><svg
          class="od-icon"
          style="--od-icon-size:22px"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18" /></svg
        ></button
      >
    </div>
  </div>
</header>

<main id="main" tabindex="-1">
  <slot />
</main>

<footer>
  <div class="g">
    <div class="f1 footer-word" aria-label="TQD">TQ<span>D</span></div>
    <div class="f2">
      <span class="fg"><span class="lab">Field journal of André Nogueira</span></span>
      <span class="fg"
        ><a
          class="lab"
          href="https://github.com/techquestsdev"
          target="_blank"
          rel="noopener noreferrer">GitHub</a
        ><a
          class="lab"
          href="https://www.youtube.com/@techquestsdev"
          target="_blank"
          rel="noopener noreferrer">YouTube</a
        ><a class="lab" href="/rss.xml" target="_blank" rel="noopener noreferrer">RSS</a><a
          class="lab"
          href="https://github.com/techquestsdev/blog"
          target="_blank"
          rel="noopener noreferrer">Source ↗</a
        ></span
      >
      <span class="fg"><span class="lab">Writing CC BY 4.0 · Code MIT · © {data.year}</span></span>
    </div>
  </div>
</footer>
