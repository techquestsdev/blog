import { getPosts } from '$lib/js/posts.js';

export const prerender = true;

export async function GET() {
  // Get all blog posts
  const modules = import.meta.glob('/src/content/blog/*/*.md');
  const posts = await getPosts(modules);

  // Define the base URL
  const baseUrl = 'https://techquests.dev';

  // Static pages
  const staticPages = [
    '', // Home page
    '/about', // About page
    '/blog', // Blog index
    '/contact', // Contact page
    '/projects' // Projects page
  ];

  // Build sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`
    )
    .join('')}
  ${posts
    .map(
      (post) => `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.date || new Date()).toISOString().split('T')[0]}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    }
  });
}
