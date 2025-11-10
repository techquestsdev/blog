import { describe, it, expect, vi } from 'vitest';

/**
 * Advanced testing scenarios for blog functionality
 * This demonstrates testing complex scenarios and edge cases
 */

describe('Advanced Blog Testing Scenarios', () => {
  describe('Content Management System', () => {
    class ContentManager {
      constructor() {
        this.posts = [];
        this.subscribers = [];
        this.cache = new Map();
      }

      addPost(post) {
        // Use both timestamp and random number to ensure uniqueness
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const newPost = {
          id: `post_${timestamp}_${random}`,
          ...post,
          createdAt: new Date(timestamp),
          updatedAt: new Date(timestamp),
          views: 0,
          status: 'draft'
        };

        this.posts.push(newPost);
        this.notifySubscribers('post_added', newPost);
        this.invalidateCache();

        return newPost;
      }

      updatePost(id, updates) {
        const post = this.posts.find((p) => p.id === id);
        if (!post) {
          throw new Error(`Post with id ${id} not found`);
        }

        Object.assign(post, updates, { updatedAt: new Date() });
        this.invalidateCache();
        this.notifySubscribers('post_updated', post);
        return post;
      }

      getPost(id) {
        return this.posts.find((p) => p.id === id);
      }

      publishPost(id) {
        const post = this.posts.find((p) => p.id === id);
        if (!post) {
          throw new Error(`Post with id ${id} not found`);
        }

        if (post.status === 'published') {
          throw new Error('Post is already published');
        }

        post.status = 'published';
        post.publishedAt = new Date();
        post.updatedAt = new Date();

        this.notifySubscribers('post_published', post);
        this.invalidateCache();

        return post;
      }

      getPublishedPosts() {
        const cacheKey = 'published_posts';

        if (this.cache.has(cacheKey)) {
          return this.cache.get(cacheKey);
        }

        const published = this.posts
          .filter((post) => post.status === 'published')
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

        this.cache.set(cacheKey, published);
        return published;
      }

      incrementViews(id) {
        const post = this.posts.find((p) => p.id === id);
        if (post && post.status === 'published') {
          post.views++;
          post.updatedAt = new Date();
          this.invalidateCache();
          return post;
        }
        return null;
      }

      subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
          const index = this.subscribers.indexOf(callback);
          if (index > -1) {
            this.subscribers.splice(index, 1);
          }
        };
      }

      notifySubscribers(event, data) {
        this.subscribers.forEach((callback) => {
          try {
            callback(event, data);
          } catch (error) {
            console.error('Subscriber error:', error);
          }
        });
      }

      invalidateCache() {
        this.cache.clear();
      }

      getStats() {
        const total = this.posts.length;
        const published = this.posts.filter((p) => p.status === 'published').length;
        const drafts = total - published;
        const totalViews = this.posts
          .filter((p) => p.status === 'published')
          .reduce((sum, post) => sum + post.views, 0);

        return { total, published, drafts, totalViews };
      }
    }

    it('should manage post lifecycle correctly', async () => {
      const cms = new ContentManager();

      // Create a post
      const post = cms.addPost({
        title: 'Test Post',
        content: 'This is a test post'
      });

      expect(post).toMatchObject({
        id: expect.any(String),
        title: 'Test Post',
        content: 'This is a test post',
        status: 'draft',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        views: 0
      });

      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 1));

      // Update the post
      const updatedPost = cms.updatePost(post.id, {
        title: 'Updated Test Post',
        content: 'Updated content'
      });

      expect(updatedPost.title).toBe('Updated Test Post');
      expect(updatedPost.content).toBe('Updated content');
      expect(updatedPost.updatedAt.getTime()).toBeGreaterThanOrEqual(post.updatedAt.getTime());

      // Publish the post
      cms.publishPost(post.id);
      const publishedPost = cms.getPost(post.id);
      expect(publishedPost.status).toBe('published');

      // Get published posts
      const publishedPosts = cms.getPublishedPosts();
      expect(publishedPosts).toHaveLength(1);
      expect(publishedPosts[0].id).toBe(post.id);
    });

    it('should handle event subscriptions correctly', () => {
      const cms = new ContentManager();
      const events = [];

      const unsubscribe = cms.subscribe((event, data) => {
        events.push({ event, data });
      });

      const post = cms.addPost({ title: 'Event Test', content: 'Content' });
      cms.publishPost(post.id);

      expect(events).toHaveLength(2);
      expect(events[0]).toMatchObject({
        event: 'post_added',
        data: expect.objectContaining({ title: 'Event Test' })
      });
      expect(events[1]).toMatchObject({
        event: 'post_published',
        data: expect.objectContaining({ status: 'published' })
      });

      unsubscribe();

      // Should not receive more events
      cms.addPost({ title: 'Another Post', content: 'More content' });
      expect(events).toHaveLength(2);
    });

    it('should implement caching correctly', () => {
      const cms = new ContentManager();

      // Add multiple posts
      const post1 = cms.addPost({ title: 'First Post', content: 'Content 1' });
      const post2 = cms.addPost({ title: 'Second Post', content: 'Content 2' });

      // Publish them
      cms.publishPost(post1.id);
      cms.publishPost(post2.id);

      // First call should populate cache
      const published1 = cms.getPublishedPosts();
      expect(published1).toHaveLength(2);

      // Second call should use cache (same reference)
      const published2 = cms.getPublishedPosts();
      expect(published2).toBe(published1); // Same reference means cache was used

      // Adding new post should invalidate cache
      const post3 = cms.addPost({ title: 'Third Post', content: 'Content 3' });
      cms.publishPost(post3.id);

      const published3 = cms.getPublishedPosts();
      expect(published3).not.toBe(published1); // Different reference means cache was invalidated
      expect(published3).toHaveLength(3);
    });

    it('should track views and statistics correctly', () => {
      const cms = new ContentManager();

      const post1 = cms.addPost({ title: 'Popular Post', content: 'Great content' });
      const post2 = cms.addPost({ title: 'Draft Post', content: 'Draft content' });

      // Verify posts are different
      expect(post1.id).not.toBe(post2.id);
      expect(post1.status).toBe('draft');
      expect(post2.status).toBe('draft');

      cms.publishPost(post1.id);

      // Verify only post1 is published
      const publishedPost1 = cms.getPost(post1.id);
      const draftPost2 = cms.getPost(post2.id);
      expect(publishedPost1.status).toBe('published');
      expect(draftPost2.status).toBe('draft');

      // Increment views on published post
      const result1 = cms.incrementViews(post1.id);
      const result2 = cms.incrementViews(post1.id);
      const result3 = cms.incrementViews(post1.id);

      expect(result1).toBeTruthy(); // Should return the post
      expect(result2).toBeTruthy(); // Should return the post
      expect(result3).toBeTruthy(); // Should return the post

      // Try to increment views on draft post (should not work)
      const draftResult = cms.incrementViews(post2.id);
      expect(draftResult).toBeNull();

      const stats = cms.getStats();
      expect(stats).toEqual({
        total: 2,
        published: 1,
        drafts: 1,
        totalViews: 3
      });

      const publishedPosts = cms.getPublishedPosts();
      expect(publishedPosts[0].views).toBe(3);
    });

    it('should handle error cases appropriately', () => {
      const cms = new ContentManager();

      // Try to publish non-existent post
      expect(() => cms.publishPost('invalid_id')).toThrow('Post with id invalid_id not found');

      // Try to publish already published post
      const post = cms.addPost({ title: 'Test', content: 'Content' });
      cms.publishPost(post.id);

      expect(() => cms.publishPost(post.id)).toThrow('Post is already published');
    });

    it('should handle subscriber errors gracefully', () => {
      const cms = new ContentManager();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Add a failing subscriber
      cms.subscribe(() => {
        throw new Error('Subscriber failed');
      });

      // Add a working subscriber
      const events = [];
      cms.subscribe((event, data) => {
        events.push({ event, data });
      });

      // This should not throw, even though one subscriber fails
      expect(() => {
        cms.addPost({ title: 'Test', content: 'Content' });
      }).not.toThrow();

      expect(events).toHaveLength(1);
      expect(consoleSpy).toHaveBeenCalledWith('Subscriber error:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('Search and Filtering', () => {
    const createTestPosts = () => [
      {
        id: '1',
        title: 'JavaScript Basics',
        content: 'Learn JS fundamentals',
        tags: ['javascript', 'beginners'],
        category: 'programming'
      },
      {
        id: '2',
        title: 'Advanced React Patterns',
        content: 'Complex React techniques',
        tags: ['react', 'javascript', 'advanced'],
        category: 'programming'
      },
      {
        id: '3',
        title: 'CSS Grid Layout',
        content: 'Master CSS Grid',
        tags: ['css', 'layout'],
        category: 'design'
      },
      {
        id: '4',
        title: 'DevOps Best Practices',
        content: 'CI/CD and deployment',
        tags: ['devops', 'deployment'],
        category: 'operations'
      },
      {
        id: '5',
        title: 'TypeScript for Beginners',
        content: 'Getting started with TS',
        tags: ['typescript', 'javascript', 'beginners'],
        category: 'programming'
      }
    ];

    const searchPosts = (posts, query) => {
      const normalizedQuery = query.toLowerCase();
      return posts.filter(
        (post) =>
          post.title.toLowerCase().includes(normalizedQuery) ||
          post.content.toLowerCase().includes(normalizedQuery) ||
          post.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
      );
    };

    const filterByTag = (posts, tag) => {
      return posts.filter((post) => post.tags.includes(tag));
    };

    const filterByCategory = (posts, category) => {
      return posts.filter((post) => post.category === category);
    };

    const sortPosts = (posts, sortBy = 'title', order = 'asc') => {
      return [...posts].sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];

        if (order === 'desc') {
          return bVal.localeCompare ? bVal.localeCompare(aVal) : bVal - aVal;
        }

        return aVal.localeCompare ? aVal.localeCompare(bVal) : aVal - bVal;
      });
    };

    it('should search posts by title, content, and tags', () => {
      const posts = createTestPosts();

      expect(searchPosts(posts, 'javascript')).toHaveLength(3);
      expect(searchPosts(posts, 'react')).toHaveLength(1);
      expect(searchPosts(posts, 'beginners')).toHaveLength(2);
      expect(searchPosts(posts, 'css')).toHaveLength(1);
      expect(searchPosts(posts, 'nonexistent')).toHaveLength(0);
    });

    it('should filter posts by tags', () => {
      const posts = createTestPosts();

      expect(filterByTag(posts, 'javascript')).toHaveLength(3);
      expect(filterByTag(posts, 'beginners')).toHaveLength(2);
      expect(filterByTag(posts, 'advanced')).toHaveLength(1);
    });

    it('should filter posts by category', () => {
      const posts = createTestPosts();

      expect(filterByCategory(posts, 'programming')).toHaveLength(3);
      expect(filterByCategory(posts, 'design')).toHaveLength(1);
      expect(filterByCategory(posts, 'operations')).toHaveLength(1);
    });

    it('should sort posts correctly', () => {
      const posts = createTestPosts();

      const sortedByTitle = sortPosts(posts, 'title');
      expect(sortedByTitle[0].title).toBe('Advanced React Patterns');
      expect(sortedByTitle[4].title).toBe('TypeScript for Beginners');

      const sortedByTitleDesc = sortPosts(posts, 'title', 'desc');
      expect(sortedByTitleDesc[0].title).toBe('TypeScript for Beginners');
      expect(sortedByTitleDesc[4].title).toBe('Advanced React Patterns');
    });

    it('should combine search and filtering', () => {
      const posts = createTestPosts();

      // Search for javascript and filter by beginners tag
      const jsResults = searchPosts(posts, 'javascript');
      const beginnersJs = filterByTag(jsResults, 'beginners');

      expect(beginnersJs).toHaveLength(2);
      expect(
        beginnersJs.every(
          (post) => post.tags.includes('javascript') && post.tags.includes('beginners')
        )
      ).toBe(true);
    });
  });
});
