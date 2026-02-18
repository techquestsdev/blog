import { buildPersonJsonLd } from '$lib/utils/structured-data.js';

export function load() {
  return {
    meta: {
      title: 'About Andre Nogueira | Tech Quests',
      description:
        'Learn more about Andre Nogueira, the Site Reliability Engineer behind Tech Quests, and the purpose of this blog.',
      type: 'blog-about',
      jsonLd: buildPersonJsonLd()
    }
  };
}
