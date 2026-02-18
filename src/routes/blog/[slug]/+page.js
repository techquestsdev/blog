import { nameFromPath, importOgImage } from '$lib/js/posts.js';
import { buildBlogPostingJsonLd, buildImageObject } from '$lib/utils/structured-data.js';
import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';

export async function load({ params }) {
  const modules = import.meta.glob('/src/content/blog/*/*.md');

  let match = {};

  for (const [path, resolver] of Object.entries(modules)) {
    if (nameFromPath(path) === params.slug) {
      match = { path, resolver };
      break;
    }
  }

  const post = await match?.resolver?.();

  if (!post || (!post.metadata.published && !dev)) {
    throw error(404, 'Post Not Found');
  }

  let imagePath = match.path.split('/').slice(0, -1).join('/') + '/' + post.metadata.ogImage;
  let image = await importOgImage(imagePath);

  const jsonLd = buildBlogPostingJsonLd(
    { ...post.metadata, slug: params.slug },
    buildImageObject(image)
  );

  return {
    post,
    meta: {
      title: `${post.metadata.name} | Tech Quests`,
      description: post.metadata.description,
      type: 'article',
      image,
      jsonLd
    }
  };
}
