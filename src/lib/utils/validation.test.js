import { describe, it, expect } from 'vitest';

/**
 * Tests for edge cases and error handling
 */

// Mock validation functions that might be used in a blog
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

describe('Edge Cases and Error Handling', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test.example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
      expect(validateEmail(123)).toBe(false);
      expect(validateEmail({})).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('should validate correct URLs', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://localhost:3000')).toBe(true);
      expect(validateUrl('https://subdomain.example.com/path?query=1')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('example.com')).toBe(false);
      expect(validateUrl('')).toBe(false);
      expect(validateUrl('ftp://example.com')).toBe(true); // FTP is valid URL protocol
    });

    it('should handle edge cases', () => {
      expect(validateUrl(null)).toBe(false);
      expect(validateUrl(undefined)).toBe(false);
      expect(validateUrl(123)).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize HTML characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );

      expect(sanitizeInput('Hello & "World"')).toBe('Hello &amp; &quot;World&quot;');
    });

    it('should handle whitespace correctly', () => {
      expect(sanitizeInput('  trimmed  ')).toBe('trimmed');
      expect(sanitizeInput('\n\t test \n\t')).toBe('test');
    });

    it('should handle edge cases', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
      expect(sanitizeInput(123)).toBe('');
      expect(sanitizeInput({})).toBe('');
      expect(sanitizeInput('')).toBe('');
    });

    it('should preserve safe characters', () => {
      expect(sanitizeInput('Hello World!')).toBe('Hello World!');
      expect(sanitizeInput('Numbers 123 and symbols @#$%^&*()')).toBe(
        'Numbers 123 and symbols @#$%^&amp;*()'
      );
    });
  });

  describe('debounce', () => {
    it('should be a function that returns a function', () => {
      const fn = () => {};
      const debounced = debounce(fn, 100);
      expect(typeof debounced).toBe('function');
    });

    it('should delay function execution', async () => {
      let callCount = 0;
      const fn = () => {
        callCount++;
      };
      const debounced = debounce(fn, 50);

      // Call multiple times quickly
      debounced();
      debounced();
      debounced();

      // Should not have been called yet
      expect(callCount).toBe(0);

      // Wait for debounce delay
      await new Promise((resolve) => {
        setTimeout(() => {
          expect(callCount).toBe(1); // Should be called only once
          resolve();
        }, 60);
      });
    });

    it('should handle arguments correctly', async () => {
      let receivedArgs = [];
      const fn = (...args) => {
        receivedArgs = args;
      };
      const debounced = debounce(fn, 50);

      debounced('arg1', 'arg2', 'arg3');

      await new Promise((resolve) => {
        setTimeout(() => {
          expect(receivedArgs).toEqual(['arg1', 'arg2', 'arg3']);
          resolve();
        }, 60);
      });
    });
  });

  describe('Array and Object Utilities', () => {
    describe('safeArrayAccess', () => {
      const safeArrayAccess = (arr, index, defaultValue = null) => {
        if (!Array.isArray(arr) || index < 0 || index >= arr.length) {
          return defaultValue;
        }
        return arr[index];
      };

      it('should return array element at valid index', () => {
        const arr = ['a', 'b', 'c'];
        expect(safeArrayAccess(arr, 0)).toBe('a');
        expect(safeArrayAccess(arr, 2)).toBe('c');
      });

      it('should return default value for invalid access', () => {
        const arr = ['a', 'b', 'c'];
        expect(safeArrayAccess(arr, -1)).toBe(null);
        expect(safeArrayAccess(arr, 5)).toBe(null);
        expect(safeArrayAccess(arr, 5, 'default')).toBe('default');
      });

      it('should handle non-array inputs', () => {
        expect(safeArrayAccess(null, 0)).toBe(null);
        expect(safeArrayAccess(undefined, 0)).toBe(null);
        expect(safeArrayAccess('string', 0)).toBe(null);
        expect(safeArrayAccess({}, 0)).toBe(null);
      });
    });

    describe('deepEqual', () => {
      const deepEqual = (a, b) => {
        if (a === b) return true;

        if (a == null || b == null) return false;

        if (typeof a !== typeof b) return false;

        if (typeof a !== 'object') return a === b;

        if (Array.isArray(a) !== Array.isArray(b)) return false;

        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) return false;

        for (let key of keysA) {
          if (!keysB.includes(key)) return false;
          if (!deepEqual(a[key], b[key])) return false;
        }

        return true;
      };

      it('should compare primitive values', () => {
        expect(deepEqual(1, 1)).toBe(true);
        expect(deepEqual('hello', 'hello')).toBe(true);
        expect(deepEqual(true, true)).toBe(true);
        expect(deepEqual(1, '1')).toBe(false);
        expect(deepEqual(null, undefined)).toBe(false);
      });

      it('should compare arrays', () => {
        expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
        expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
        expect(deepEqual([], [])).toBe(true);
        expect(deepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
      });

      it('should compare objects', () => {
        expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
        expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
        expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
        expect(deepEqual({}, {})).toBe(true);
      });
    });
  });
});
