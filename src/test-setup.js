import { vi, beforeEach } from 'vitest';

// Mock browser globals for tests
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

global.document = {
  documentElement: {
    setAttribute: vi.fn(),
    getAttribute: vi.fn()
  }
};

// Mock SvelteKit environment variables
vi.mock('$app/environment', () => ({
  browser: false,
  dev: false,
  building: false,
  version: '1.0.0'
}));

// Mock import.meta.glob for tests
globalThis.__importMetaGlob = vi.fn(() => ({}));

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
