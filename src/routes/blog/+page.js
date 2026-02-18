import { getPosts } from '$lib/js/posts.js';

export async function load() {
  const modules = import.meta.glob('/src/content/blog/*/*.md');
  let posts = await getPosts(modules);

  // Sort blog posts by date descending
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    posts,
    meta: {
      title: 'Blog | Technological Adventures and SRE Insights',
      description:
        'Explore a collection of articles and tutorials on Site Reliability Engineering, homelabs, and various technological adventures.',
      type: 'blog-posts'
    }
  };
}
