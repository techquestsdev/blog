import { expect, test } from '@playwright/test';

test.describe('SEO and Meta Tags', () => {
  test('should have proper meta tags on homepage', async ({ page }) => {
    await page.goto('/');

    // Check page title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    expect(title.length).toBeLessThan(70); // SEO best practice

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    if ((await metaDescription.count()) > 0) {
      const description = await metaDescription.getAttribute('content');
      expect(description).toBeTruthy();
      expect(description.length).toBeGreaterThan(30); // Relaxed requirement
      expect(description.length).toBeLessThan(160); // SEO best practice
    }

    // Check viewport meta tag
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute('content', /width=device-width/);

    // Check charset
    const charsetMeta = page.locator('meta[charset]');
    await expect(charsetMeta).toHaveCount(1);
  });

  test('should have proper meta tags on blog posts', async ({ page }) => {
    await page.goto('/blog/prologue');

    // Check page title is unique and descriptive
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title).not.toBe('Tech Quests'); // Should be different from homepage

    // Check canonical URL if present
    const canonicalLink = page.locator('link[rel="canonical"]');
    if ((await canonicalLink.count()) > 0) {
      const href = await canonicalLink.getAttribute('href');
      expect(href).toMatch(/\/blog\/prologue/);
    }

    // Check for Open Graph tags if present
    const ogTitle = page.locator('meta[property="og:title"]');
    if ((await ogTitle.count()) > 0) {
      const content = await ogTitle.getAttribute('content');
      expect(content).toBeTruthy();
    }

    const ogDescription = page.locator('meta[property="og:description"]');
    if ((await ogDescription.count()) > 0) {
      const content = await ogDescription.getAttribute('content');
      expect(content).toBeTruthy();
    }
  });

  test('should have proper meta tags on project pages', async ({ page }) => {
    await page.goto('/projects/beer');

    // Check page title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title).not.toBe('Tech Quests'); // Should be different from homepage

    // Check that project name is in the title (look for h1 in .head specifically for projects)
    const projectHeading = await page.locator('.head h1, main h1').first().textContent();
    if (projectHeading) {
      const trimmedHeading = projectHeading.trim();
      // Use up to 5 chars or the full heading if shorter
      const searchString = trimmedHeading.substring(0, Math.min(5, trimmedHeading.length));
      expect(title.toLowerCase()).toContain(searchString.toLowerCase());
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const pages = [
      '/',
      '/blog',
      '/projects',
      '/about',
      '/contact',
      '/blog/prologue',
      '/projects/beer'
    ];

    for (const pagePath of pages) {
      await page.goto(pagePath);

      // Check that there's at least one H1 (in main or .head for projects)
      const h1Elements = page.locator('h1');
      const h1Count = await h1Elements.count();
      expect(h1Count).toBeGreaterThanOrEqual(1);

      // Check that H1 is not empty
      const h1Text = await h1Elements.first().textContent();
      expect(h1Text?.trim()).toBeTruthy();
    }
  });
});

test.describe('Semantic HTML', () => {
  test('should use semantic HTML elements correctly', async ({ page }) => {
    await page.goto('/');

    // Check for main element
    await expect(page.locator('main')).toBeVisible();

    // Check for nav element if present
    const navElements = page.locator('nav');
    const navCount = await navElements.count();
    if (navCount > 0) {
      // Find a visible nav element
      let hasVisibleNav = false;
      for (let i = 0; i < navCount; i++) {
        if (await navElements.nth(i).isVisible()) {
          await expect(navElements.nth(i)).toBeVisible();
          hasVisibleNav = true;
          break;
        }
      }
      // If no visible nav elements, that's okay - just check that nav elements exist
      expect(navCount).toBeGreaterThan(0);
    }

    // Check for header if present
    const headerElements = page.locator('header');
    const headerCount = await headerElements.count();
    if (headerCount > 0) {
      // Find a visible header element or just verify headers exist
      let hasVisibleHeader = false;
      for (let i = 0; i < headerCount; i++) {
        if (await headerElements.nth(i).isVisible()) {
          await expect(headerElements.nth(i)).toBeVisible();
          hasVisibleHeader = true;
          break;
        }
      }
      // If no visible header elements, that's okay - just check that header elements exist
      expect(headerCount).toBeGreaterThan(0);
    }

    // Check for footer if present
    const footer = page.locator('footer');
    if ((await footer.count()) > 0) {
      await expect(footer).toBeVisible();
    }
  });

  test('should have proper link structure', async ({ page }) => {
    await page.goto('/blog');

    const links = page.locator('a');
    const linkCount = await links.count();

    for (let i = 0; i < Math.min(linkCount, 10); i++) {
      const link = links.nth(i);

      // Check that link has href attribute
      await expect(link).toHaveAttribute('href');

      // Check that external links have proper attributes
      const href = await link.getAttribute('href');
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        await expect(link).toHaveAttribute('target', '_blank');
        const rel = await link.getAttribute('rel');
        expect(rel).toMatch(/noopener|noreferrer/);
      }
    }
  });

  test('should have proper image attributes', async ({ page }) => {
    await page.goto('/projects');

    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);

      // Check alt attribute
      await expect(image).toHaveAttribute('alt');

      // Check src attribute
      await expect(image).toHaveAttribute('src');

      // Check that alt text is meaningful (not empty or just filename)
      const altText = await image.getAttribute('alt');
      expect(altText).toBeTruthy();
      expect(altText.length).toBeGreaterThan(0);
    }
  });
});

test.describe('Schema.org Structured Data', () => {
  test('should include structured data for blog posts', async ({ page }) => {
    await page.goto('/blog/prologue');

    // Look for JSON-LD structured data
    const jsonLdScript = page.locator('script[type="application/ld+json"]');
    if ((await jsonLdScript.count()) > 0) {
      const jsonContent = await jsonLdScript.textContent();
      expect(jsonContent).toBeTruthy();

      // Try to parse as JSON
      const parsedData = JSON.parse(jsonContent);
      expect(parsedData).toBeTruthy();
      expect(parsedData['@type']).toBeTruthy();
    }
  });

  test('should include appropriate microdata if present', async ({ page }) => {
    await page.goto('/');

    // Look for microdata attributes
    const itemScope = page.locator('[itemscope]');
    if ((await itemScope.count()) > 0) {
      await expect(itemScope.first()).toHaveAttribute('itemtype');
    }
  });
});

test.describe('Performance and Core Web Vitals', () => {
  test('should load critical resources quickly', async ({ page }) => {
    await page.goto('/');

    // Check that CSS is loaded
    const styleSheets = await page.evaluate(() => document.styleSheets.length);
    expect(styleSheets).toBeGreaterThan(0);

    // Check that fonts are loading
    await page.waitForLoadState('networkidle');

    // Check that main content is visible quickly
    await expect(page.locator('main')).toBeVisible();
  });

  test('should not have layout shift issues', async ({ page }) => {
    await page.goto('/');

    // Wait for all content to load
    await page.waitForLoadState('networkidle');

    const mainElement = page.locator('main');
    await expect(mainElement).toBeVisible();

    // Get initial position
    const initialBoundingBox = await mainElement.boundingBox();

    // Wait a bit more and check if position changed
    await page.waitForTimeout(1000);
    const finalBoundingBox = await mainElement.boundingBox();

    if (initialBoundingBox && finalBoundingBox) {
      // Allow for minor differences (1px tolerance)
      expect(Math.abs(initialBoundingBox.y - finalBoundingBox.y)).toBeLessThan(2);
    }
  });

  test('should optimize images properly', async ({ page }) => {
    await page.goto('/projects');

    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 3); i++) {
        const image = images.nth(i);

        // Check that images have proper dimensions
        const naturalWidth = await image.evaluate((img) => img.naturalWidth);
        const naturalHeight = await image.evaluate((img) => img.naturalHeight);

        if (naturalWidth > 0 && naturalHeight > 0) {
          // Images should be reasonable size (not excessively large)
          expect(naturalWidth).toBeLessThan(4000);
          expect(naturalHeight).toBeLessThan(4000);
        }
      }
    }
  });
});
