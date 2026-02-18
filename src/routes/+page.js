import { buildWebSiteJsonLd } from '$lib/utils/structured-data.js';

export function load() {
  return {
    meta: {
      title: 'Tech Quests | A SRE saga on technological adventures',
      description:
        'The saga of Andre Nogueira, a Site Reliability Engineer sharing insights on homelabs, software engineering, and technological adventures.',
      type: 'blog',
      jsonLd: buildWebSiteJsonLd()
    }
  };
}
