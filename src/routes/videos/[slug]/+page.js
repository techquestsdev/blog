import { error } from '@sveltejs/kit';
import { buildVideoJsonLd } from '$lib/utils/structured-data.js';

export async function load({ params }) {
  const modules = import.meta.glob('/src/content/videos/*/*.md');
  const path = Object.keys(modules).find((p) => p.endsWith(`/+${params.slug}.md`));

  if (!path) {
    throw error(404, `Video "${params.slug}" not found`);
  }

  const mod = await modules[path]();
  const meta = mod.metadata;
  const jsonLd = buildVideoJsonLd({ ...meta, slug: params.slug });
  const ogImage = meta.youtubeId
    ? {
        img: {
          src: `https://i.ytimg.com/vi/${meta.youtubeId}/maxresdefault.jpg`,
          w: 1280,
          h: 720
        }
      }
    : null;

  return {
    video: {
      slug: params.slug,
      ...meta
    },
    Content: mod.default,
    meta: {
      title: `${meta.name} | Tech Quests Videos`,
      description: meta.description,
      type: 'video',
      image: ogImage,
      jsonLd
    }
  };
}
