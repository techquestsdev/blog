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
