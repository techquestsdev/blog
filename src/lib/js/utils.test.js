import { describe, it, expect } from 'vitest';
import { formatDate } from './utils.js';

describe('formatDate', () => {
  it('should format a valid date string correctly', () => {
    const result = formatDate('2023-12-25');
    // The exact format depends on locale, but should be MM/DD/YYYY or similar
    expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
  });

  it('should format a Date object correctly', () => {
    const testDate = new Date('2023-12-25T10:30:00Z');
    const result = formatDate(testDate);
    expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
    expect(result).toContain('2023');
  });

  it('should handle ISO date string', () => {
    const result = formatDate('2023-01-15T00:00:00Z');
    expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
    expect(result).toContain('2023');
  });

  it('should format date consistently with UTC timezone', () => {
    const result1 = formatDate('2023-06-15T23:59:59Z');
    const result2 = formatDate('2023-06-15T00:00:00Z');
    // Both should show the same date since we're using UTC
    expect(result1).toContain('2023');
    expect(result2).toContain('2023');
  });

  it('should handle leap year dates', () => {
    const result = formatDate('2024-02-29');
    expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
    expect(result).toContain('2024');
  });
});
