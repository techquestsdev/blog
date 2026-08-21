import { buildPersonJsonLd } from '$lib/utils/structured-data.js';

export function load() {
  return {
    meta: {
      title: 'About Andre Nogueira | Tech Quests',
      description:
        'About Andre Nogueira and Tech Quests — long-form posts, projects, and videos on Site Reliability Engineering and platform work.',
      type: 'blog-about',
      jsonLd: buildPersonJsonLd()
    }
  };
}
