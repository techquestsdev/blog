# Tech Quests — "Minimal Adventurer" Theme Design

**Date:** 2026-07-27
**Status:** Approved (design) — pending implementation plan
**Branch:** `redesign/2026-05`

## Summary

Give `techquests.dev` a cohesive, reusable brand identity: **"Technological Quests"** — an
Elder-Scrolls / medieval quest-log framing rendered through a modern terminal / 8-bit hacker
lens. The identity is deliberately **minimal**: themed and a little witty, but quiet and
highly readable.

The guiding principle: **the theme lives in the framing, not the content.** Body copy stays
clean and legible. The medieval↔hacker identity is carried by four cheap, reusable layers:

1. **Lexicon** — Quests / Chronicles / Sagas / etc. (labels only; URLs unchanged)
2. **Ornament** — ASCII / box-drawing glyphs that read as *both* a terminal UI *and* an
   illuminated-manuscript border (`❖ ◈ ⟳ ✓ ☾ ▸ ⚔ ❯`)
3. **Accents & type** — a pixel display font for the wordmark/hero; existing accent colors
4. **Atmosphere** — a faint animated ASCII "contour map" behind all content

This was validated interactively via live mockups (three ASCII styles, then three theme
intensities, then a refined "A×B mix"). The chosen direction is the minimal mix of intensity
level A (Flavored) and B (Adventurer's Terminal).

## Design language

### Typography
- **Body:** `Inter Variable` (unchanged) — readability is non-negotiable.
- **Headings / code / nav:** `Fira Mono` (unchanged).
- **Display (new):** `Pixelify Sans` — a *legible* pixel font. Used **only** for the wordmark
  and the homepage hero `h1`. Not used for body, headings, or long text.
  - Load it following the existing font pattern (`src/lib/assets/fonts/*.css`, fontsource
    woff2 via jsdelivr), imported in `+layout.svelte`.
  - Add `$font-family-display: 'Pixelify Sans', sans-serif;` to `src/variables.scss`.

### Color
Reuse the existing palette in `src/app.scss` / `src/variables.scss` verbatim. It already fits:
- **Dark theme** → "dungeon terminal at night" (cool blue-grey + teal/amber/salmon accents).
- **Light theme** → "parchment scroll" (the warm `hsl(30–45, 10%, ...)` light palette).
- ASCII background ink: dark theme uses the teal `--green`; light theme must use a **dark ink**
  variant (a low-lightness warm/neutral tone) so it reads on parchment — define per theme.

### Glyph vocabulary
`❖` (section marker / tag), `◈` (card corner), `⟳ ✓ ☾` (project state), `▸` (accent/tagline),
`⚔` (footer flavor), `❯` (call-to-action). Chosen because each belongs to both the
box-drawing/terminal world and the manuscript-ornament world.

## Components

### `AsciiField.svelte` (new)
Canvas-based generative ASCII "contour map" background (technique modeled on refact0r's
`AsciiField`).
- **Rendering:** `<canvas>`, 2D context, `alpha: true`; scale to `devicePixelRatio` (cap 2).
- **Pattern:** grid of cells; per-cell signal = summed sine waves + value-noise domain warp;
  converted to contour lines via `abs(sin(signal * k))`; cells render only above a threshold,
  as `.` `:` `+` chosen by a per-cell hash. Faint alpha.
- **Motion:** continuous slow drift via `requestAnimationFrame`.
- **Interactivity:** eases toward pointer position; cells near the cursor brighten (ripple).
- **Burst:** exposes a mechanism to trigger an expanding ring ripple (fired by the logo click —
  see `NavLogo`). Implement via a shared Svelte store or a `CustomEvent` on `window`.
- **Placement:** rendered once in `+layout.svelte`; `position: fixed; inset: 0; z-index: -1;
  pointer-events: none; aria-hidden="true"`.
- **Accessibility / perf:**
  - `prefers-reduced-motion: reduce` → render a single static frame, stop the rAF loop, disable
    bursts and pointer reactivity.
  - Throttle idle frames; skip sub-threshold cells; no-JS → background simply absent.
- **Homepage:** may use a slightly denser/brighter variant behind the hero (optional prop).

### `NavLogo.svelte` (rebuilt)
Replace the `lottie-web` implementation with a **self-drawing inline SVG**.
- Use the existing infinity/figure-8 path (already present in `static/favicon.svg`, drawn in
  the palette: teal `#27607b` = `--green`, amber `#f3b366` = `--yellow`).
- Animate with CSS `stroke-dasharray` / `stroke-dashoffset` (draw-on loop). Colors bound to CSS
  variables so it themes automatically (no separate dark/light JSON).
- **Remove** the `lottie-web` dependency and the two `pfpin-{dark,light}.json` (~56 KB) assets.
- On click → toggle theme (current behavior) **and** fire the `AsciiField` burst.
- Under `prefers-reduced-motion`: draw the mark once, no looping animation.
- Used by both the header (`+layout.svelte`) and the homepage hero (`src/routes/+page.svelte`),
  replacing the current `pfpstart` Lottie usage there too.

### Wordmark & hero
- Wordmark (`techquests.dev`) and homepage hero `h1` (`Tech Quests`) → `$font-family-display`
  (Pixelify Sans), with `.dev` / accent in `--green`.
- Hero tagline → Fira Mono, muted, with a witty themed line (see Microcopy).

### `SectionLabel.svelte` (new, small)
A reusable section divider: `❖ <Label> ─────────` (leading green glyph + label + hairline rule).
Used above section groupings (e.g. "Quests", "Chronicles").

### Project cards
- Hairline border + a single quiet corner glyph `◈` (brightens to `--green` on hover).
- **Optional state rune**, driven by a new optional frontmatter field `status`:
  - `evolving` → `⟳ evolving`, `shipped` → `✓ shipped`, `archived` → `☾ archived`
  - Rendered muted (`--txt-3`), right-aligned. **Omitted entirely when `status` is absent** —
    honoring that much work is perpetually evolving and shouldn't be force-labeled.
- Tags prefixed with `❖` in `--green`.

### Blog / video rows
- Reading time relabeled from "N min read" → **"~N min journey"** (accent color), reusing the
  existing reading-time helper (currently referenced by `src/lib/utils/blog-utils.test.js`; if
  the source helper is missing/inlined, formalize it in `src/lib/utils/` and reuse it).
- Date shown muted alongside.

### Footer
- Themed, monospace, muted: a witty left line + a `send a raven ❯` call-to-action on the right.
- The witty line may rotate from a small hardcoded list (deterministic pick is fine; no need
  for randomness that breaks SSR hydration).

## Lexicon (labels only — routes/URLs are NOT changed)

| Route (unchanged) | Current label | New label        |
|-------------------|---------------|------------------|
| `/projects`       | Projects      | **Quests**       |
| `/blog`           | Blog          | **Chronicles**   |
| `/videos`         | Videos        | **Sagas**        |
| `/about`          | About         | **The Adventurer** |
| `/contact`        | Contact       | **Send a Raven** |

- Nav shows the themed label with a faint literal path hint (e.g. `Quests` + muted `/projects`)
  for discoverability and SEO clarity.
- Update labels in `src/routes/+layout.svelte` and `src/routes/+page.svelte` nav arrays, plus
  section headings across the route pages.
- **Do not** change route directories, slugs, RSS/sitemap URLs, or `<link>`/canonical URLs.

### Microcopy (witty, sparing)
- Homepage tagline (themed variant of the current one), e.g. "field notes of an SRE, logged
  from the tech wilds — no dragons, just YAML".
- 404 page → "you've wandered off the map".
- Empty states, reading time ("min journey"), footer flavor.
- Keep it light — one witty touch per surface, never at the expense of clarity.

## Scope & phasing

**Phase 1 (this pass):** everything in *Components*, *Lexicon*, and *Microcopy* above, applied
across all existing routes (home, projects, blog, videos, about, contact, 404).

**Deferred (future branding passes — explicitly out of scope now):**
- Pixel-art / ouroboros redraw of the logo mark.
- Themed OG / social share images and favicons.
- Video intro/outro bumper.
- Pixel-art section icons.

## Accessibility & performance

- **Reduced motion:** ASCII background freezes to one static frame; logo draws once and stops;
  no bursts. (The repo already has `prefers-reduced-motion` guards in `app.scss`.)
- **Decorative semantics:** background canvas is `aria-hidden`; ornament glyphs are decorative
  (CSS `::before`/`::after` or `aria-hidden`) so screen readers read clean labels.
- **Contrast:** verify themed accent text (amber/green microcopy) meets contrast on both
  themes; body text contrast is unchanged.
- **Bundle:** net change is expected to be **smaller** — removing `lottie-web` + 56 KB of JSON
  outweighs adding one canvas component and one pixel webfont (subset/`font-display: swap`).
- **No-JS / SSR:** background is absent without JS; all content and navigation work unchanged;
  avoid non-deterministic values (`Math.random`, `Date.now`) in SSR-rendered markup to prevent
  hydration mismatches.

## Files touched (anticipated)

- `src/variables.scss` — add `$font-family-display`.
- `src/app.scss` — wordmark/hero display font, glyph/accent styles, light-mode ASCII ink var.
- `src/lib/assets/fonts/pixelify-sans.css` (new) + import in `+layout.svelte`.
- `src/lib/components/AsciiField.svelte` (new).
- `src/lib/components/NavLogo.svelte` (rebuilt; drop lottie).
- `src/lib/components/SectionLabel.svelte` (new).
- `src/routes/+layout.svelte` — render `AsciiField`, themed nav, footer.
- `src/routes/+page.svelte` — hero wordmark/tagline, themed nav, swap `pfpstart` Lottie.
- Route pages (`projects`, `blog`, `videos`, `about`, `contact`, error/404) — labels, section
  labels, project state rune, "min journey".
- `src/content/projects/*/+*.md` — optional `status:` frontmatter where meaningful.
- `package.json` — remove `lottie-web`; delete `src/lib/assets/pfpin-*.json`.
- `src/lib/utils/` — formalize/relabel reading-time helper if needed.

## Non-goals / constraints

- No change to URLs, routing, RSS, or sitemap.
- No reduction in body-text readability; pixel font stays out of long-form content.
- No heavy "game UI" chrome (HUD panels, XP bars, level badges) — that was intensity level C,
  rejected in favor of the minimal mix.
