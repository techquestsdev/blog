# Tech Quests — "Minimal Adventurer" Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the "Minimal Adventurer" brand theme to techquests.dev — a faint animated ASCII background, a self-drawing infinity logo (dropping Lottie), a pixel wordmark, themed lexicon, ornamental accents, project state runes, and "min journey" reading times — without touching URLs or hurting readability.

**Architecture:** Additive, component-first. New pure-JS utilities (ASCII math, reading time, project status, nav lexicon) are TDD'd in isolation, then consumed by new/rebuilt Svelte components (`AsciiField`, `NavLogo`, `SectionLabel`) that are wired into the existing SvelteKit routes. The site prerenders (`+layout.js` `prerender = true`), so reading time is computed at build via `import.meta.glob`.

**Tech Stack:** SvelteKit 2 / Svelte 5 (legacy syntax in this repo: `export let`, `$:`, `$store`), SCSS, Vitest 4 + `@testing-library/svelte` + jsdom, canvas 2D. Commits use the repo owner's `commit` wrapper (GPG-signed, `--signoff`, Conventional Commits, **no** co-author trailer).

**Conventions for every task:**
- Unit test a single file: `npx vitest run <path>`. Full unit suite: `npm run test:unit`.
- Lint/format before finishing a task touching many files: `npm run format && npm run lint`.
- Canvas/visual behavior is verified **manually** with `npm run dev` (stated explicitly where it applies) — do not claim visual correctness from code alone.
- Commit with `commit -m "<conventional message>"` (falls back to `git commit --signoff --gpg-sign` if the wrapper is unavailable).
- We are on branch `redesign/2026-05` (non-default) — stay on it.

---

## File Structure

**New files**
- `src/lib/js/nav.js` — single source of truth for nav lexicon (themed label + path).
- `src/lib/js/ascii.js` — pure math for the ASCII field (hash, value noise, contour, char pick).
- `src/lib/js/ascii-burst.js` — tiny store + `triggerBurst()` decoupling the logo click from the field.
- `src/lib/js/project-status.js` — maps a project `status` string to a rune `{glyph,label}` or `null`.
- `src/lib/utils/reading-time.js` — `countWords`, `readingJourney`.
- `src/lib/components/AsciiField.svelte` — the background canvas.
- `src/lib/components/SectionLabel.svelte` — `❖ Label ────` divider.
- `src/lib/assets/fonts/pixelify-sans.css` — `@font-face` for the display font.
- Test files colocated: `src/lib/js/ascii.test.js`, `src/lib/js/project-status.test.js`, `src/lib/js/nav.test.js`, `src/lib/utils/reading-time.test.js`, `src/lib/components/AsciiField.test.js`.

**Modified files**
- `src/variables.scss` — add `$font-family-display`.
- `src/app.scss` — wordmark/hero display font, glyph/accent styles, light-mode ASCII ink var.
- `src/routes/+layout.svelte` — import font, render `AsciiField`, themed nav, burst on logo click, footer.
- `src/routes/+page.svelte` — hero wordmark/tagline, themed nav, replace Lottie `pfpstart` with `NavLogo`, burst on click.
- `src/lib/components/NavLogo.svelte` — rebuilt as inline animated SVG (no Lottie).
- `src/routes/projects/+page.svelte` — heading "Quests", `SectionLabel` optional, project state rune.
- `src/routes/blog/+page.svelte` — heading "Chronicles", "min journey".
- `src/routes/blog/+page.js` — compute reading time via raw glob.
- `src/routes/videos/+page.svelte` — heading "Sagas".
- `src/routes/about/+page.svelte`, `src/routes/contact/+page.svelte` — themed headings.
- `src/routes/+error.svelte` — "you've wandered off the map" 404 microcopy.
- `package.json` — remove `lottie-web`.
- Delete `src/lib/assets/pfpin-dark.json`, `src/lib/assets/pfpin-light.json`.

---

## Task 1: Nav lexicon config

**Files:**
- Create: `src/lib/js/nav.js`
- Test: `src/lib/js/nav.test.js`

- [ ] **Step 1: Write the failing test**

```js
// src/lib/js/nav.test.js
import { describe, it, expect } from 'vitest';
import { pages } from './nav.js';

describe('nav pages', () => {
  it('maps every route to a themed label without changing paths', () => {
    const byPath = Object.fromEntries(pages.map((p) => [p.path, p.label]));
    expect(byPath).toEqual({
      '/projects': 'Quests',
      '/blog': 'Chronicles',
      '/videos': 'Sagas',
      '/about': 'The Adventurer',
      '/contact': 'Send a Raven'
    });
  });

  it('keeps literal paths for hints/SEO', () => {
    for (const p of pages) expect(p.path.startsWith('/')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/js/nav.test.js`
Expected: FAIL — cannot resolve `./nav.js`.

- [ ] **Step 3: Create the module**

```js
// src/lib/js/nav.js
// Single source of truth for site navigation. `label` is the themed name shown
// to users; `path` is the real (unchanged) route, also shown as a faint hint.
export const pages = [
  { label: 'Quests', path: '/projects' },
  { label: 'Chronicles', path: '/blog' },
  { label: 'Sagas', path: '/videos' },
  { label: 'The Adventurer', path: '/about' },
  { label: 'Send a Raven', path: '/contact' }
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/js/nav.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/js/nav.js src/lib/js/nav.test.js
commit -m "feat(nav): add themed lexicon config"
```

---

## Task 2: Apply lexicon to navigation & headings

**Files:**
- Modify: `src/routes/+layout.svelte` (nav block + `pages` array)
- Modify: `src/routes/+page.svelte` (nav block)
- Modify: `src/routes/projects/+page.svelte:10`, `src/routes/blog/+page.svelte:10`, `src/routes/videos/+page.svelte` (h1 headings)
- Modify: `src/routes/about/+page.svelte`, `src/routes/contact/+page.svelte` (h1 headings)

This is presentational; verified manually. No unit test.

- [ ] **Step 1: Replace the hardcoded `pages` array in `+layout.svelte`**

In `src/routes/+layout.svelte`, delete the local `const pages = [...]` (lines 14–20) and import from the config. The `xy()` transition logic references `pages` by `.path`, which is unchanged, so it keeps working. Update the nav markup to render the themed label plus a faint path hint.

Replace the import group and the array:

```svelte
  import { pages } from '$lib/js/nav.js';
```

Replace the nav block (lines ~95–102) with:

```svelte
    <nav>
      {#each pages as { label, path } (path)}
        <a class="nav" href={path}>
          <span class="arrow">&nbsp;></span><span class="slash">/</span>{label}<span
            class="path">{path}</span
          >
        </a>
      {/each}
    </nav>
```

Add to the `nav a` style block in `+layout.svelte`:

```scss
      .path {
        color: var(--txt-3);
        margin-left: 0.4ch;
        font-size: 0.8em;
      }
```

- [ ] **Step 2: Update the homepage nav in `+page.svelte`**

In `src/routes/+page.svelte`, replace the hand-written `<a class="nav">` list (lines 52–68) with a loop over the shared config, and add the import.

Add to the `<script>`:

```svelte
  import { pages } from '$lib/js/nav.js';
```

Replace the `<nav>…</nav>` block with:

```svelte
    <nav>
      {#each pages as { label, path } (path)}
        <a class="nav" href={path}>
          <span class="arrow">&nbsp;></span><span class="slash">/</span>{label}
        </a>
      {/each}
    </nav>
```

- [ ] **Step 3: Theme the section headings**

Change each list page's `<h1>` visible text (leave loader `meta.title` / SEO untouched):
- `src/routes/projects/+page.svelte:10` → `Quests <span class="count">[{data.posts.length}]</span>`
- `src/routes/blog/+page.svelte:10` → `Chronicles <span class="count">[{data.posts.length}]</span>`
- `src/routes/videos/+page.svelte` (the `<h1>…</h1>`) → `Sagas <span class="count">[…]</span>` (keep whatever count expression already exists there)
- `src/routes/about/+page.svelte` → change the page `<h1>` to `The Adventurer`
- `src/routes/contact/+page.svelte` → change the page `<h1>` to `Send a Raven`

- [ ] **Step 4: Verify manually**

Run: `npm run dev`, open `/`, `/projects`, `/blog`, `/videos`, `/about`, `/contact`.
Expected: nav shows themed labels (with faint `/path` hints in the header), page headings read Quests/Chronicles/Sagas/The Adventurer/Send a Raven, page transitions still animate, all links navigate correctly.

- [ ] **Step 5: Commit**

```bash
git add src/routes
commit -m "feat(nav): apply themed lexicon to nav and headings"
```

---

## Task 3: ASCII field math (pure functions)

**Files:**
- Create: `src/lib/js/ascii.js`
- Test: `src/lib/js/ascii.test.js`

- [ ] **Step 1: Write the failing test**

```js
// src/lib/js/ascii.test.js
import { describe, it, expect } from 'vitest';
import { hash, valueNoise, charForHash, contour } from './ascii.js';

describe('ascii math', () => {
  it('hash is deterministic and in [0,1)', () => {
    const a = hash(3, 7);
    expect(a).toBe(hash(3, 7));
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(1);
  });

  it('valueNoise is smooth and bounded to [0,1]', () => {
    const n = valueNoise(1.5, 2.25);
    expect(n).toBeGreaterThanOrEqual(0);
    expect(n).toBeLessThanOrEqual(1);
    expect(valueNoise(1.5, 2.25)).toBe(n); // deterministic
  });

  it('charForHash buckets by threshold', () => {
    expect(charForHash(0.95)).toBe('+');
    expect(charForHash(0.7)).toBe(':');
    expect(charForHash(0.1)).toBe('.');
  });

  it('contour returns abs(sin) in [0,1]', () => {
    const c = contour(2.0, 2.2);
    expect(c).toBeGreaterThanOrEqual(0);
    expect(c).toBeLessThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/js/ascii.test.js`
Expected: FAIL — cannot resolve `./ascii.js`.

- [ ] **Step 3: Implement the module**

```js
// src/lib/js/ascii.js
// Pure, deterministic helpers for the ASCII contour field. No DOM here so it is
// unit-testable; AsciiField.svelte owns the canvas + animation loop.

export function hash(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function smooth(t) {
  return t * t * (3 - 2 * t);
}

export function valueNoise(x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const tl = hash(xi, yi);
  const tr = hash(xi + 1, yi);
  const bl = hash(xi, yi + 1);
  const br = hash(xi + 1, yi + 1);
  const u = smooth(xf);
  const v = smooth(yf);
  return (tl * (1 - u) + tr * u) * (1 - v) + (bl * (1 - u) + br * u) * v;
}

export function charForHash(r) {
  return r > 0.9 ? '+' : r > 0.6 ? ':' : '.';
}

// Contour value for a cell at (col,row) given a warped signal frequency `k`.
export function contour(signal, k) {
  return Math.abs(Math.sin(signal * k));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/js/ascii.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/js/ascii.js src/lib/js/ascii.test.js
commit -m "feat(ascii): add deterministic field math utils"
```

---

## Task 4: Burst store

**Files:**
- Create: `src/lib/js/ascii-burst.js`

Trivial store; covered indirectly by the AsciiField test. No dedicated test.

- [ ] **Step 1: Create the module**

```js
// src/lib/js/ascii-burst.js
import { writable } from 'svelte/store';

// null, or { x, y, id }. `id` increments so AsciiField can detect new bursts
// without relying on Date.now() (which would break SSR/prerender determinism).
export const burst = writable(null);

let counter = 0;
export function triggerBurst(x, y) {
  counter += 1;
  burst.set({ x, y, id: counter });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/js/ascii-burst.js
commit -m "feat(ascii): add burst store for logo interaction"
```

---

## Task 5: AsciiField component

**Files:**
- Create: `src/lib/components/AsciiField.svelte`
- Test: `src/lib/components/AsciiField.test.js`

- [ ] **Step 1: Write the failing test**

```js
// src/lib/components/AsciiField.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import AsciiField from './AsciiField.svelte';

beforeEach(() => {
  // jsdom has no canvas 2D context; stub it so onMount doesn't throw.
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillText: vi.fn(),
    fillRect: vi.fn(),
    scale: vi.fn(),
    fillStyle: '',
    font: ''
  }));
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn() });
});

describe('AsciiField', () => {
  it('renders a decorative, non-interactive canvas', () => {
    const { container } = render(AsciiField);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();
    expect(canvas.getAttribute('aria-hidden')).toBe('true');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/components/AsciiField.test.js`
Expected: FAIL — cannot resolve `./AsciiField.svelte`.

- [ ] **Step 3: Implement the component**

```svelte
<!-- src/lib/components/AsciiField.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { hash, valueNoise, charForHash, contour } from '$lib/js/ascii.js';
  import { burst } from '$lib/js/ascii-burst.js';

  const CELL = 13;
  const FONT = 13;
  const G = [189, 41]; // hue, saturation of --green; lightness comes from CSS var below

  let canvas;
  let ctx;
  let w = 0;
  let h = 0;
  let raf;
  let reduced = false;
  const mouse = { x: -9999, y: -9999 };
  let ripples = [];
  let lastBurstId = 0;
  let lastT = 0;
  // Ink read from CSS so light mode ("parchment") gets a dark ink instead of teal.
  let ink = 'hsla(189, 41%, 68%, ALPHA)';

  function readInk() {
    if (typeof window === 'undefined') return;
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue('--ascii-ink')
      .trim();
    if (v) ink = v; // expected form: "h s% l%" (see app.scss)
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx = canvas.getContext('2d', { alpha: true });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    w = rect.width;
    h = rect.height;
  }

  function draw(t) {
    lastT = t;
    ctx.clearRect(0, 0, w, h);
    ctx.font = `${FONT}px 'Fira Mono', monospace`;
    const cols = Math.ceil(w / CELL);
    const rows = Math.ceil(h / CELL);
    ripples = ripples.filter((r) => (t - r.start) * 240 < Math.hypot(w, h));
    for (let cx = 0; cx < cols; cx++) {
      for (let cy = 0; cy < rows; cy++) {
        const wx = valueNoise(cx * 0.09 + t * 0.1, cy * 0.09) * 2.2;
        const sig =
          Math.sin(cx * 0.2 + t) +
          Math.sin(cy * 0.16 - t * 0.5) +
          Math.sin((cx + cy) * 0.12 + t * 0.35) +
          wx;
        const c = contour(sig, 2.0);
        if (c < 0.88) continue;
        let a = (c - 0.88) / 0.12;
        const px = cx * CELL;
        const py = cy * CELL;
        const d = Math.hypot(px - mouse.x, py - mouse.y);
        if (d < 90) a = Math.min(1, a + (1 - d / 90) * 0.5);
        for (const r of ripples) {
          const front = (t - r.start) * 240;
          const rd = Math.abs(Math.hypot(px - r.x, py - r.y) - front);
          if (rd < 40) a = Math.min(1, a + (1 - rd / 40) * 0.7);
        }
        ctx.fillStyle = ink.replace('ALPHA', (a * 0.28).toFixed(3));
        ctx.fillText(charForHash(hash(cx, cy)), px, py);
      }
    }
  }

  function loop(ts) {
    const t = (ts || 0) / 1000;
    draw(t);
    raf = requestAnimationFrame(loop);
  }

  onMount(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    readInk();
    resize();
    window.addEventListener('resize', resize);
    if (!reduced) {
      window.addEventListener('pointermove', onMove);
    }
    // Re-read ink when the theme toggles (color-scheme attribute changes).
    const obs = new MutationObserver(() => {
      readInk();
      if (reduced) draw(0);
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['color-scheme'] });

    const unsub = burst.subscribe((b) => {
      if (!b || reduced || b.id === lastBurstId) return;
      lastBurstId = b.id;
      ripples.push({ x: b.x, y: b.y, start: lastT });
    });

    if (reduced) draw(0);
    else raf = requestAnimationFrame(loop);

    return () => {
      obs.disconnect();
      unsub();
    };
  });

  function onMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }

  onDestroy(() => {
    if (raf) cancelAnimationFrame(raf);
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    }
  });
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style lang="scss">
  canvas {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
  }
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/components/AsciiField.test.js`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/AsciiField.svelte src/lib/components/AsciiField.test.js
commit -m "feat(ascii): add AsciiField background component"
```

---

## Task 6: Light-mode ASCII ink variable

**Files:**
- Modify: `src/app.scss` (`:root`, `[color-scheme='light']`, and the light `@media` block)

`AsciiField` reads `--ascii-ink` as an `hsla(...)` string containing the literal token `ALPHA`, which it substitutes per cell. Dark = teal; light = dark warm ink so it reads on parchment.

- [ ] **Step 1: Add the variable to the dark defaults**

In `src/app.scss`, inside the `:root { … }` block (after the color-var block, ~line 65), add:

```scss
  --ascii-ink: hsla(189, 41%, 68%, ALPHA);
```

Add the same line inside `[color-scheme='dark'] { … }`.

- [ ] **Step 2: Add the light override**

Inside the `@media (prefers-color-scheme: light) { :root { … } }` block and inside `[color-scheme='light'] { … }`, add:

```scss
  --ascii-ink: hsla(40, 20%, 25%, ALPHA);
```

- [ ] **Step 3: Verify manually**

Run: `npm run dev`. Toggle the theme via the logo.
Expected: background glyphs are faint teal on the dark theme and faint dark-warm on the light (parchment) theme; readable text is unaffected.

- [ ] **Step 4: Commit**

```bash
git add src/app.scss
commit -m "feat(ascii): theme-aware ink for light and dark"
```

---

## Task 7: Mount AsciiField site-wide

**Files:**
- Modify: `src/routes/+layout.svelte`

- [ ] **Step 1: Import and render**

In `src/routes/+layout.svelte` `<script>` add:

```svelte
  import AsciiField from '$lib/components/AsciiField.svelte';
```

Immediately after the opening of the template (before `<PageHead … />` is fine; it must be a top-level element), add:

```svelte
<AsciiField />
```

- [ ] **Step 2: Verify manually**

Run: `npm run dev`. Visit several routes.
Expected: a faint drifting ASCII field sits behind all content on every page; it ripples toward the cursor; content remains fully legible; with OS "reduce motion" on, the field is static.

- [ ] **Step 3: Commit**

```bash
git add src/routes/+layout.svelte
commit -m "feat(ascii): render background across all routes"
```

---

## Task 8: Rebuild NavLogo as an inline self-drawing SVG (drop Lottie)

**Files:**
- Modify (full rewrite): `src/lib/components/NavLogo.svelte`

The infinity path already exists in `static/favicon.svg` (viewBox `0 -195 800 800`, group transform `translate(400 206)`, palette teal `#27607b` / amber `#f3b366`). We reproduce it inline, stroke it with CSS variables so it themes automatically, and animate the draw with `stroke-dashoffset`. NavLogo becomes purely presentational; the click handlers in the layout/homepage own theme-toggle + burst (Task 9/10).

- [ ] **Step 1: Rewrite the component**

```svelte
<!-- src/lib/components/NavLogo.svelte -->
<script>
  export let size = '2rem';
</script>

<div class="logo" style={`width: ${size};`}>
  <svg viewBox="0 -195 800 800" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g clip-path="none" stroke-miterlimit="10" fill="none">
      <path
        class="loop"
        stroke-width="30"
        d="M-343.843 6.862A153 153 0 0 1-344 0c-.052-94.424 85.51-159.133 155-160 56.718-.708 105.182 35.999 128.422 70.38C0 0-8.304 23.34 60.366 90.809 90.524 120.44 138.796 155.991 195 155c77.203-1.361 148-75.502 148-155 0-88.638-68.375-153.52-146-160-39.464-3.295-118-.604-197 160-16.674 33.896-33.129 60.481-49.075 81.338"
        transform="translate(400 206)"
      />
      <path
        class="accent teal"
        stroke-width="20"
        d="M-193.997 123.007c-20.015 4.767-37.545 2.732-52.218 1.222-15.169-1.561-31.594-7.935-46.919-18.187"
        transform="translate(441.756 211.719)"
      />
      <path
        class="accent amber"
        stroke-width="20"
        d="M131.322-193.41c14.443-2.1 27.151-2.02 37.843-1.981 41.795.153 90.727 22.932 127.642 61.101"
        transform="translate(441.756 211.719)"
      />
    </g>
  </svg>
</div>

<style lang="scss">
  .logo {
    display: inline-flex;
    aspect-ratio: 800 / 410;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  .loop {
    stroke: var(--txt-0);
    stroke-dasharray: 1600;
    stroke-dashoffset: 1600;
    animation: draw 3.2s ease-in-out infinite alternate;
  }
  .accent.teal {
    stroke: var(--green);
  }
  .accent.amber {
    stroke: var(--yellow);
  }

  @keyframes draw {
    from {
      stroke-dashoffset: 1600;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .loop {
      animation: none;
      stroke-dashoffset: 0;
    }
  }
</style>
```

> Note: `stroke-dasharray: 1600` is an approximation of the loop's path length; if the draw animation clips or overshoots when viewed, adjust this single number until the stroke draws end-to-end (verified in Step 2).

- [ ] **Step 2: Verify manually**

Run: `npm run dev`. Look at the header logo and the homepage mark.
Expected: the infinity mark draws itself in a smooth loop, main stroke uses the theme text color, the two accents are teal/amber; on the light theme colors adapt; with "reduce motion" on, the mark shows fully drawn and static. Adjust `stroke-dasharray` if the draw doesn't complete cleanly.

- [ ] **Step 3: Commit**

```bash
git add src/lib/components/NavLogo.svelte
commit -m "refactor(logo): self-drawing inline SVG, remove lottie dependency in NavLogo"
```

---

## Task 9: Wire logo click → theme toggle + burst (header)

**Files:**
- Modify: `src/routes/+layout.svelte`

- [ ] **Step 1: Add a click handler and burst import**

In `src/routes/+layout.svelte` `<script>`, add:

```svelte
  import { triggerBurst } from '$lib/js/ascii-burst.js';

  function onLogoClick(e) {
    toggleTheme();
    triggerBurst(e.clientX, e.clientY);
  }
```

- [ ] **Step 2: Use it on the header logo button**

Replace the header button's handler (line ~91) `on:click={toggleTheme}` with `on:click={onLogoClick}`.

- [ ] **Step 3: Verify manually**

Run: `npm run dev`. Click the header logo.
Expected: theme toggles as before, and a ripple ring expands outward through the ASCII field from the click point (no ripple when "reduce motion" is on).

- [ ] **Step 4: Commit**

```bash
git add src/routes/+layout.svelte
commit -m "feat(logo): fire ascii burst on header logo click"
```

---

## Task 10: Homepage — remove Lottie, use NavLogo, themed wordmark & tagline

**Files:**
- Modify (script + markup + style): `src/routes/+page.svelte`

- [ ] **Step 1: Replace the script block**

In `src/routes/+page.svelte`, replace the entire `<script> … </script>` (lines 1–43) with:

```svelte
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
```

(The `pages` import may already be present from Task 2 Step 2 — keep a single copy.)

- [ ] **Step 2: Replace the hero button**

Replace the `pfpstart` button (lines ~48–49) with:

```svelte
      <button class="pfpstart" on:click={onLogoClick} aria-label="Toggle theme"><NavLogo size="4rem" /></button>
```

- [ ] **Step 3: Theme the tagline**

Replace the tagline `<p>` (line ~51) with the witty themed line:

```svelte
    <p>▸ field notes of an SRE, logged from the tech wilds — <span class="m">no dragons, just YAML</span>.</p>
```

Add to the `<style>`:

```scss
  p .m {
    color: var(--yellow);
  }
```

- [ ] **Step 4: Simplify the `.pfpstart` style**

In `+page.svelte` `<style>`, the existing `.pfpstart` rule references a Lottie `:global(svg)`. Replace the `.pfpstart { … }` rule (lines ~86–97) with:

```scss
  .pfpstart {
    display: inline-flex;
    background: none;
    padding: 0;
  }
```

- [ ] **Step 5: Verify manually**

Run: `npm run dev`, open `/`.
Expected: the hero shows the self-drawing infinity mark (no Lottie), the wordmark/hero heading renders (Task 11 styles it as pixel), the tagline shows the witty amber-accented line, clicking the mark toggles theme + fires a burst, nav lists themed labels.

- [ ] **Step 6: Commit**

```bash
git add src/routes/+page.svelte
commit -m "feat(home): use NavLogo, themed wordmark and tagline"
```

---

## Task 11: Pixel display font + wordmark/hero styling

**Files:**
- Create: `src/lib/assets/fonts/pixelify-sans.css`
- Modify: `src/variables.scss` (add `$font-family-display`)
- Modify: `src/routes/+layout.svelte` (import font)
- Modify: `src/app.scss` or component styles for wordmark/hero

- [ ] **Step 1: Add the `@font-face`**

```css
/* src/lib/assets/fonts/pixelify-sans.css */
/* pixelify-sans-latin-wght-normal */
@font-face {
  font-family: 'Pixelify Sans';
  font-style: normal;
  font-display: swap;
  font-weight: 400 700;
  src: url(https://cdn.jsdelivr.net/fontsource/fonts/pixelify-sans:vf@latest/latin-wght-normal.woff2)
    format('woff2-variations');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+2000-206F, U+2074, U+20AC, U+2122, U+2212,
    U+2215, U+FEFF, U+FFFD;
}
```

- [ ] **Step 2: Add the token**

In `src/variables.scss`, under `// Font families` (after line 46), add:

```scss
$font-family-display: 'Pixelify Sans', 'Fira Mono', monospace;
```

- [ ] **Step 3: Import the font**

In `src/routes/+layout.svelte` `<script>`, next to the existing font imports (lines 3–4), add:

```svelte
  import '$lib/assets/fonts/pixelify-sans.css';
```

- [ ] **Step 4: Style the wordmark & hero**

In `src/routes/+layout.svelte` `<style>`, in the header `h1` rule (line ~148), set the font:

```scss
      h1 {
        font-size: $font-base;
        color: var(--txt);
        margin: 0;
        font-family: $font-family-display;
      }
```

In `src/routes/+page.svelte` `<style>`, in the hero `h1` rule (line ~99), set:

```scss
  h1 {
    font-size: $font-3xl;
    margin: 0;
    font-family: $font-family-display;
  }
```

- [ ] **Step 5: Verify manually**

Run: `npm run dev`. Check the homepage hero "Tech Quests" and the header "Tech Quests".
Expected: both render in the legible pixel font; body text, headings and code are unchanged; no layout shift beyond the font swap.

- [ ] **Step 6: Commit**

```bash
git add src/variables.scss src/lib/assets/fonts/pixelify-sans.css src/routes/+layout.svelte src/routes/+page.svelte
commit -m "feat(type): add Pixelify Sans display font for wordmark and hero"
```

---

## Task 12: Remove Lottie dependency and assets

**Files:**
- Modify: `package.json`
- Delete: `src/lib/assets/pfpin-dark.json`, `src/lib/assets/pfpin-light.json`

Do this only after Tasks 8 and 10 (no remaining Lottie importers).

- [ ] **Step 1: Confirm nothing imports Lottie or the JSONs**

Run: `grep -rn "lottie\|pfpin" src`
Expected: no matches (only possible match is this plan/docs). If `src` matches remain, fix them before continuing.

- [ ] **Step 2: Remove the dependency and assets**

Run:

```bash
npm remove lottie-web
git rm src/lib/assets/pfpin-dark.json src/lib/assets/pfpin-light.json
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds with no unresolved `lottie-web` / `pfpin` imports.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/lib/assets
commit -m "chore(deps): remove lottie-web and animation JSON assets"
```

---

## Task 13: Project status rune

**Files:**
- Create: `src/lib/js/project-status.js`
- Test: `src/lib/js/project-status.test.js`
- Modify: `src/routes/projects/+page.svelte`
- Modify (optional data): one or more `src/content/projects/*/+*.md` frontmatter

- [ ] **Step 1: Write the failing test**

```js
// src/lib/js/project-status.test.js
import { describe, it, expect } from 'vitest';
import { statusRune } from './project-status.js';

describe('statusRune', () => {
  it('maps known statuses', () => {
    expect(statusRune('evolving')).toEqual({ glyph: '⟳', label: 'evolving' });
    expect(statusRune('shipped')).toEqual({ glyph: '✓', label: 'shipped' });
    expect(statusRune('archived')).toEqual({ glyph: '☾', label: 'archived' });
  });
  it('returns null when absent or unknown', () => {
    expect(statusRune(undefined)).toBeNull();
    expect(statusRune('')).toBeNull();
    expect(statusRune('bogus')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/js/project-status.test.js`
Expected: FAIL — cannot resolve `./project-status.js`.

- [ ] **Step 3: Implement the module**

```js
// src/lib/js/project-status.js
const RUNES = {
  evolving: { glyph: '⟳', label: 'evolving' },
  shipped: { glyph: '✓', label: 'shipped' },
  archived: { glyph: '☾', label: 'archived' }
};

export function statusRune(status) {
  if (!status) return null;
  return RUNES[status] ?? null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/js/project-status.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Render the rune on project cards**

In `src/routes/projects/+page.svelte`, add the import:

```svelte
  import { statusRune } from '$lib/js/project-status.js';
```

Inside the `{#each data.posts as post (post.slug)}` block, add a rune above the title (only renders when `post.status` is set). Replace the `<h2>…</h2>` region with:

```svelte
        {#if statusRune(post.status)}
          <div class="state">{statusRune(post.status).glyph} {statusRune(post.status).label}</div>
        {/if}
        <h2>
          {post.name}<span class="arrow" aria-hidden="true">&nbsp;></span><span
            class="slash"
            aria-hidden="true">/</span
          >
        </h2>
```

Add `state` to the grid template and a style. Update the `a.link` `grid-template-areas` (line ~110) to include a `state` row and add the rule:

```scss
  a.link {
    display: grid;
    grid-template-areas:
      'thumb'
      'state'
      'title'
      'description';
    gap: $spacing-sm;
  }

  .state {
    grid-area: state;
    font-family: $font-family-mono;
    font-size: $font-xs;
    color: var(--txt-3);
  }
```

- [ ] **Step 6: Add sample `status` frontmatter**

Add `status: shipped` (or `evolving`/`archived`) to a couple of real projects where meaningful, e.g. in `src/content/projects/houndr/+houndr.md` frontmatter add a line `status: evolving`. Leave others without a `status` (they render no rune).

`getPosts` spreads `...post.metadata`, so `status` flows through automatically — no loader change needed.

- [ ] **Step 7: Verify manually**

Run: `npm run dev`, open `/projects`.
Expected: projects with a `status` show a muted rune (e.g. `⟳ evolving`); projects without one show nothing extra; layout is intact.

- [ ] **Step 8: Commit**

```bash
git add src/lib/js/project-status.js src/lib/js/project-status.test.js src/routes/projects/+page.svelte src/content/projects
commit -m "feat(projects): optional status rune on project cards"
```

---

## Task 14: Reading time — "min journey"

**Files:**
- Create: `src/lib/utils/reading-time.js`
- Test: `src/lib/utils/reading-time.test.js`
- Modify: `src/routes/blog/+page.js`
- Modify: `src/routes/blog/+page.svelte`

- [ ] **Step 1: Write the failing test**

```js
// src/lib/utils/reading-time.test.js
import { describe, it, expect } from 'vitest';
import { countWords, readingJourney } from './reading-time.js';

describe('reading-time', () => {
  it('counts words, ignoring frontmatter', () => {
    const md = `---\ntitle: x\n---\none two three four five`;
    expect(countWords(md)).toBe(5);
  });
  it('handles empty input', () => {
    expect(countWords('')).toBe(0);
    expect(countWords(null)).toBe(0);
  });
  it('formats a journey with a floor of 1 minute', () => {
    expect(readingJourney('one two three')).toBe('~1 min journey');
  });
  it('scales with length at ~200 wpm', () => {
    const words = Array.from({ length: 600 }, () => 'w').join(' ');
    expect(readingJourney(words)).toBe('~3 min journey');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/utils/reading-time.test.js`
Expected: FAIL — cannot resolve `./reading-time.js`.

- [ ] **Step 3: Implement the module**

```js
// src/lib/utils/reading-time.js
function stripFrontmatter(text) {
  return text.replace(/^﻿?---[\s\S]*?---/, '');
}

export function countWords(text) {
  if (!text) return 0;
  return stripFrontmatter(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function readingJourney(text, wpm = 200) {
  const minutes = Math.max(1, Math.ceil(countWords(text) / wpm));
  return `~${minutes} min journey`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/utils/reading-time.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Compute journey in the blog loader**

Replace `src/routes/blog/+page.js` with:

```js
import { getPosts, nameFromPath } from '$lib/js/posts.js';
import { readingJourney } from '$lib/utils/reading-time.js';

export async function load() {
  const modules = import.meta.glob('/src/content/blog/*/*.md');
  let posts = await getPosts(modules);

  // Raw markdown (eager, build-time) → word-count based reading time per slug.
  const raws = import.meta.glob('/src/content/blog/*/*.md', {
    query: '?raw',
    import: 'default',
    eager: true
  });
  const journeys = {};
  for (const [path, text] of Object.entries(raws)) {
    journeys[nameFromPath(path)] = readingJourney(text);
  }
  posts = posts.map((p) => ({ ...p, journey: journeys[p.slug] }));

  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    posts,
    meta: {
      title: 'Blog | Technological Adventures and SRE Insights',
      description:
        'Explore a collection of articles and tutorials on Site Reliability Engineering, homelabs, and various technological adventures.',
      type: 'blog-posts'
    }
  };
}
```

`nameFromPath` is already exported from `src/lib/js/posts.js`.

- [ ] **Step 6: Display the journey on blog rows**

In `src/routes/blog/+page.svelte`, add the journey next to the date. Replace the `.date` line (line 31) with:

```svelte
        <div class="date">{formatDate(post.date)} <span class="journey">· ~{post.journey?.replace('~', '')}</span></div>
```

(Simpler: `{post.journey}` already includes the `~`; render `{formatDate(post.date)} · {post.journey}`.) Use:

```svelte
        <div class="date">{formatDate(post.date)} · <span class="journey">{post.journey}</span></div>
```

Add to `<style>`:

```scss
  .journey {
    color: var(--yellow);
  }
```

- [ ] **Step 7: Verify**

Run: `npx vitest run src/lib/utils/reading-time.test.js` (PASS) then `npm run dev`, open `/blog`.
Expected: each row shows `<date> · ~N min journey` with the journey in amber; longer posts show larger numbers.

- [ ] **Step 8: Commit**

```bash
git add src/lib/utils/reading-time.js src/lib/utils/reading-time.test.js src/routes/blog/+page.js src/routes/blog/+page.svelte
commit -m "feat(blog): show reading time as min journey"
```

---

## Task 15: SectionLabel component (optional divider)

**Files:**
- Create: `src/lib/components/SectionLabel.svelte`
- Test: `src/lib/components/SectionLabel.test.js`
- Modify: usage where a sub-section divider helps (e.g. `about` page sections)

- [ ] **Step 1: Write the failing test**

```js
// src/lib/components/SectionLabel.test.js
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import SectionLabel from './SectionLabel.svelte';

describe('SectionLabel', () => {
  it('renders the provided label text', () => {
    const { getByText } = render(SectionLabel, { props: { label: 'Quests' } });
    expect(getByText('Quests')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/components/SectionLabel.test.js`
Expected: FAIL — cannot resolve `./SectionLabel.svelte`.

- [ ] **Step 3: Implement the component**

```svelte
<!-- src/lib/components/SectionLabel.svelte -->
<script>
  export let label = '';
</script>

<div class="section-label"><span class="glyph" aria-hidden="true">❖</span>{label}<span class="rule" aria-hidden="true"></span></div>

<style lang="scss">
  .section-label {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-family: $font-family-mono;
    font-size: $font-xs;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--txt-3);
    margin: $spacing-3xl 0 $spacing-base 0;

    .glyph {
      color: var(--green);
    }
    .rule {
      flex: 1;
      height: 1px;
      background: var(--bg-3);
    }
  }
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/components/SectionLabel.test.js`
Expected: PASS (1 test).

- [ ] **Step 5: Use it where valuable (about page)**

In `src/routes/about/+page.svelte`, import and place a `<SectionLabel label="…" />` before major content groupings if the page has them. Add:

```svelte
  import SectionLabel from '$lib/components/SectionLabel.svelte';
```

and e.g. `<SectionLabel label="The Adventurer" />` above the intro block. (If the about page is a single block, skip usage here; the component is still available for future sections. Do not force it in.)

- [ ] **Step 6: Verify manually**

Run: `npm run dev`, open `/about`.
Expected: divider renders `❖ THE ADVENTURER ────`, aligned and muted.

- [ ] **Step 7: Commit**

```bash
git add src/lib/components/SectionLabel.svelte src/lib/components/SectionLabel.test.js src/routes/about/+page.svelte
commit -m "feat(ui): add SectionLabel divider component"
```

---

## Task 16: Footer + 404 microcopy

**Files:**
- Modify: `src/routes/+layout.svelte` (footer)
- Modify: `src/routes/+error.svelte` (404 line)

- [ ] **Step 1: Add a themed footer to the layout**

In `src/routes/+layout.svelte`, after the `.container` div (after line ~124, before `</…>` root end / the `<style>`), add:

```svelte
<footer class="site-footer">
  <span>⚔ forged in vim &amp; regret</span>
  <a class="external" href="/contact">send a raven <span class="arrow">❯</span></a>
</footer>
```

Add to the `<style>`:

```scss
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
```

- [ ] **Step 2: Theme the 404 message**

In `src/routes/+error.svelte`, replace the `.errorMessage` line (line 8) so a 404 reads themed while other errors keep their real message:

```svelte
    <h2 class="errorMessage">{$page.status === 404 ? "you've wandered off the map" : $page.error.message}</h2>
```

Also fix the stale `--primary` color reference in `.links a` (line 42) — that variable does not exist in the palette. Change `color: var(--primary);` to `color: var(--green);`.

- [ ] **Step 3: Verify manually**

Run: `npm run dev`. Check the footer on any page; visit a bogus URL like `/nope`.
Expected: footer shows the two themed lines and the raven link works; the 404 shows "you've wandered off the map" with working, visible links.

- [ ] **Step 4: Commit**

```bash
git add src/routes/+layout.svelte src/routes/+error.svelte
commit -m "feat(theme): themed footer and 404 microcopy"
```

---

## Task 17: Final verification pass

**Files:** none (verification + fixups only)

- [ ] **Step 1: Full unit suite**

Run: `npm run test:unit`
Expected: all unit tests pass (new: nav, ascii, project-status, reading-time, AsciiField, SectionLabel; plus pre-existing).

- [ ] **Step 2: Lint & format**

Run: `npm run format && npm run lint`
Expected: formatting applied, lint passes. Commit any formatting churn: `git add -A && commit -m "style: format theme changes"`.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: build succeeds, no `lottie`/`pfpin` references, all routes prerender.

- [ ] **Step 4: Manual acceptance (dev), both themes**

Run: `npm run dev`. For dark **and** light themes verify:
- ASCII field visible + faint on every route; content legible; ripple on logo click.
- Logo draws (infinity) and toggles theme.
- Wordmark/hero in pixel font; body/code readable.
- Nav + headings themed (Quests/Chronicles/Sagas/The Adventurer/Send a Raven), all links work, URLs unchanged.
- Project state runes appear only where `status` set; blog rows show "~N min journey"; footer + 404 themed.

- [ ] **Step 5: Manual acceptance — reduced motion**

Enable OS "Reduce motion", reload.
Expected: ASCII field static (no drift/ripple), logo shows fully-drawn and static, everything else intact.

- [ ] **Step 6: Final commit (if any fixups)**

```bash
git add -A
commit -m "chore(theme): final verification fixups"
```

---

## Self-Review notes (author)

- **Spec coverage:** typography/Pixelify (T11), palette reuse + light ASCII ink (T6), glyph vocab (T13/15/16), AsciiField incl. burst + reduced-motion (T3–7,9,10), NavLogo inline SVG + drop Lottie (T8,10,12), wordmark/hero (T10,11), SectionLabel (T15), project state rune from optional frontmatter (T13), blog "min journey" (T14), lexicon labels-only with routes unchanged (T1,2), microcopy/404 (T10,16), a11y/perf/no-JS (T5,6,17). All spec sections mapped.
- **Deferred (per spec):** pixel-art/ouroboros logo, themed OG images, video bumper, pixel section icons — intentionally not in this plan.
- **Type consistency:** `statusRune → {glyph,label}|null`; `readingJourney → "~N min journey"`; `triggerBurst(x,y) → burst {x,y,id}`; nav entries `{label,path}` used identically in layout + homepage.
- **Known tuning point:** `NavLogo` `stroke-dasharray` is an approximate path length; T8 Step 2 calls out adjusting it visually.
