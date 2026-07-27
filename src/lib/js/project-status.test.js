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
