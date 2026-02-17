import { vi, beforeEach } from 'vitest';

vi.mock('$lib/utils/markdown.js', () => ({
  markdownToHtml: (markdown) => `<p>${markdown || ''}</p>`,
  convertHtmlToPlainText: (html) =>
    (html || '')
      .toString()
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  truncateHtmlForDescription: (html, maxLength = 160) =>
    (html || '').toString().replace(/\s+/g, ' ').trim().slice(0, maxLength)
}));

vi.mock('$lib/utils/rss.js', async () => {
  const actual = await vi.importActual('$lib/utils/rss.js');
  return {
    ...actual,
    getMarkdownContent: async (path, modules) => {
      const loader = modules?.[path];
      if (typeof loader === 'function') {
        return await loader();
      }
      return '';
    }
  };
});

vi.mock('$lib/js/posts.js', async () => {
  const actual = await vi.importActual('$lib/js/posts.js');
  return {
    ...actual,
    importOgImage: async (imagePath) => {
      if (imagePath === null || imagePath === undefined || imagePath === 'non-existent-image') {
        return undefined;
      }

      return {
        img: { src: '/__test__/image.jpg', w: 1200, h: 630 },
        src: '/__test__/image.jpg',
        fallback: { src: '/__test__/image.jpg' }
      };
    }
  };
});

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
globalThis.__importMetaGlob = vi.fn((pattern, options = {}) => {
  const asRaw = typeof options?.query === 'string' && options.query.includes('raw');

  if (pattern.includes('/src/content/blog/')) {
    return {
      '/src/content/blog/prologue/+prologue.md': asRaw
        ? () => Promise.resolve('Prologue content')
        : () =>
            Promise.resolve({
              metadata: {
                published: true,
                name: 'Prologue',
                description: 'Prologue description',
                date: '2025-04-09',
                tags: ['Blog'],
                image: 'image.png',
                icon: 'ph:star'
              }
            })
    };
  }

  if (pattern.includes('/src/content/projects/')) {
    return {
      '/src/content/projects/example/+example.md': asRaw
        ? () => Promise.resolve('Example project content')
        : () =>
            Promise.resolve({
              metadata: {
                published: true,
                name: 'Example Project',
                description: 'Example project description',
                date: '2025-03-01',
                tags: ['Projects'],
                thumbnail: 'thumb.png',
                website: 'https://example.com',
                github: 'https://github.com/example/repo'
              }
            })
    };
  }

  return {};
});

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
