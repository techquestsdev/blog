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
