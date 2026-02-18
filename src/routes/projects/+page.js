import { getPosts } from '$lib/js/posts.js';

export async function load() {
  const modules = import.meta.glob('/src/content/projects/*/*.md');
  let posts = await getPosts(modules);

  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    posts,
    meta: {
      title: 'Projects | Open Source and Personal Works',
      description:
        'Discover the various open source projects and personal software works developed by Andre Nogueira at Tech Quests.',
      type: 'blog-projects'
    }
  };
}
