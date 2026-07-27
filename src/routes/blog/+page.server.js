import { getPosts, nameFromPath } from '$lib/js/posts.js';
import { readingJourney } from '$lib/utils/reading-time.js';

export async function load() {
  const modules = import.meta.glob('/src/content/blog/*/*.md');
  let posts = await getPosts(modules);

  // Raw markdown (eager, build-time) → word-count reading time per slug.
  const raws = import.meta.glob('/src/content/blog/*/*.md', {
    query: '?raw',
    import: 'default',
    eager: true
  });
  const journeys = {};
  for (const [path, text] of Object.entries(raws)) {
    journeys[nameFromPath(path)] = readingJourney(text);
  }
  posts = posts.map((p) => ({ ...p, journey: journeys[p.slug] }));

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
