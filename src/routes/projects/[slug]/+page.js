import { nameFromPath, importOgImage } from '$lib/js/posts.js';
import { buildProjectJsonLd, buildImageObject } from '$lib/utils/structured-data.js';
import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';

export async function load({ params }) {
  const modules = import.meta.glob('/src/content/projects/*/*.md');

  let match = {};

  for (const [path, resolver] of Object.entries(modules)) {
    if (nameFromPath(path) === params.slug) {
      match = { path, resolver };
      break;
    }
  }

  const post = await match?.resolver?.();

  if (!post || (!post.metadata.published && !dev)) {
    throw error(404, 'Project Not Found');
  }

  let image = null;
  if (post.metadata.images?.length) {
    let imagePath = match.path.split('/').slice(0, -1).join('/') + '/' + post.metadata.images[0];
    image = await importOgImage(imagePath);
  }

  const imageObjects = post.metadata.images?.length
    ? (
        await Promise.all(
          post.metadata.images.map(async (item) => {
            const imagePath = match.path.split('/').slice(0, -1).join('/') + '/' + item;
            const imageModule = await importOgImage(imagePath);
            return buildImageObject(imageModule);
          })
        )
      ).filter(Boolean)
    : [];

  const jsonLd = buildProjectJsonLd({ ...post.metadata, slug: params.slug }, imageObjects);

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
