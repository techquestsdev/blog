<script>
  import { onMount, onDestroy } from 'svelte';
  import { hash, valueNoise, charForHash, contour } from '$lib/js/ascii.js';
  import { burst } from '$lib/js/ascii-burst.js';

  const CELL = 13;
  const FONT = 13;

  export let active = true;

  let canvas;
  let ctx;
  let w = 0;
  let h = 0;
  let raf;
  let reduced = false;
  let mounted = false;
  // Only the very first reveal should play the slow "materialising" keyframe;
  // later toggles (navigating back to the homepage) just want a quick,
  // consistent crossfade that matches the page transition's timing.
  let everShown = false;
  const mouse = { x: -9999, y: -9999 };
  let ripples = [];
  let lastBurstId = 0;
  let lastT = 0;
  // Ink read from CSS so light mode ("parchment") gets a dark ink instead of teal.
  // Expected form: "hsla(H, S%, L%, ALPHA)" with the literal token ALPHA substituted per cell.
  let ink = 'hsla(189, 41%, 68%, ALPHA)';

  function readInk() {
    if (typeof window === 'undefined') return;
    const v = getComputedStyle(document.documentElement).getPropertyValue('--ascii-ink').trim();
    if (v) ink = v;
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
    if (reduced) draw(lastT);
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

  // Pause the animation loop when the field is hidden (e.g. navigated away from
  // the homepage) instead of destroying the canvas, so re-showing it crossfades
  // smoothly rather than popping in/out.
  $: if (mounted && !reduced) {
    if (active && !raf) {
      raf = requestAnimationFrame(loop);
    } else if (!active && raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  $: if (active) everShown = true;

  function onMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
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

    mounted = true;
    if (reduced) draw(0);
    else if (active) raf = requestAnimationFrame(loop);

    return () => {
      obs.disconnect();
      unsub();
    };
  });

  onDestroy(() => {
    if (raf) cancelAnimationFrame(raf);
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    }
  });
</script>

<canvas bind:this={canvas} class:active class:first-reveal={active && !everShown} aria-hidden="true"
></canvas>

<style lang="scss">
  canvas {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
    opacity: 0;
    // Quick, consistent crossfade for every toggle, matching the ~430ms page
    // transition instead of a slow standalone fade.
    transition: opacity 0.35s ease;

    &.active {
      opacity: 1;
    }

    // Only the true first reveal (initial page load) gets the slower,
    // more dramatic "materialising" keyframe.
    &.first-reveal {
      animation: field-in 1.6s ease both;
    }
  }

  @keyframes field-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
