import { describe, it, expect } from 'vitest';

/**
 * Utility functions for working with blog content
 */

export const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const formatReadingTime = (text) => {
  if (!text) return '0 min read';

  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const readingTime = Math.ceil(words / wordsPerMinute);

  return `${readingTime} min read`;
};

export const formatExcerpt = (text, maxLength = 150) => {
  if (!text) return '';

  if (text.length <= maxLength) return text;

  // Find the last space before maxLength to avoid cutting words
  const cutOff = text.lastIndexOf(' ', maxLength);
  return text.substring(0, cutOff > 0 ? cutOff : maxLength) + '...';
};

export const sortPostsByDate = (posts, ascending = false) => {
  return [...posts].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    return ascending ? dateA - dateB : dateB - dateA;
  });
};

describe('Blog Utilities', () => {
  describe('slugify', () => {
    it('should convert text to valid slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('React vs Vue.js')).toBe('react-vs-vuejs');
      expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
    });

    it('should handle special characters', () => {
      expect(slugify('C++ Programming')).toBe('c-programming');
      expect(slugify('Node.js & Express')).toBe('nodejs-express');
      expect(slugify('100% JavaScript!')).toBe('100-javascript');
    });

    it('should handle empty or invalid input', () => {
      expect(slugify('')).toBe('');
      expect(slugify('   ')).toBe('');
      expect(slugify('---')).toBe('');
    });
  });

  describe('formatReadingTime', () => {
    it('should calculate reading time correctly', () => {
      const shortText =
        'This is a short text with about twenty words to test the reading time calculation function.';
      expect(formatReadingTime(shortText)).toBe('1 min read');
    });

    it('should handle longer texts', () => {
      const longText = 'word '.repeat(400); // 400 words
      expect(formatReadingTime(longText)).toBe('2 min read');
    });

    it('should handle empty text', () => {
      expect(formatReadingTime('')).toBe('0 min read');
      expect(formatReadingTime(null)).toBe('0 min read');
      expect(formatReadingTime(undefined)).toBe('0 min read');
    });
  });

  describe('formatExcerpt', () => {
    it('should return text as is if shorter than max length', () => {
      const shortText = 'This is short.';
      expect(formatExcerpt(shortText)).toBe('This is short.');
    });

    it('should truncate long text at word boundary', () => {
      const longText =
        'This is a very long text that should be truncated at a word boundary to avoid cutting words in half which would look unprofessional.';
      const result = formatExcerpt(longText, 50);
      expect(result).toMatch(/\.\.\.$|…$/);
      expect(result.length).toBeLessThanOrEqual(54); // 50 + '...'
      expect(result).not.toMatch(/\s\.\.\.$/); // Should not end with space before ellipsis
    });

    it('should handle edge cases', () => {
      expect(formatExcerpt('')).toBe('');
      expect(formatExcerpt(null)).toBe('');
      expect(formatExcerpt(undefined)).toBe('');
    });

    it('should respect custom max length', () => {
      const text = 'This is a test text for custom length';
      const result = formatExcerpt(text, 20);
      expect(result.length).toBeLessThanOrEqual(24); // 20 + '...'
    });
  });

  describe('sortPostsByDate', () => {
    const posts = [
      { title: 'Post 1', date: '2023-01-01' },
      { title: 'Post 2', date: '2023-03-01' },
      { title: 'Post 3', date: '2023-02-01' }
    ];

    it('should sort posts by date descending (newest first) by default', () => {
      const sorted = sortPostsByDate(posts);
      expect(sorted[0].title).toBe('Post 2'); // March
      expect(sorted[1].title).toBe('Post 3'); // February
      expect(sorted[2].title).toBe('Post 1'); // January
    });

    it('should sort posts by date ascending when specified', () => {
      const sorted = sortPostsByDate(posts, true);
      expect(sorted[0].title).toBe('Post 1'); // January
      expect(sorted[1].title).toBe('Post 3'); // February
      expect(sorted[2].title).toBe('Post 2'); // March
    });

    it('should not mutate original array', () => {
      const original = [...posts];
      sortPostsByDate(posts);
      expect(posts).toEqual(original);
    });

    it('should handle empty array', () => {
      expect(sortPostsByDate([])).toEqual([]);
    });

    it('should handle invalid dates', () => {
      const postsWithInvalidDates = [
        { title: 'Valid', date: '2023-01-01' },
        { title: 'Invalid', date: 'invalid-date' }
      ];

      // Should not throw an error
      const result = sortPostsByDate(postsWithInvalidDates);
      expect(result).toHaveLength(2);
    });
  });
});
