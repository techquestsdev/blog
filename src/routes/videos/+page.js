import { getPosts } from '$lib/js/posts.js';

export async function load() {
  const modules = import.meta.glob('/src/content/videos/*/*.md');
  let videos = await getPosts(modules);

  videos.sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    videos,
    meta: {
      title: 'Videos | Tech Quests',
      description:
        'Tech Quests videos on YouTube — Site Reliability Engineering and platform engineering content.',
      type: 'videos'
    }
  };
}
