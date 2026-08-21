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

// Contour value for a cell given a warped signal and frequency `k`.
export function contour(signal, k) {
  return Math.abs(Math.sin(signal * k));
}
