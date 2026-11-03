// Regenerate the social/OG share cards (from template.html) and the favicon:
//   static/og/home.png + static/blog.png   site default card
//   static/og/blog/<slug>.png              one per published blog post
//   static/og/projects/<slug>.png          one per published project
//   static/favicon.png                     180x180 favicon fallback and apple-touch-icon
//
// Usage: npm run og (runs node scripts/og/generate.mjs)
// Writes static/og/**, static/blog.png and static/favicon.png.
// Renders 1200x630 PNGs (the size declared in the OG meta tags, see
// src/lib/components/PageHead.svelte) with Playwright (Chromium), reusing one page.
// Content comes from src/content/{blog,projects}/<slug>/*.md; entries with
// `published: false` are skipped. template.html must expose window.render(data).
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { homedir } from 'os';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import {
  CAMPAIGNS,
  CATS,
  LIFE,
  decorateProject,
  decoratePosts,
  pad
} from '../../src/lib/js/site.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');
const templateUrl = 'file://' + join(__dirname, 'template.html');
const staticDir = join(root, 'static');

// Card accents: the campaign and category colours as hex (the site uses CSS vars).
const CAT_HEX = {
  terminal: '#9ccfd8',
  web: '#ebbcba',
  platform: '#c4a7e7',
  mobile: '#f6c177',
  desktop: '#31748f',
  imaging: '#eb6f92'
};

// Frontmatter is the block between the first two `---` lines, read as flat `key: value`
// pairs. Blank, `# comment` and list lines are skipped; array values such as
// `images: [a.png]` are kept as raw strings.
function parseMarkdown(src) {
  const lines = src.split(/\r?\n/);
  const open = lines.findIndex((l) => l.trim() === '---');
  const close = lines.findIndex((l, i) => i > open && l.trim() === '---');
  if (open === -1 || close === -1) return { data: {}, body: src };
  const data = {};
  for (const raw of lines.slice(open + 1, close)) {
    const m = /^([A-Za-z_][\w-]*)\s*:(.*)$/.exec(raw.trim());
    if (!m) continue;
    let value = m[2].trim();
    if (/^(['"]).*\1$/.test(value)) value = value.slice(1, -1);
    else if (value === 'true' || value === 'false') value = value === 'true';
    data[m[1]] = value;
  }
  return { data, body: lines.slice(close + 1).join('\n') };
}

// Entries are the subdirectories of src/content/<collection>, each holding one .md file
// (slug = directory name). Unpublished entries are dropped here.
function loadEntries(collection) {
  const dir = join(root, 'src/content', collection);
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .flatMap((slug) => {
      const file = readdirSync(join(dir, slug))
        .sort()
        .find((f) => f.endsWith('.md'));
      if (!file) return [];
      const { data, body } = parseMarkdown(readFileSync(join(dir, slug, file), 'utf8'));
      return data.published === false ? [] : [{ slug, data, body }];
    });
}

// ~200 words per minute, rounded up, at least one minute.
const readTime = (body) => {
  const words = body.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
};

// Newest first; undated entries last.
const timeOf = (date) => (date ? new Date(date).getTime() : -Infinity);

// Use whatever Chromium build Playwright already has cached, so we don't need to
// download a new one on version bumps. Falls back to Playwright's default.
function findChromium() {
  const base = join(homedir(), 'Library/Caches/ms-playwright');
  if (!existsSync(base)) return undefined;
  const dirs = readdirSync(base)
    .filter((d) => d.startsWith('chromium'))
    .sort()
    .reverse();
  for (const d of dirs) {
    for (const rel of [
      'chrome-headless-shell-mac-arm64/chrome-headless-shell',
      'chrome-mac/Chromium.app/Contents/MacOS/Chromium'
    ]) {
      const p = join(base, d, rel);
      if (existsSync(p)) return p;
    }
  }
  return undefined;
}

// Content: blog posts (campaign chapters and side quests) and projects, decorated by site.js.
const posts = decoratePosts(
  loadEntries('blog').map(({ slug, data, body }) => ({ slug, ...data, body }))
);
const projects = loadEntries('projects')
  .map(({ slug, data }) => decorateProject({ slug, ...data }))
  .sort((a, b) => timeOf(b.date) - timeOf(a.date));

const browser = await chromium.launch({ executablePath: findChromium() });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto(templateUrl, { waitUntil: 'networkidle' });

  // Render one card on the shared page, then write the same PNG to every output path.
  const renderCard = async (data, ...outFiles) => {
    await page.evaluate((d) => window.render(d), data);
    // Ensure webfonts are ready before the screenshot.
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const png = await page.screenshot({ type: 'png' });
    for (const file of outFiles) {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, png);
      console.log('Wrote', file);
    }
  };

  // Site default card.
  await renderCard(
    {
      topLeftLabel: 'Field journal · ',
      topLeftEm: 'André Nogueira',
      topRight: `Vol. ${new Date().getFullYear()}`,
      title: 'Every post is a quest.',
      sub: 'Notes from a platform engineer building things: homelabs, terminal tools and side projects.',
      bottomRight: 'techquests.dev',
      titleSize: 88
    },
    join(staticDir, 'og/home.png'),
    join(staticDir, 'blog.png')
  );

  for (const p of posts) {
    const out = join(staticDir, 'og/blog', `${p.slug}.png`);
    const bottomRight = readTime(p.body);
    if (p.campaign) {
      await renderCard(
        {
          accent: CAMPAIGNS[p.campaign].hex,
          topLeftLabel: 'Campaign · ',
          topLeftEm: CAMPAIGNS[p.campaign].name,
          topRight: `Act ${pad(p.act, 2)}`,
          number: pad(p.act, 2),
          title: p.title,
          sub: p.name,
          bottomRight
        },
        out
      );
    } else {
      // Side quests have no accent, so the template default applies.
      await renderCard(
        {
          topLeftLabel: 'Side quest · ',
          topLeftEm: `Quest ${pad(p.n)}`,
          topRight: '',
          number: pad(p.n),
          title: p.title,
          sub: p.desc,
          bottomRight
        },
        out
      );
    }
  }

  // Projects, newest first; the number is the position in that order.
  for (const [i, p] of projects.entries()) {
    // Footer: GitHub, else website, else the site domain; scheme stripped.
    const footer = (p.github || p.website || 'techquests.dev').replace('https://', '');
    await renderCard(
      {
        accent: CAT_HEX[p.cat],
        topLeftLabel: 'Artifact · ',
        topLeftEm: CATS[p.cat],
        topRight: LIFE[p.life],
        number: pad(i + 1, 2),
        title: p.name,
        sub: p.description,
        bottomRight: footer,
        bottomRightSmall: true
      },
      join(staticDir, 'og/projects', `${p.slug}.png`)
    );
  }

  // Raster favicon / apple-touch-icon from the brand mark (light ink on the dark ground).
  const icon = await browser.newPage({ viewport: { width: 180, height: 180 } });
  await icon.setContent(
    '<body style="margin:0;background:#191724;display:grid;place-items:center;height:180px">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-395 -195 790 390" width="140">' +
      '<path fill="none" stroke="#e0def4" stroke-width="56" stroke-linecap="round" d="M-350 0A155 155 0 0 1-71.9-94L71.9 94A155 155 0 1 0 71.9-94L-71.9 94"/></svg></body>'
  );
  const iconFile = join(staticDir, 'favicon.png');
  writeFileSync(iconFile, await icon.screenshot({ type: 'png' }));
  console.log('Wrote', iconFile);
} finally {
  await browser.close();
}
