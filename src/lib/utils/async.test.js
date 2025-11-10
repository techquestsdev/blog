import { describe, it, expect, vi } from 'vitest';

/**
 * Tests for async operations and error handling
 */

// Mock async utility functions
export const fetchWithRetry = async (url, options = {}, maxRetries = 3) => {
  const { retries = 0, ...fetchOptions } = options;

  try {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    if (retries < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * (retries + 1)));
      return fetchWithRetry(url, { ...options, retries: retries + 1 }, maxRetries);
    }
    throw error;
  }
};

export const timeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timed out')), ms))
  ]);
};

export const asyncMap = async (array, asyncFn) => {
  if (!Array.isArray(array)) {
    throw new Error('First argument must be an array');
  }

  const results = [];
  for (let i = 0; i < array.length; i++) {
    try {
      const result = await asyncFn(array[i], i, array);
      results.push(result);
    } catch (error) {
      throw new Error(`Error processing item at index ${i}: ${error.message}`);
    }
  }

  return results;
};

export const batchProcess = async (items, batchSize = 5, processor) => {
  if (!Array.isArray(items)) {
    throw new Error('Items must be an array');
  }

  if (batchSize <= 0) {
    throw new Error('Batch size must be positive');
  }

  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchPromises = batch.map(processor);
    const batchResults = await Promise.allSettled(batchPromises);

    results.push(...batchResults);
  }

  return results;
};

describe('Async Operations and Error Handling', () => {
  describe('fetchWithRetry', () => {
    it('should succeed on first try when response is ok', async () => {
      const mockResponse = { ok: true, status: 200 };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await fetchWithRetry('https://example.com');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockResponse);
    });

    it('should retry on failed requests', async () => {
      const mockFailedResponse = { ok: false, status: 500, statusText: 'Internal Server Error' };
      const mockSuccessResponse = { ok: true, status: 200 };

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce(mockFailedResponse)
        .mockResolvedValueOnce(mockSuccessResponse);

      const result = await fetchWithRetry('https://example.com', {}, 3);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result).toBe(mockSuccessResponse);
    });

    it('should throw error after max retries', async () => {
      const mockFailedResponse = { ok: false, status: 500, statusText: 'Internal Server Error' };
      global.fetch = vi.fn().mockResolvedValue(mockFailedResponse);

      await expect(fetchWithRetry('https://example.com', {}, 2)).rejects.toThrow(
        'HTTP 500: Internal Server Error'
      );

      expect(global.fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('timeout', () => {
    it('should resolve when promise completes within timeout', async () => {
      const quickPromise = new Promise((resolve) => setTimeout(() => resolve('success'), 50));

      const result = await timeout(quickPromise, 100);
      expect(result).toBe('success');
    });

    it('should reject when promise takes longer than timeout', async () => {
      const slowPromise = new Promise((resolve) => setTimeout(() => resolve('success'), 200));

      await expect(timeout(slowPromise, 100)).rejects.toThrow('Operation timed out');
    });

    it('should preserve rejection from original promise', async () => {
      const rejectedPromise = Promise.reject(new Error('Original error'));

      await expect(timeout(rejectedPromise, 100)).rejects.toThrow('Original error');
    });
  });

  describe('asyncMap', () => {
    it('should process array items asynchronously', async () => {
      const items = [1, 2, 3];
      const asyncDouble = async (x) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return x * 2;
      };

      const results = await asyncMap(items, asyncDouble);
      expect(results).toEqual([2, 4, 6]);
    });

    it('should provide index and array to async function', async () => {
      const items = ['a', 'b', 'c'];
      const asyncFn = vi.fn().mockImplementation(async (item, index) => {
        return `${item}-${index}`;
      });

      await asyncMap(items, asyncFn);

      expect(asyncFn).toHaveBeenCalledWith('a', 0, items);
      expect(asyncFn).toHaveBeenCalledWith('b', 1, items);
      expect(asyncFn).toHaveBeenCalledWith('c', 2, items);
    });

    it('should throw error with context when async function fails', async () => {
      const items = [1, 2, 3];
      const failingFn = async (x) => {
        if (x === 2) throw new Error('Processing failed');
        return x * 2;
      };

      await expect(asyncMap(items, failingFn)).rejects.toThrow(
        'Error processing item at index 1: Processing failed'
      );
    });

    it('should throw error for non-array input', async () => {
      await expect(asyncMap('not-array', async () => {})).rejects.toThrow(
        'First argument must be an array'
      );
    });
  });

  describe('batchProcess', () => {
    it('should process items in batches', async () => {
      const items = [1, 2, 3, 4, 5, 6, 7];
      const processor = vi.fn().mockImplementation(async (x) => x * 2);

      const results = await batchProcess(items, 3, processor);

      expect(results).toHaveLength(7);
      expect(processor).toHaveBeenCalledTimes(7);

      // Check that successful results are in the expected format
      const fulfilledResults = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);

      expect(fulfilledResults).toEqual([2, 4, 6, 8, 10, 12, 14]);
    });

    it('should handle mixed success and failure in batches', async () => {
      const items = [1, 2, 3, 4];
      const processor = async (x) => {
        if (x === 3) throw new Error(`Failed on ${x}`);
        return x * 2;
      };

      const results = await batchProcess(items, 2, processor);

      expect(results).toHaveLength(4);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      expect(fulfilled).toHaveLength(3);
      expect(rejected).toHaveLength(1);
      expect(rejected[0].reason.message).toBe('Failed on 3');
    });

    it('should throw error for invalid inputs', async () => {
      await expect(batchProcess('not-array', 5, async () => {})).rejects.toThrow(
        'Items must be an array'
      );

      await expect(batchProcess([1, 2, 3], 0, async () => {})).rejects.toThrow(
        'Batch size must be positive'
      );

      await expect(batchProcess([1, 2, 3], -1, async () => {})).rejects.toThrow(
        'Batch size must be positive'
      );
    });

    it('should handle empty array', async () => {
      const results = await batchProcess([], 5, async () => {});
      expect(results).toEqual([]);
    });
  });

  describe('Error Boundaries', () => {
    describe('safeJsonParse', () => {
      const safeJsonParse = (str, fallback = null) => {
        try {
          return JSON.parse(str);
        } catch {
          return fallback;
        }
      };

      it('should parse valid JSON', () => {
        expect(safeJsonParse('{"key": "value"}')).toEqual({ key: 'value' });
        expect(safeJsonParse('[1, 2, 3]')).toEqual([1, 2, 3]);
        expect(safeJsonParse('null')).toBe(null);
      });

      it('should return fallback for invalid JSON', () => {
        expect(safeJsonParse('invalid json')).toBe(null);
        expect(safeJsonParse('{"incomplete": }')).toBe(null);
        expect(safeJsonParse(undefined)).toBe(null);
        expect(safeJsonParse('invalid', 'fallback')).toBe('fallback');
      });
    });

    describe('safeFunction', () => {
      const safeFunction = (fn, fallback = () => null) => {
        return (...args) => {
          try {
            return fn(...args);
          } catch {
            return fallback(...args);
          }
        };
      };

      it('should execute function normally when no error', () => {
        const normalFn = (x) => x * 2;
        const safeFn = safeFunction(normalFn);

        expect(safeFn(5)).toBe(10);
      });

      it('should use fallback when function throws', () => {
        const throwingFn = () => {
          throw new Error('Failed');
        };
        const safeFn = safeFunction(throwingFn, () => 'fallback');

        expect(safeFn()).toBe('fallback');
      });
    });
  });
});
