import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the getPosts function
vi.mock('$lib/js/posts.js', () => ({
  getPosts: vi.fn()
}));

describe('Blog Page Load Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return posts and meta information', async () => {
    const { load } = await import('./+page.js');
    const { getPosts } = await import('$lib/js/posts.js');

    const mockPosts = [
      {
        slug: 'post-2',
        title: 'Second Post',
        date: '2023-01-02',
        description: 'Second post description'
      },
      {
        slug: 'post-1',
        title: 'First Post',
        date: '2023-01-01',
        description: 'First post description'
      }
    ];

    getPosts.mockResolvedValue(mockPosts);

    const result = await load();

    expect(result).toHaveProperty('posts');
    expect(result).toHaveProperty('meta');
    expect(getPosts).toHaveBeenCalledTimes(1);

    // Check that posts are sorted by date (newest first)
    expect(result.posts[0].slug).toBe('post-2');
    expect(result.posts[1].slug).toBe('post-1');
  });
  it('should sort posts by date in descending order', async () => {
    const { load } = await import('./+page.js');
    const { getPosts } = await import('$lib/js/posts.js');

    const mockPosts = [
      {
        slug: 'post-1',
        title: 'First Post',
        date: '2023-01-01',
        description: 'First post description'
      },
      {
        slug: 'post-3',
        title: 'Third Post',
        date: '2023-01-03',
        description: 'Third post description'
      },
      {
        slug: 'post-2',
        title: 'Second Post',
        date: '2023-01-02',
        description: 'Second post description'
      }
    ];

    getPosts.mockResolvedValue(mockPosts);

    const result = await load();

    // Posts should be sorted by date, newest first
    expect(result.posts[0].slug).toBe('post-3');
    expect(result.posts[1].slug).toBe('post-2');
    expect(result.posts[2].slug).toBe('post-1');
  });

  it('should return meta object structure', async () => {
    const { load } = await import('./+page.js');
    const { getPosts } = await import('$lib/js/posts.js');

    getPosts.mockResolvedValue([]);

    const result = await load();

    expect(result.meta).toEqual({
      title: 'Blog',
      description: 'Posts about various topics.',
      type: 'blog-posts'
    });
  });

  it('should work with empty posts', async () => {
    const { load } = await import('./+page.js');
    const { getPosts } = await import('$lib/js/posts.js');

    getPosts.mockResolvedValue([]);

    const result = await load();

    expect(result.posts).toEqual([]);
    expect(result.meta).toBeDefined();
  });

  it('should gracefully handle posts with malformed dates', async () => {
    const { load } = await import('./+page.js');
    const { getPosts } = await import('$lib/js/posts.js');

    const mockPosts = [
      {
        slug: 'post-1',
        title: 'Post with valid date',
        date: '2023-01-01',
        description: 'Description'
      },
      {
        slug: 'post-2',
        title: 'Post with invalid date',
        date: 'invalid-date',
        description: 'Description'
      }
    ];

    getPosts.mockResolvedValue(mockPosts);

    const result = await load();

    // Should not throw and should still return posts
    expect(result.posts).toHaveLength(2);
  });
  it('should handle empty posts array', async () => {
    const { load } = await import('./+page.js');
    const { getPosts } = await import('$lib/js/posts.js');

    getPosts.mockResolvedValue([]);

    const result = await load();

    expect(result.posts).toEqual([]);
    expect(result.meta).toBeDefined();
  });

  it('should handle posts with invalid dates', async () => {
    const { load } = await import('./+page.js');
    const { getPosts } = await import('$lib/js/posts.js');

    const mockPosts = [
      {
        slug: 'post-1',
        title: 'Post with valid date',
        date: '2023-01-01',
        description: 'Description'
      },
      {
        slug: 'post-2',
        title: 'Post with invalid date',
        date: 'invalid-date',
        description: 'Description'
      }
    ];

    getPosts.mockResolvedValue(mockPosts);

    const result = await load();

    // Should not throw and should still return posts
    expect(result.posts).toHaveLength(2);
  });

  it('should handle posts with same dates', async () => {
    const { load } = await import('./+page.js');
    const { getPosts } = await import('$lib/js/posts.js');

    const mockPosts = [
      {
        slug: 'post-1',
        title: 'First Post',
        date: '2023-01-01',
        description: 'Description'
      },
      {
        slug: 'post-2',
        title: 'Second Post',
        date: '2023-01-01',
        description: 'Description'
      }
    ];

    getPosts.mockResolvedValue(mockPosts);

    const result = await load();

    // Should not throw and should handle same dates gracefully
    expect(result.posts).toHaveLength(2);
    expect(result.meta).toBeDefined();
  });

  it('should handle posts without dates', async () => {
    const { load } = await import('./+page.js');
    const { getPosts } = await import('$lib/js/posts.js');

    const mockPosts = [
      {
        slug: 'post-1',
        title: 'Post without date',
        description: 'Description'
      }
    ];

    getPosts.mockResolvedValue(mockPosts);

    const result = await load();

    // Should handle posts without dates
    expect(result.posts).toHaveLength(1);
    expect(result.meta).toBeDefined();
  });
});
