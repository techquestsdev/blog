export const prerender = true;

export const load = ({ url }) => {
  const { pathname } = url;

  return {
    pathname,
    meta: {
      title: 'Tech Quests | A SRE saga on technological adventures',
      description:
        'The saga of Andre Nogueira, a Site Reliability Engineer sharing insights on homelabs, software engineering, and technological adventures.',
      type: 'blog'
    }
  };
};
