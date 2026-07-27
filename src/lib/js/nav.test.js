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
