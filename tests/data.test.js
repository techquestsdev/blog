import { expect, test } from '@playwright/test';

test.describe('Data Loading', () => {
  test('should load blog posts data correctly', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    const posts = page.locator('.posts a');
    const postCount = await posts.count();

    if (postCount > 0) {
      // Verify first few posts have required elements
      for (let i = 0; i < Math.min(postCount, 3); i++) {
        const post = posts.nth(i);
        await expect(post).toBeVisible();

        const title = post.locator('h2');
        await expect(title).toBeVisible();

        const date = post.locator('.date');
        await expect(date).toBeVisible();

        const description = post.locator('.description');
        await expect(description).toBeVisible();
      }
    }
  });

  test('should load projects data correctly', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    const projects = page.locator('.posts a');
    const projectCount = await projects.count();

    if (projectCount > 0) {
      // Verify first few projects have required elements
      for (let i = 0; i < Math.min(projectCount, 3); i++) {
        const project = projects.nth(i);
        await expect(project).toBeVisible();

        // Check for project title
        const title = project.locator('h2');
        await expect(title).toBeVisible();

        // Check for description
        const description = project.locator('.description');
        await expect(description).toBeVisible();
      }
    }
  });

  test('should handle blog post metadata correctly', async ({ page }) => {
    await page.goto('/blog/prologue');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('main')).toBeVisible();

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // Verify meta description if present
    const metaDescription = page.locator('meta[name="description"]');
    if ((await metaDescription.count()) > 0) {
      await expect(metaDescription).toHaveAttribute('content');
    }
  });

  test('should handle project metadata correctly', async ({ page }) => {
    await page.goto('/projects/beer');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('main')).toBeVisible();

    const heading = page.locator('main h1').first();
    await expect(heading).toBeVisible();

    const description = page.locator('.description');
    await expect(description).toBeVisible();
  });
});

test.describe('Content Formatting', () => {
  test('should render markdown content correctly in blog posts', async ({ page }) => {
    await page.goto('/blog/prologue');

    await page.waitForLoadState('networkidle');

    // Check for common markdown elements
    const content = page.locator('main');
    await expect(content).toBeVisible();

    // Check if there are paragraphs
    const paragraphs = content.locator('p');
    if ((await paragraphs.count()) > 0) {
      await expect(paragraphs.first()).toBeVisible();
    }

    // Check for links if they exist
    const links = content.locator('a');
    const linkCount = await links.count();

    for (let i = 0; i < Math.min(linkCount, 3); i++) {
      const link = links.nth(i);
      await expect(link).toHaveAttribute('href');
    }
  });

  test('should format dates correctly', async ({ page }) => {
    await page.goto('/blog');

    const dates = page.locator('.date');
    const dateCount = await dates.count();

    if (dateCount > 0) {
      const firstDate = await dates.first().textContent();

      // Check that date is not empty and follows a reasonable format
      expect(firstDate).toBeTruthy();
      expect(firstDate.length).toBeGreaterThan(0);

      // Basic check for date format (should contain numbers)
      expect(/\d/.test(firstDate)).toBeTruthy();
    }
  });
});

test.describe('Error States', () => {
  test('should handle missing images gracefully', async ({ page }) => {
    await page.goto('/projects');

    // Wait for images to attempt loading
    await page.waitForLoadState('networkidle');

    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      // Check that images don't show broken image icons
      for (let i = 0; i < imageCount; i++) {
        const image = images.nth(i);
        const naturalWidth = await image.evaluate((img) => img.naturalWidth);
        const naturalHeight = await image.evaluate((img) => img.naturalHeight);

        // If the image failed to load, it should still have alt text
        if (naturalWidth === 0 && naturalHeight === 0) {
          await expect(image).toHaveAttribute('alt');
        }
      }
    }
  });

  test('should handle content loading failures gracefully', async ({ page }) => {
    // Intercept and fail some requests to test error handling
    await page.route('**/*.jpg', (route) => route.abort());
    await page.route('**/*.png', (route) => route.abort());

    await page.goto('/projects');

    // Page should still render even with failed image loads
    await expect(page.locator('main').first()).toBeVisible();
    await expect(page.locator('main h1').first()).toBeVisible();
  });
});
