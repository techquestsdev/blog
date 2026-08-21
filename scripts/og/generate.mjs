// Regenerate the social/OG share image (static/blog.png) from template.html.
//
// Usage: node scripts/og/generate.mjs
// Renders the on-brand card with Playwright (Chromium) at 1200x630 — the size
// declared in the OG meta tags (src/lib/components/PageHead.svelte).
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { homedir } from 'os';
import { existsSync, readdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const templateUrl = 'file://' + join(__dirname, 'template.html');
const outPath = join(__dirname, '../../static/blog.png');

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

const browser = await chromium.launch({ executablePath: findChromium() });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto(templateUrl, { waitUntil: 'networkidle' });
  // Ensure webfonts are ready before the screenshot.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: outPath });
  console.log('Wrote', outPath);
} finally {
  await browser.close();
}
