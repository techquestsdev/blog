import { writable } from 'svelte/store';

// null, or { x, y, id }. `id` increments so AsciiField can detect new bursts
// without relying on Date.now() (which would break SSR/prerender determinism).
export const burst = writable(null);

let counter = 0;
export function triggerBurst(x, y) {
  counter += 1;
  burst.set({ x, y, id: counter });
}
