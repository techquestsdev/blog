import { describe, it, expect } from 'vitest';
import { load } from './+page.js';

describe('Home Page Load Function', () => {
  it('should return correct meta information', () => {
    const result = load();

    expect(result).toEqual({
      meta: {
        title: 'Tech Quests',
        description: 'The saga of a SRE sharing his technological adventures.',
        type: 'blog'
      }
    });
  });

  it('should return an object with meta property', () => {
    const result = load();

    expect(result).toHaveProperty('meta');
    expect(typeof result.meta).toBe('object');
  });

  it('should have all required meta fields', () => {
    const result = load();

    expect(result.meta).toHaveProperty('title');
    expect(result.meta).toHaveProperty('description');
    expect(result.meta).toHaveProperty('type');

    expect(typeof result.meta.title).toBe('string');
    expect(typeof result.meta.description).toBe('string');
    expect(typeof result.meta.type).toBe('string');
  });

  it('should have non-empty string values', () => {
    const result = load();

    expect(result.meta.title.length).toBeGreaterThan(0);
    expect(result.meta.description.length).toBeGreaterThan(0);
    expect(result.meta.type.length).toBeGreaterThan(0);
  });
});
