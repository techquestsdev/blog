import { describe, it, expect, vi } from 'vitest';
import { nameFromPath, getPosts, importOgImage } from './posts.js';

describe('nameFromPath', () => {
  it('should extract filename from a simple path', () => {
    const result = nameFromPath('/blog/my-post.md');
    expect(result).toBe('my-post');
  });

  it('should handle complex paths', () => {
    const result = nameFromPath('/src/content/blog/homelab-chapter-1/+page.md');
    expect(result).toBe('page');
  });

  it('should remove leading plus signs', () => {
    const result = nameFromPath('/blog/++special-post.md');
    expect(result).toBe('special-post');
  });

  it('should handle paths without extensions', () => {
    const result = nameFromPath('/blog/my-post');
    expect(result).toBe('my-post');
  });

  it('should handle deep nested paths', () => {
    const result = nameFromPath('/very/deep/nested/path/to/my-file.js');
    expect(result).toBe('my-file');
  });

  it('should handle single filename', () => {
    const result = nameFromPath('filename.txt');
    expect(result).toBe('filename');
  });
});

describe('getPosts', () => {
  it('should process modules and return posts with metadata', async () => {
    const mockModules = {
      '/blog/post1.md': () =>
        Promise.resolve({
          metadata: {
            title: 'Test Post 1',
            date: '2023-01-01',
            description: 'A test post',
            published: true
          }
        }),
      '/blog/post2.md': () =>
        Promise.resolve({
          metadata: {
            title: 'Test Post 2',
            date: '2023-01-02',
            description: 'Another test post',
            published: true
          }
        })
    };

    // Mock dev environment to true to include all posts
    vi.doMock('$app/environment', () => ({
      dev: true
    }));

    const posts = await getPosts(mockModules);

    expect(posts).toHaveLength(2);
    expect(posts[0]).toEqual({
      slug: 'post1',
      title: 'Test Post 1',
      date: '2023-01-01',
      description: 'A test post',
      published: true
    });
    expect(posts[1]).toEqual({
      slug: 'post2',
      title: 'Test Post 2',
      date: '2023-01-02',
      description: 'Another test post',
      published: true
    });
  });
  it('should filter unpublished posts in production', async () => {
    const mockModules = {
      '/blog/published.md': () =>
        Promise.resolve({
          metadata: {
            title: 'Published Post',
            published: true
          }
        }),
      '/blog/draft.md': () =>
        Promise.resolve({
          metadata: {
            title: 'Draft Post',
            published: false
          }
        }),
      '/blog/no-published.md': () =>
        Promise.resolve({
          metadata: {
            title: 'Post without published field'
          }
        })
    };

    // Mock the environment module before importing
    vi.doMock('$app/environment', () => ({
      dev: false
    }));

    // Dynamically import to get the mocked version
    const { getPosts } = await import('./posts.js?timestamp=' + Date.now());

    const posts = await getPosts(mockModules);

    // Should only include posts with published: true
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe('Published Post');

    // Clean up
    vi.doUnmock('$app/environment');
  });

  it('should handle empty modules object', async () => {
    const posts = await getPosts({});
    expect(posts).toEqual([]);
  });

  it('should handle posts without published field', async () => {
    const mockModules = {
      '/blog/no-published-field.md': () =>
        Promise.resolve({
          metadata: {
            title: 'No Published Field',
            date: '2023-01-01'
          }
        })
    };

    vi.mock('$app/environment', () => ({
      dev: false
    }));

    const posts = await getPosts(mockModules);

    // Posts without published field should be filtered out in production
    expect(posts).toHaveLength(0);
  });
});

describe('importOgImage', () => {
  it('should return undefined when no matching image is found', async () => {
    const result = await importOgImage('non-existent-image');
    expect(result).toBeUndefined();
  });

  it('should be a function', () => {
    expect(typeof importOgImage).toBe('function');
  });

  it('should handle empty imagePath and match existing images', async () => {
    const result = await importOgImage('');
    // The function will find images that contain empty string (which is any image)
    // This is actually expected behavior, so we test that it returns something
    expect(result).toBeDefined();
  });

  it('should handle null or undefined imagePath', async () => {
    const result1 = await importOgImage(null);
    const result2 = await importOgImage(undefined);
    expect(result1).toBeUndefined();
    expect(result2).toBeUndefined();
  });
});
