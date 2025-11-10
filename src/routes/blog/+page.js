import { getPosts } from '$lib/js/posts.js';

export async function load() {
  const modules = import.meta.glob('/src/content/blog/*/*.md');
  let posts = await getPosts(modules);

  // Sort blog posts by date descending
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    posts,
    meta: {
      title: 'Blog',
      description: 'Posts about various topics.',
      type: 'blog-posts'
    }
  };
}
