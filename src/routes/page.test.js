import { describe, it, expect } from 'vitest';
import { load } from './+page.js';
import { buildWebSiteJsonLd } from '$lib/utils/structured-data.js';

describe('Home Page Load Function', () => {
  it('should return correct meta information', async () => {
    const result = await load();

    expect(result.meta).toEqual({
      title: 'Tech Quests | A SRE saga on technological adventures',
      description:
        'The saga of Andre Nogueira, a Site Reliability Engineer sharing insights on homelabs, software engineering, and technological adventures.',
      type: 'blog',
      jsonLd: buildWebSiteJsonLd()
    });
  });

  it('should return an object with meta property', async () => {
    const result = await load();

    expect(result).toHaveProperty('meta');
    expect(typeof result.meta).toBe('object');
  });

  it('should have all required meta fields', async () => {
    const result = await load();

    expect(result.meta).toHaveProperty('title');
    expect(result.meta).toHaveProperty('description');
    expect(result.meta).toHaveProperty('type');

    expect(typeof result.meta.title).toBe('string');
    expect(typeof result.meta.description).toBe('string');
    expect(typeof result.meta.type).toBe('string');
  });

  it('should have non-empty string values', async () => {
    const result = await load();

    expect(result.meta.title.length).toBeGreaterThan(0);
    expect(result.meta.description.length).toBeGreaterThan(0);
    expect(result.meta.type.length).toBeGreaterThan(0);
  });

  it('should return posts, projects and videos arrays', async () => {
    const result = await load();

    expect(Array.isArray(result.posts)).toBe(true);
    expect(Array.isArray(result.projects)).toBe(true);
    expect(Array.isArray(result.videos)).toBe(true);
  });
});
