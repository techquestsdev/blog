export const prerender = true;

export const load = ({ url }) => {
  const { pathname } = url;

  return {
    pathname,
    meta: {
      title: 'Tech Quests',
      description: 'The saga of a SRE sharing his technological adventures.',
      type: 'blog'
    }
  };
};
