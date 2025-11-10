import { expect } from '@playwright/test';

/**
 * Helper function to check if a page has proper SEO meta tags
 */
export async function checkSEOMetaTags(page, options = {}) {
  // Check page title
  const title = await page.title();
  expect(title).toBeTruthy();
  expect(title.length).toBeGreaterThan(0);

  if (options.maxTitleLength) {
    expect(title.length).toBeLessThan(options.maxTitleLength);
  }

  // Check meta description if present
  const metaDescription = page.locator('meta[name="description"]');
  if ((await metaDescription.count()) > 0) {
    const description = await metaDescription.getAttribute('content');
    expect(description).toBeTruthy();

    if (options.checkDescriptionLength) {
      expect(description.length).toBeGreaterThan(120);
      expect(description.length).toBeLessThan(160);
    }
  }

  // Check viewport meta tag
  const viewportMeta = page.locator('meta[name="viewport"]');
  await expect(viewportMeta).toHaveAttribute('content', /width=device-width/);

  return { title, hasDescription: (await metaDescription.count()) > 0 };
}

/**
 * Helper function to check accessibility attributes
 */
export async function checkAccessibility(page) {
  // Check heading hierarchy
  const h1Elements = page.locator('h1');
  const h1Count = await h1Elements.count();
  expect(h1Count).toBeGreaterThanOrEqual(1);

  // Check images have alt text
  const images = page.locator('img');
  const imageCount = await images.count();

  for (let i = 0; i < imageCount; i++) {
    const image = images.nth(i);
    await expect(image).toHaveAttribute('alt');
  }

  // Check external links have proper attributes
  const externalLinks = page.locator('a[target="_blank"]');
  const externalLinkCount = await externalLinks.count();

  for (let i = 0; i < externalLinkCount; i++) {
    const link = externalLinks.nth(i);
    await expect(link).toHaveAttribute('rel', /noopener|noreferrer/);
  }

  return {
    h1Count,
    imageCount,
    externalLinkCount
  };
}

/**
 * Helper function to test page load performance
 */
export async function checkPageLoadPerformance(page, url, maxLoadTime = 5000) {
  const startTime = Date.now();
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  const endTime = Date.now();

  const loadTime = endTime - startTime;
  expect(loadTime).toBeLessThan(maxLoadTime);

  return loadTime;
}

/**
 * Helper function to check responsive design
 */
export async function checkResponsiveDesign(page, url) {
  const viewports = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1440, height: 900, name: 'desktop' }
  ];

  const results = {};

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(url);

    // Check that main content is visible
    await expect(page.locator('main')).toBeVisible();

    // Check that text is readable (not cut off)
    const h1 = page.locator('h1');
    if (await h1.isVisible()) {
      const boundingBox = await h1.boundingBox();
      if (boundingBox) {
        expect(boundingBox.width).toBeLessThan(viewport.width);
      }
    }

    results[viewport.name] = {
      width: viewport.width,
      height: viewport.height,
      mainVisible: await page.locator('main').isVisible()
    };
  }

  return results;
}

/**
 * Helper function to check for common JavaScript errors
 */
export async function checkJavaScriptErrors(page, url) {
  const errors = [];

  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.goto(url);
  await page.waitForLoadState('networkidle');

  return errors;
}

/**
 * Helper function to test navigation flow
 */
export async function testNavigationFlow(page, startUrl, navigationSteps) {
  await page.goto(startUrl);

  const results = [];

  for (const step of navigationSteps) {
    const { selector, expectedUrl, expectedElement } = step;

    await page.click(selector);

    if (expectedUrl) {
      await expect(page).toHaveURL(expectedUrl);
    }

    if (expectedElement) {
      await expect(page.locator(expectedElement)).toBeVisible();
    }

    results.push({
      step: selector,
      url: page.url(),
      success: true
    });
  }

  return results;
}

/**
 * Helper function to check form functionality (if you have forms)
 */
export async function testFormFunctionality(page, formSelector, fieldTests) {
  const form = page.locator(formSelector);
  await expect(form).toBeVisible();

  for (const fieldTest of fieldTests) {
    const { selector, value, expectedBehavior } = fieldTest;

    if (value) {
      await page.fill(selector, value);
    }

    if (expectedBehavior === 'required') {
      // Check if field is required
      const field = page.locator(selector);
      const isRequired = await field.getAttribute('required');
      expect(isRequired).toBeTruthy();
    }
  }
}

/**
 * Helper to wait for animations to complete
 */
export async function waitForAnimations(page, timeout = 1000) {
  await page.waitForTimeout(timeout);

  // Wait for CSS animations to complete
  await page.waitForFunction(
    () => {
      const animations = document.getAnimations();
      return animations.every((animation) => animation.playState === 'finished');
    },
    { timeout }
  );
}
