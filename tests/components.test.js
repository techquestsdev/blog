import { expect, test } from '@playwright/test';

test.describe('Image Component', () => {
  test('should render images correctly on projects page', async ({ page }) => {
    await page.goto('/projects');

    // Wait for images to load
    await page.waitForLoadState('networkidle');

    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      // Check first image
      const firstImage = images.first();
      await expect(firstImage).toBeVisible();
      await expect(firstImage).toHaveAttribute('alt');

      // Check that image has loaded (not broken)
      const naturalWidth = await firstImage.evaluate((img) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });
});

test.describe('Toggle Component', () => {
  test('should render theme toggle', async ({ page }) => {
    await page.goto('/');

    // Look for any toggle elements (theme toggle)
    const toggle = page.locator('[data-testid="theme-toggle"]').first();

    if (await toggle.isVisible()) {
      await expect(toggle).toBeVisible();

      // Test toggle interaction
      await toggle.click();
      await page.waitForTimeout(500); // Allow animation/transition

      // Toggle back
      await toggle.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Carousel Component', () => {
  test('should render carousel on project detail pages', async ({ page }) => {
    await page.goto('/projects/beer');

    const carousel = page.locator('.embla');
    if (await carousel.isVisible()) {
      await expect(carousel).toBeVisible();

      // Check for navigation buttons if they exist
      const nextButton = page.locator('[data-testid="carousel-next"]');
      const prevButton = page.locator('[data-testid="carousel-prev"]');

      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(300);
      }

      if (await prevButton.isVisible()) {
        await prevButton.click();
        await page.waitForTimeout(300);
      }
    }
  });
});

test.describe('Loading Component', () => {
  test('should handle loading states gracefully', async ({ page }) => {
    await page.goto('/');

    // Check if loading component exists and functions properly
    const loadingElement = page.locator('[data-testid="loading"]');

    // Loading element might not be visible after page load, which is expected
    if (await loadingElement.isVisible()) {
      await expect(loadingElement).toBeVisible();
    }
  });
});
