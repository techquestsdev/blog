// Site metadata helpers.
// Series colours, assigned in order of each series' first post (brand guidelines: love, gold, foam, iris, pine, rose).
const SERIES_COLORS = [
  { color: 'var(--rp-love)', hex: '#eb6f92' },
  { color: 'var(--rp-gold)', hex: '#f6c177' },
  { color: 'var(--rp-foam)', hex: '#9ccfd8' },
  { color: 'var(--rp-iris)', hex: '#c4a7e7' },
  { color: 'var(--rp-pine)', hex: '#31748f' },
  { color: 'var(--rp-rose)', hex: '#ebbcba' }
];
// Optional per-series copy and status; anything not listed gets a name from its slug and status 'active'.
const SERIES = {
  homelab: {
    name: 'Homelab',
    status: 'done',
    blurb: 'Building a Kubernetes homelab from bare metal up.'
  },
  tictactoe: {
    name: 'Tic-Tac-Toe',
    status: 'done',
    blurb: 'One small game, three stacks, two app stores.'
  }
};
// Registry filled by decoratePosts(); keys are series slugs in order of first appearance.
export const CAMPAIGNS = {};

export const STATUS = { active: 'Active', wip: 'In progress', done: 'Complete' };

export const pad = (n, l = 3) => String(n).padStart(l, '0');

export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC'
      })
    : 'Undated';

export const year = (d) => (d ? String(new Date(d).getUTCFullYear()) : '—');

export const campaignOf = (slug) => {
  const match = /^(.+)-chapter-(\d+)$/.exec(slug);
  return match ? { campaign: match[1], act: Number(match[2]) } : { campaign: null, act: null };
};

const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

export const decoratePosts = (posts) => {
  for (const k of Object.keys(CAMPAIGNS)) delete CAMPAIGNS[k];
  const chronological = [...posts]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((post, index) => {
      const { campaign, act } = campaignOf(post.slug);
      return {
        ...post,
        n: index + 1,
        campaign,
        act,
        title: campaign ? post.description : post.name,
        desc: campaign ? '' : post.description
      };
    });
  for (const { campaign } of chronological) {
    if (campaign && !Object.hasOwn(CAMPAIGNS, campaign)) {
      const index = Object.keys(CAMPAIGNS).length;
      CAMPAIGNS[campaign] = {
        name: SERIES[campaign]?.name ?? titleCase(campaign.replace(/-/g, ' ')),
        status: SERIES[campaign]?.status ?? 'active',
        blurb: SERIES[campaign]?.blurb ?? '',
        ...SERIES_COLORS[index % SERIES_COLORS.length]
      };
    }
  }
  return chronological.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const campaignLabel = (p) =>
  p.campaign ? `${CAMPAIGNS[p.campaign].name} · Act ${p.act}` : 'Side quest';

export const CATS = {
  terminal: 'Terminal',
  web: 'Web',
  platform: 'Platforms & search',
  mobile: 'Mobile & games',
  desktop: 'Desktop & canvas',
  imaging: 'Imaging'
};

const CAT_OF = {
  tela: 'desktop',
  houndr: 'platform',
  hashpad: 'web',
  howto: 'terminal',
  'code-search-documentation': 'platform',
  'mac-free': 'terminal',
  'git-context': 'terminal',
  'crontab-guru': 'terminal',
  tictactoe: 'mobile',
  beer: 'mobile',
  'code-search': 'platform',
  'code-search-cli': 'terminal',
  'roi-blur': 'imaging',
  videmo: 'web'
};

const STACK_OF = {
  tela: 'Rust · WASM · Tauri',
  houndr: 'Rust',
  hashpad: 'Web',
  howto: 'CLI',
  'code-search-documentation': 'Docs',
  'mac-free': 'CLI',
  'git-context': 'CLI',
  'crontab-guru': 'Go · TUI',
  tictactoe: 'React Native · Go',
  beer: 'Mobile',
  'code-search': 'Platform',
  'code-search-cli': 'CLI',
  'roi-blur': 'Python · OpenCV',
  videmo: 'Web · AI'
};

const LIFE_OF = {
  tela: 'active',
  houndr: 'active',
  beer: 'archived',
  videmo: 'archived'
};

export const LIFE = { active: 'Active', stable: 'Stable', archived: 'Archived' };

export const decorateProject = (p) => ({
  ...p,
  cat: CAT_OF[p.slug] ?? 'terminal',
  stack: STACK_OF[p.slug] ?? '',
  life:
    LIFE_OF[p.slug] ??
    (p.status === 'evolving' ? 'active' : p.status === 'archived' ? 'archived' : 'stable')
});
