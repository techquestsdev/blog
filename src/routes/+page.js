import { buildWebSiteJsonLd } from '$lib/utils/structured-data.js';
import { getPosts } from '$lib/js/posts.js';

export async function load() {
  const posts = await getPosts(import.meta.glob('/src/content/blog/*/*.md'));
  const projects = await getPosts(import.meta.glob('/src/content/projects/*/*.md'));
  const videos = await getPosts(import.meta.glob('/src/content/videos/*/*.md'));
  const sortByDateDesc = (a, b) => {
    if (a.date === undefined) return b.date === undefined ? 0 : 1;
    if (b.date === undefined) return -1;
    return new Date(b.date) - new Date(a.date);
  };

  return {
    meta: {
      title: 'Tech Quests | A SRE saga on technological adventures',
      description:
        'The saga of Andre Nogueira, a Site Reliability Engineer sharing insights on homelabs, software engineering, and technological adventures.',
      type: 'blog',
      jsonLd: buildWebSiteJsonLd()
    },
    posts,
    projects: projects.sort(sortByDateDesc),
    videos: videos.sort(sortByDateDesc)
  };
}
