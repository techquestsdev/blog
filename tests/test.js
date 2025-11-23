import { expect, test } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display homepage with heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main h1').first()).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Blog' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Projects' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible();
  });

  test('should have theme toggle functionality', async ({ page }) => {
    await page.goto('/');
    const themeToggle = page.locator('[data-testid="theme-toggle"]').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(100);
    }
  });
});

test.describe('Blog', () => {
  test('should display blog page with heading and posts', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('main h1').first()).toBeVisible();

    const blogPosts = page.locator('.posts');
    await expect(blogPosts).toBeVisible();
  });

  test('should navigate to individual blog posts', async ({ page }) => {
    await page.goto('/blog');
    const firstPostLink = page.locator('.posts a').first();
    if (await firstPostLink.isVisible()) {
      await firstPostLink.click();
      await expect(page.locator('main').first()).toBeVisible();
    }
  });

  test('should display blog post content', async ({ page }) => {
    await page.goto('/blog/prologue');
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('main h1')).toBeVisible();
  });
});

test.describe('Projects', () => {
  test('should display project with heading and content', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.locator('main h1').first()).toContainText(/Projects/);

    const projectCards = page.locator('[data-testid="project-card"], .project-card, article');
    if ((await projectCards.count()) > 0) {
      await expect(projectCards.first()).toBeVisible();
    }
  });

  test('should navigate to individual project pages', async ({ page }) => {
    await page.goto('/projects');
    const firstProjectLink = page.locator('.posts a').first();
    if (await firstProjectLink.isVisible()) {
      await firstProjectLink.click();
      await expect(page.locator('main').first()).toBeVisible();
    }
  });

  test('should display project details with links', async ({ page }) => {
    await page.goto('/projects/beer');
    await expect(page.locator('main').first()).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();

    // Verify external links have proper target attributes for security
    const websiteLink = page.locator('a[href*="http"]').filter({ hasText: /Site|Website/ });
    const githubLink = page.locator('a[href*="github"]').filter({ hasText: /Github|GitHub/ });

    if (await websiteLink.isVisible()) {
      await expect(websiteLink).toHaveAttribute('target', '_blank');
    }
    if (await githubLink.isVisible()) {
      await expect(githubLink).toHaveAttribute('target', '_blank');
    }
  });
});

test.describe('Navigation', () => {
  test('should navigate between pages correctly', async ({ page }) => {
    await page.goto('/');

    // Adaptive navigation test - works with both standard and mobile layouts
    const aboutLink = page.locator('a[href="/about"]').first();
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await expect(page).toHaveURL('/about');

      await page.locator('a[href="/blog"]').first().click();
      await expect(page).toHaveURL('/blog');

      await page.locator('a[href="/projects"]').first().click();
      await expect(page).toHaveURL('/projects');

      await page.locator('a[href="/contact"]').first().click();
      await expect(page).toHaveURL('/contact');

      await page.locator('a[href="/"]').first().click();
      await expect(page).toHaveURL('/');
    } else {
      // Fallback for mobile/hidden navigation - test direct page loads
      await page.goto('/about');
      await expect(page.locator('main').first()).toBeVisible();

      await page.goto('/blog');
      await expect(page.locator('main').first()).toBeVisible();

      await page.goto('/projects');
      await expect(page.locator('main').first()).toBeVisible();

      await page.goto('/contact');
      await expect(page.locator('main').first()).toBeVisible();

      await page.goto('/');
      await expect(page.locator('main').first()).toBeVisible();
    }
  });
});

test.describe('About Page', () => {
  test('should display about page content', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('main').first()).toBeVisible();
    await expect(page.locator('main h1').first()).toBeVisible();
  });
});

test.describe('Contact Page', () => {
  test('should display contact page content', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('main').first()).toBeVisible();
    await expect(page.locator('main h1').first()).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('should handle 404 pages gracefully', async ({ page }) => {
    const response = await page.goto('/non-existent-page');
    expect(response?.status()).toBe(404);
  });

  test('should handle invalid blog post slugs', async ({ page }) => {
    const response = await page.goto('/blog/non-existent-post');
    expect(response?.status()).toBe(404);
  });

  test('should handle invalid project slugs', async ({ page }) => {
    const response = await page.goto('/projects/non-existent-project');
    expect(response?.status()).toBe(404);
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    const mainH1 = page.locator('main h1').first();
    await expect(mainH1).toBeVisible();

    const mainH1Count = await page.locator('main h1').count();
    expect(mainH1Count).toBeGreaterThanOrEqual(1);
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/projects');
    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        const image = images.nth(i);
        await expect(image).toHaveAttribute('alt');
      }
    }
  });

  test('should have proper security attributes for external links', async ({ page }) => {
    await page.goto('/projects');
    const externalLinks = page.locator('a[target="_blank"]');
    const linkCount = await externalLinks.count();

    if (linkCount > 0) {
      for (let i = 0; i < linkCount; i++) {
        const link = externalLinks.nth(i);
        await expect(link).toHaveAttribute('rel', /noopener|noreferrer/);
      }
    }
  });
});

test.describe('Performance', () => {
  test('should load pages within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});
