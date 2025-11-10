import { getPosts } from '$lib/js/posts.js';

export async function load() {
  const modules = import.meta.glob('/src/content/projects/*/*.md');
  let posts = await getPosts(modules);

  posts.sort((b, a) => new Date(b.date) - new Date(a.date));

  return {
    posts,
    meta: {
      title: 'Projects',
      description: "Projects I've worked on.",
      type: 'blog-projects'
    }
  };
}
