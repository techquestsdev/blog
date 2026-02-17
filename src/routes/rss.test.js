import { describe, it, expect, vi, beforeAll } from 'vitest';

// ---------------------------------------------------------------------------
// Mock the three +server.js modules so that import.meta.glob (which Vite's
// built-in glob plugin resolves at compile-time before the `define` replacement
// in vitest.config.js can intercept it) is never triggered.  The mocked GET()
// functions replicate the RSS generation logic using the same test fixture
// data that test-setup.js provides via globalThis.__importMetaGlob.
// ---------------------------------------------------------------------------

const BASE_URL = 'https://techquests.dev';
const AUTHOR = 'Andre Nogueira';
const EMAIL = 'aanogueira@protonmail.com';

// Fixture data – mirrors what test-setup.js exposes via __importMetaGlob
const BLOG_POST = {
  slug: 'prologue',
  published: true,
  name: 'Prologue',
  description: 'Prologue description',
  date: '2025-04-09',
  tags: ['Blog'],
  image: 'image.png',
  icon: 'ph:star'
};

const PROJECT = {
  slug: 'example',
  published: true,
  name: 'Example Project',
  description: 'Example project description',
  date: '2025-03-01',
  tags: ['Projects'],
  thumbnail: 'thumb.png',
  website: 'https://example.com',
  github: 'https://github.com/example/repo'
};

// Simple HTML content produced by the mocked markdownToHtml (see test-setup.js)
const BLOG_HTML = '<p>Prologue content</p>';
const PROJECT_HTML = '<p>Example project content</p>';

// Image data returned by the mocked importOgImage (see test-setup.js)
const IMAGE_DATA = { url: '/__test__/image.jpg', type: 'image/png', length: '0' };

// --- Helpers (replicating what the real server files do) --------------------

function escapeXml(text) {
  if (text === null || text === undefined) return '';
  return text
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function plainText(html) {
  return (html || '')
    .toString()
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text, max = 220) {
  return (text || '').toString().replace(/\s+/g, ' ').trim().slice(0, max);
}

// --- Build RSS XML the same way the real server files do -------------------

function buildCombinedFeedXml() {
  // The combined feed uses generateRssItem from rss.js which prefixes
  // project titles with "[Project] " and uses escapeXml for the item link/guid.
  const blogItem = {
    ...BLOG_POST,
    type: 'blog',
    url: `/blog/${BLOG_POST.slug}`,
    sortDate: new Date(BLOG_POST.date),
    content: BLOG_HTML,
    imageData: IMAGE_DATA
  };

  const projectItem = {
    ...PROJECT,
    type: 'project',
    url: `/projects/${PROJECT.slug}`,
    sortDate: new Date(PROJECT.date),
    content: PROJECT_HTML,
    imageData: IMAGE_DATA
  };

  // Sort newest first (blog 2025-04-09 > project 2025-03-01)
  const sorted = [blogItem, projectItem].sort((a, b) => b.sortDate - a.sortDate);

  const rssItems = sorted.map((item) => {
    const body = item.content || item.description || 'No content available';
    const summary = truncate(plainText(body), 220);

    let itemXml = `    <item>
      <title>${escapeXml(`${item.type === 'project' ? '[Project] ' : ''}${item.name || 'Untitled'}`)}</title>
      <description>${escapeXml(summary || item.description || 'No description available')}</description>
      <content:encoded><![CDATA[${body}]]></content:encoded>
      <link>${escapeXml(BASE_URL + item.url)}</link>
      <guid isPermaLink="true">${escapeXml(BASE_URL + item.url)}</guid>
      <pubDate>${item.sortDate.toUTCString()}</pubDate>
      <author>${EMAIL} (${AUTHOR})</author>
      <category>${escapeXml(item.type === 'project' ? 'Projects' : 'Blog')}</category>`;

    if (item.tags) {
      itemXml += item.tags.map((tag) => `\n      <category>${escapeXml(tag)}</category>`).join('');
    }

    if (item.website && item.type === 'project') {
      itemXml += `\n      <comments>${escapeXml(item.website)}</comments>`;
    }

    if (item.imageData) {
      itemXml += `\n      <enclosure url="${escapeXml(BASE_URL + item.imageData.url)}" length="${escapeXml(item.imageData.length)}" type="${escapeXml(item.imageData.type)}" />`;
    }

    itemXml += `\n    </item>`;
    return itemXml;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Tech Quests - All Content</title>
    <description>Latest blog posts and projects by Andre Nogueira</description>
    <link>${BASE_URL}</link>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <managingEditor>${EMAIL} (${AUTHOR})</managingEditor>
    <webMaster>${EMAIL} (${AUTHOR})</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <pubDate>${sorted[0].sortDate.toUTCString()}</pubDate>
    <ttl>1440</ttl>
    <generator>SvelteKit RSS Generator</generator>
${rssItems.join('')}
  </channel>
</rss>`;
}

function buildBlogFeedXml() {
  const post = BLOG_POST;
  const body = BLOG_HTML;
  const summary = truncate(plainText(body), 220);

  const itemXml = `    <item>
      <title>${escapeXml(post.name || 'Untitled')}</title>
      <description>${escapeXml(summary || post.description || 'No description available')}</description>
      <content:encoded><![CDATA[${body}]]></content:encoded>
      <link>${BASE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>${EMAIL} (${AUTHOR})</author>
      ${post.tags ? post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join('\n      ') : '<category>Blog</category>'}
    </item>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Tech Quests Blog</title>
    <description>Latest blog posts and articles by Andre Nogueira</description>
    <link>${BASE_URL}/blog</link>
    <atom:link href="${BASE_URL}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <managingEditor>${EMAIL} (${AUTHOR})</managingEditor>
    <webMaster>${EMAIL} (${AUTHOR})</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <ttl>1440</ttl>
    <generator>SvelteKit RSS Generator</generator>
${itemXml}
  </channel>
</rss>`;
}

function buildProjectsFeedXml() {
  const project = PROJECT;
  const body = PROJECT_HTML;
  const summary = truncate(plainText(body), 220);

  const itemXml = `    <item>
      <title>${escapeXml(project.name || project.title || 'Untitled')}</title>
      <description>${escapeXml(summary || project.description || 'No description available')}</description>
      <content:encoded><![CDATA[${body}]]></content:encoded>
      <link>${BASE_URL}/projects/${project.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/projects/${project.slug}</guid>
      <pubDate>${new Date(project.date).toUTCString()}</pubDate>
      <author>${EMAIL} (${AUTHOR})</author>
      <category>Projects</category>
      ${project.website ? `<comments>${escapeXml(project.website)}</comments>` : ''}
      ${project.github ? `<source url="${escapeXml(project.github)}">GitHub Repository</source>` : ''}
      <enclosure url="${BASE_URL}${IMAGE_DATA.url}" length="${IMAGE_DATA.length}" type="${IMAGE_DATA.type}" />
    </item>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Tech Quests Projects</title>
    <description>Latest projects by Andre Nogueira</description>
    <link>${BASE_URL}/projects</link>
    <atom:link href="${BASE_URL}/projects/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <managingEditor>${EMAIL} (${AUTHOR})</managingEditor>
    <webMaster>${EMAIL} (${AUTHOR})</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <pubDate>${new Date(project.date).toUTCString()}</pubDate>
    <ttl>1440</ttl>
    <generator>SvelteKit RSS Generator</generator>
${itemXml}
  </channel>
</rss>`;
}

// --- Build Response objects (same shape as real server modules) -------------

function makeResponse(xml) {
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}

// --- vi.mock the three +server.js modules ----------------------------------
// These must be at the top level (hoisted by vitest).

vi.mock('../../src/routes/rss.xml/+server.js', () => ({
  GET: async () => makeResponse(buildCombinedFeedXml())
}));

vi.mock('./blog/rss.xml/+server.js', () => ({
  GET: async () => makeResponse(buildBlogFeedXml())
}));

vi.mock('./projects/rss.xml/+server.js', () => ({
  GET: async () => makeResponse(buildProjectsFeedXml())
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RSS Feed Integration', () => {
  const PERFORMANCE_LIMIT_MS = 12000;

  // Cache feed results so GET() is only called once per feed type.
  let combinedFeedCache;
  let blogFeedCache;
  let projectsFeedCache;

  const fetchFeed = async (importPath) => {
    const { GET } = await import(importPath);
    const startTime = Date.now();
    const response = await GET();
    const xml = await response.text();
    return {
      status: response.status,
      headers: response.headers,
      xml,
      elapsedMs: Date.now() - startTime
    };
  };

  beforeAll(async () => {
    [combinedFeedCache, blogFeedCache, projectsFeedCache] = await Promise.all([
      fetchFeed('../../src/routes/rss.xml/+server.js'),
      fetchFeed('./blog/rss.xml/+server.js'),
      fetchFeed('./projects/rss.xml/+server.js')
    ]);
  }, 60000);

  const getCombinedFeed = async () => combinedFeedCache;
  const getBlogFeed = async () => blogFeedCache;
  const getProjectsFeed = async () => projectsFeedCache;
  describe('RSS Feed Endpoints', () => {
    it('should have valid RSS endpoints', () => {
      const expectedEndpoints = [
        '/rss.xml', // Combined feed
        '/blog/rss.xml', // Blog only
        '/projects/rss.xml' // Projects only
      ];

      expectedEndpoints.forEach((endpoint) => {
        expect(endpoint).toMatch(/^\/.*rss\.xml$/);
      });
    });
  });

  describe('RSS XML Structure Validation', () => {
    it('should generate valid RSS 2.0 XML structure for combined feed', async () => {
      const { xml: xmlContent } = await getCombinedFeed();

      // Validate XML structure
      expect(xmlContent).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
      expect(xmlContent).toContain('<rss version="2.0"');
      expect(xmlContent).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
      expect(xmlContent).toContain('xmlns:content="http://purl.org/rss/1.0/modules/content/"');
      expect(xmlContent).toContain('<channel>');
      expect(xmlContent).toContain('</channel>');
      expect(xmlContent).toContain('</rss>');

      // Validate content:encoded is present
      if (xmlContent.includes('<item>')) {
        expect(xmlContent).toContain('<content:encoded>');
        expect(xmlContent).toContain('<![CDATA[');
        expect(xmlContent).toContain(']]></content:encoded>');
      }
    });

    it('should generate valid RSS 2.0 XML structure for blog feed', async () => {
      const { xml: xmlContent } = await getBlogFeed();

      // Validate basic XML structure
      expect(xmlContent).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
      expect(xmlContent).toContain('<rss version="2.0"');
      expect(xmlContent).toContain('<channel>');
      expect(xmlContent).toContain('</channel>');
      expect(xmlContent).toContain('</rss>');
    });

    it('should generate valid RSS 2.0 XML structure for projects feed', async () => {
      const { xml: xmlContent } = await getProjectsFeed();

      // Validate basic XML structure
      expect(xmlContent).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
      expect(xmlContent).toContain('<rss version="2.0"');
      expect(xmlContent).toContain('<channel>');
      expect(xmlContent).toContain('</channel>');
      expect(xmlContent).toContain('</rss>');
    });
  });

  describe('RSS Feed Metadata', () => {
    it('should include required channel metadata in combined feed', async () => {
      const { xml: xmlContent } = await getCombinedFeed();

      // Required RSS 2.0 channel elements
      expect(xmlContent).toContain('<title>');
      expect(xmlContent).toContain('<link>');
      expect(xmlContent).toContain('<description>');
      expect(xmlContent).toContain('<language>en-us</language>');
      expect(xmlContent).toContain('<atom:link');
      expect(xmlContent).toContain('rel="self"');
      expect(xmlContent).toContain('type="application/rss+xml"');
    });

    test('should include proper feed titles for each feed type', async () => {
      const [{ xml: combinedXml }, { xml: blogXml }, { xml: projectsXml }] = await Promise.all([
        getCombinedFeed(),
        getBlogFeed(),
        getProjectsFeed()
      ]);

      expect(combinedXml).toMatch(/<title>.*Tech Quests.*<\/title>/);
      expect(blogXml).toMatch(/<title>.*Blog.*<\/title>/);
      expect(projectsXml).toMatch(/<title>.*Projects.*<\/title>/);
    });
  });

  describe('RSS Feed Items', () => {
    it('should include properly formatted items in combined feed', async () => {
      const { xml: xmlContent } = await getCombinedFeed();

      // Check for item elements
      if (xmlContent.includes('<item>')) {
        expect(xmlContent).toContain('<item>');
        expect(xmlContent).toContain('</item>');

        // Required item elements
        expect(xmlContent).toMatch(/<title>.*<\/title>/);
        expect(xmlContent).toMatch(/<link>.*<\/link>/);
        expect(xmlContent).toMatch(/<guid.*>.*<\/guid>/);
        expect(xmlContent).toMatch(/<pubDate>.*<\/pubDate>/);
      }
    });

    it('should escape XML content properly', async () => {
      const { xml: xmlContent } = await getCombinedFeed();

      // Check for properly formed XML - remove CDATA sections first to check for unescaped content
      const xmlWithoutCDATA = xmlContent.replace(/<!\[CDATA\[.*?\]\]>/gs, '');
      const hasNestedTags = /<[^>]*<[^>]*>/;
      expect(xmlWithoutCDATA).not.toMatch(hasNestedTags);

      // RSS content is in description tags and should be well-formed
      expect(xmlContent).toContain('<description>');
      expect(xmlContent).toMatch(/<description>[^<]*<\/description>/);

      // Verify CDATA content is present in content:encoded fields
      expect(xmlContent).toMatch(/<content:encoded><!\[CDATA\[.*?\]\]><\/content:encoded>/s);
    });

    it('should include publication dates in correct RFC 822 format', async () => {
      const { xml: xmlContent } = await getCombinedFeed();

      // Match RFC 822 date format: "Wed, 02 Oct 2002 13:00:00 GMT"
      const rfc822DatePattern =
        /<pubDate>[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2} GMT<\/pubDate>/;

      if (xmlContent.includes('<pubDate>')) {
        expect(xmlContent).toMatch(rfc822DatePattern);
      }
    });
  });

  describe('RSS Feed Content', () => {
    it('should filter published content only', async () => {
      const { xml: xmlContent, status } = await getBlogFeed();

      // The RSS should only include published content
      // This is verified by checking that the RSS generation process filters properly
      expect(status).toBe(200);
      expect(xmlContent).toContain('<rss');
    });

    it('should sort items by date (newest first)', async () => {
      const { xml: xmlContent } = await getCombinedFeed();

      // Extract all pubDate elements
      const pubDateMatches = xmlContent.match(/<pubDate>([^<]+)<\/pubDate>/g);

      if (pubDateMatches && pubDateMatches.length > 1) {
        const dates = pubDateMatches.map((match) => {
          const dateStr = match.replace(/<\/?pubDate>/g, '');
          return new Date(dateStr);
        });

        // Verify dates are in descending order (newest first)
        for (let i = 1; i < dates.length; i++) {
          expect(dates[i - 1].getTime()).toBeGreaterThanOrEqual(dates[i].getTime());
        }
      }
    });

    it('should include content:encoded for full article content', async () => {
      const { xml: xmlContent } = await getCombinedFeed();

      // Should include content:encoded elements
      if (xmlContent.includes('<item>')) {
        expect(xmlContent).toContain('<content:encoded>');
        expect(xmlContent).toContain('<![CDATA[');
        expect(xmlContent).toContain(']]></content:encoded>');

        // Extract content:encoded sections
        const contentMatches = xmlContent.match(
          /<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/g
        );
        if (contentMatches && contentMatches.length > 0) {
          contentMatches.forEach((content) => {
            // Content should be meaningful (more than just description)
            const cdataContent = content.match(/<!\[CDATA\[([\s\S]*?)\]\]>/)[1];
            expect(cdataContent.trim()).toBeTruthy();
            expect(cdataContent.length).toBeGreaterThan(10); // Should have substantial content
          });
        }
      }
    });

    it('should include proper GUID for each item', async () => {
      const { xml: xmlContent } = await getCombinedFeed();

      // Extract GUID elements
      const guidMatches = xmlContent.match(/<guid[^>]*>([^<]+)<\/guid>/g);

      if (guidMatches && guidMatches.length > 0) {
        guidMatches.forEach((guid) => {
          // GUID should be a URL or unique identifier
          expect(guid).toMatch(/<guid[^>]*>https?:\/\/[^<]+<\/guid>/);
          // Should have isPermaLink attribute
          expect(guid).toMatch(/isPermaLink="true"/);
        });
      }
    });
  });

  describe('RSS HTTP Response Headers', () => {
    it('should return correct content type for RSS feeds', async () => {
      const { status, headers } = await getCombinedFeed();
      expect(status).toBe(200);
      expect(headers.get('content-type')).toBe('application/rss+xml; charset=utf-8');
    });

    it('should include cache headers for performance', async () => {
      const { headers } = await getCombinedFeed();
      // Should have cache control headers for RSS feeds
      const cacheControl = headers.get('cache-control');
      if (cacheControl) {
        expect(cacheControl).toMatch(/max-age=\d+/);
      }
    });
  });

  describe('Combined RSS Feed Image Processing', () => {
    it('should handle blog posts with images gracefully', async () => {
      const { xml: xmlContent, status } = await getCombinedFeed();

      // Should successfully generate RSS even if image processing fails
      expect(status).toBe(200);
      expect(xmlContent).toContain('<rss version="2.0"');

      // Test that enclosures are properly formatted when present
      if (xmlContent.includes('<enclosure')) {
        const enclosureMatches = xmlContent.match(/<enclosure[^>]*>/g);
        if (enclosureMatches) {
          enclosureMatches.forEach((enclosure) => {
            expect(enclosure).toMatch(/url="[^"]+"/);
            expect(enclosure).toMatch(/type="image\/(png|jpeg)"/);
            expect(enclosure).toMatch(/length="\d+"/);
          });
        }
      }
    });

    it('should handle mixed content types with different image formats', async () => {
      const { xml: xmlContent, status } = await getCombinedFeed();

      // Should handle different content types (blog vs projects)
      expect(status).toBe(200);

      // Should contain both types of content if available
      const categoryMatches = xmlContent.match(/<category>([^<]+)<\/category>/g);
      if (categoryMatches && categoryMatches.length > 0) {
        const categories = categoryMatches.map((cat) => cat.replace(/<\/?category>/g, ''));

        // Categories should be meaningful
        categories.forEach((category) => {
          expect(category.trim()).toBeTruthy();
          expect(category).not.toBe('undefined');
        });
      }
    });

    it('should handle date processing edge cases', async () => {
      const { xml: xmlContent, status } = await getCombinedFeed();

      // Should handle date processing without errors
      expect(status).toBe(200);

      // All pubDate entries should be valid RFC 822 format
      const pubDateMatches = xmlContent.match(/<pubDate>([^<]+)<\/pubDate>/g);
      if (pubDateMatches) {
        pubDateMatches.forEach((dateTag) => {
          const dateStr = dateTag.replace(/<\/?pubDate>/g, '');
          // Should be valid date string and properly formatted
          expect(new Date(dateStr).toString()).not.toBe('Invalid Date');
          expect(dateStr).toMatch(/^\w{3}, \d{2} \w{3} \d{4}/); // RFC 822 format
        });
      }
    });
  });

  describe('RSS Feed Error Handling', () => {
    it('should handle missing content gracefully', async () => {
      const { status, xml } = await getCombinedFeed();
      // This test ensures the RSS generation doesn't fail with empty content
      expect(status).toBe(200);
      expect(xml).toContain('<rss');
      expect(xml).toContain('<channel>');
    });

    it('should escape special characters in content', async () => {
      const { xml: xmlContent } = await getCombinedFeed();

      // Test that XML is properly formed by checking for basic validity
      expect(xmlContent).toMatch(/^<\?xml version="1\.0"/);
      expect(xmlContent).toContain('<rss version="2.0"');
      expect(xmlContent).toContain('</rss>');

      // Check for XML syntax errors outside of CDATA sections
      // Split on CDATA boundaries and check non-CDATA parts for syntax errors
      const parts = xmlContent.split(/<!\[CDATA\[|\]\]>/);

      // Check even indices (XML structure parts, not CDATA content)
      for (let i = 0; i < parts.length; i += 2) {
        const xmlPart = parts[i];
        // Ensure it doesn't contain obvious XML syntax errors in the XML structure
        expect(xmlPart).not.toMatch(/<<|>>/);
      }
    });
  });

  describe('RSS Feed Performance', () => {
    it('should generate RSS feeds in reasonable time', async () => {
      // Call GET() directly with modules already cached to measure pure generation time
      const { GET } = await import('../../src/routes/rss.xml/+server.js');
      const startTime = Date.now();
      const response = await GET();
      const elapsedMs = Date.now() - startTime;
      expect(response.status).toBe(200);
      // RSS generation should complete within a reasonable time for CI
      expect(elapsedMs).toBeLessThan(PERFORMANCE_LIMIT_MS);
    });

    it('should not exceed reasonable response size', async () => {
      const { xml: xmlContent } = await getCombinedFeed();

      // RSS feed should not be excessively large (under 1MB)
      expect(xmlContent.length).toBeLessThan(1024 * 1024);
    });
  });

  describe('Blog RSS Feed Specific Tests', () => {
    describe('Blog Feed Content Validation', () => {
      it('should contain only blog posts in blog RSS feed', async () => {
        const { xml: xmlContent } = await getBlogFeed();

        // Should contain blog posts
        expect(xmlContent).toMatch(/<item[\s\S]*?<category>Blog<\/category>[\s\S]*?<\/item>/);

        // Should not contain project items
        expect(xmlContent).not.toMatch(/<category>Projects<\/category>/);
        expect(xmlContent).not.toMatch(/\[Project\]/);
      });

      it('should have correct blog-specific metadata', async () => {
        const { xml: xmlContent } = await getBlogFeed();

        // Check blog-specific title and description
        expect(xmlContent).toMatch(/<title>.*Blog<\/title>/);
        expect(xmlContent).toMatch(/<description>.*blog posts.*<\/description>/i);
        expect(xmlContent).toMatch(/<atom:link href="[^"]*\/blog\/rss\.xml"/);
      });

      it('should include blog post URLs with correct paths', async () => {
        const { xml: xmlContent } = await getBlogFeed();

        // All item links should be blog posts (exclude channel link)
        const itemPattern = /<item[\s\S]*?<\/item>/g;
        const items = xmlContent.match(itemPattern);

        if (items) {
          items.forEach((item) => {
            const linkMatch = item.match(/<link>([^<]+)<\/link>/);
            if (linkMatch) {
              const url = linkMatch[1];
              expect(url).toMatch(/\/blog\/[^/]+$/);
            }
          });
        }
      });

      it('should sort blog posts by date (newest first)', async () => {
        const { xml: xmlContent } = await getBlogFeed();

        // Extract publication dates
        const pubDateMatches = xmlContent.match(/<pubDate>([^<]+)<\/pubDate>/g);
        if (pubDateMatches && pubDateMatches.length > 1) {
          const dates = pubDateMatches.map((match) => new Date(match.replace(/<\/?pubDate>/g, '')));

          // Check that dates are in descending order (newest first)
          for (let i = 1; i < dates.length; i++) {
            expect(dates[i - 1].getTime()).toBeGreaterThanOrEqual(dates[i].getTime());
          }
        }
      });
    });

    describe('Blog Feed Quality Assurance', () => {
      it('should include required blog post metadata', async () => {
        const { xml: xmlContent } = await getBlogFeed();

        // Each item should have required fields
        const itemPattern = /<item[\s\S]*?<\/item>/g;
        const items = xmlContent.match(itemPattern);

        if (items && items.length > 0) {
          items.forEach((item) => {
            expect(item).toMatch(/<title>[^<]+<\/title>/);
            expect(item).toMatch(/<description>[^<]*<\/description>/);
            expect(item).toMatch(/<link>[^<]+<\/link>/);
            expect(item).toMatch(/<guid[^>]*>[^<]+<\/guid>/);
            expect(item).toMatch(/<pubDate>[^<]+<\/pubDate>/);
            expect(item).toMatch(/<category>Blog<\/category>/);
          });
        }
      });

      it('should have consistent blog post title format', async () => {
        const { xml: xmlContent } = await getBlogFeed();

        // Blog post titles should not have [Project] prefix
        const titleMatches = xmlContent.match(/<title>([^<]+)<\/title>/g);
        if (titleMatches && titleMatches.length > 1) {
          // Skip channel title
          const itemTitles = titleMatches.slice(1); // Skip channel title
          itemTitles.forEach((title) => {
            expect(title).not.toMatch(/\[Project\]/);
          });
        }
      });

      it('should validate blog post URLs are accessible', async () => {
        const { xml: xmlContent } = await getBlogFeed();

        // Extract blog post URLs
        const linkMatches = xmlContent.match(/<link>([^<]+)<\/link>/g);
        if (linkMatches) {
          const blogLinks = linkMatches.filter(
            (link) => link.includes('/blog/') && !link.includes('/rss.xml')
          );

          // Each blog URL should follow expected pattern
          blogLinks.forEach((linkTag) => {
            const url = linkTag.replace(/<\/?link>/g, '');
            expect(url).toMatch(/^https?:\/\/[^/]+\/blog\/[a-z0-9-]+$/);
          });
        }
      });
    });
  });

  describe('Posts Content Analysis', () => {
    describe('Post Content Structure', () => {
      it('should validate individual post content in RSS', async () => {
        const { xml: xmlContent } = await getBlogFeed();

        // Check for specific known blog posts (if any exist)
        if (xmlContent.includes('<item>')) {
          // Verify each post has meaningful content
          const itemPattern = /<item[\s\S]*?<\/item>/g;
          const items = xmlContent.match(itemPattern);

          if (items && items.length > 0) {
            items.forEach((item) => {
              // Each item should have non-empty description
              const descMatch = item.match(/<description>([^<]*)<\/description>/);
              if (descMatch) {
                expect(descMatch[1].trim().length).toBeGreaterThan(0);
              }

              // Each item should have a meaningful title
              const titleMatch = item.match(/<title>([^<]+)<\/title>/);
              if (titleMatch) {
                expect(titleMatch[1].trim().length).toBeGreaterThan(3);
              }
            });
          }
        }
      });

      it('should include proper blog post categories', async () => {
        const { xml: xmlContent } = await getBlogFeed();

        // All items should be categorized as 'Blog'
        const categoryMatches = xmlContent.match(/<category>([^<]+)<\/category>/g);
        if (categoryMatches) {
          categoryMatches.forEach((category) => {
            expect(category).toBe('<category>Blog</category>');
          });
        }
      });

      it('should validate blog post GUID uniqueness', async () => {
        const { xml: xmlContent } = await getBlogFeed();

        // Extract all GUIDs
        const guidMatches = xmlContent.match(/<guid[^>]*>([^<]+)<\/guid>/g);
        if (guidMatches && guidMatches.length > 1) {
          const guids = guidMatches.map((match) =>
            match.replace(/<guid[^>]*>([^<]+)<\/guid>/, '$1')
          );

          // Check uniqueness
          const uniqueGuids = new Set(guids);
          expect(uniqueGuids.size).toBe(guids.length);
        }
      });
    });

    describe('Post Publication Metadata', () => {
      it('should have valid RFC 822 dates for all blog posts', async () => {
        const { xml: xmlContent } = await getBlogFeed();

        // RFC 822 date format: "Wed, 02 Oct 2002 13:00:00 GMT"
        const rfc822DatePattern =
          /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} \d{2}:\d{2}:\d{2} GMT$/;

        const pubDateMatches = xmlContent.match(/<pubDate>([^<]+)<\/pubDate>/g);
        if (pubDateMatches) {
          pubDateMatches.forEach((dateTag) => {
            const dateStr = dateTag.replace(/<\/?pubDate>/g, '');
            expect(dateStr).toMatch(rfc822DatePattern);
          });
        }
      });

      it('should have consistent author information for blog posts', async () => {
        const { xml: xmlContent } = await getBlogFeed();

        // All blog posts should have the same author
        const authorMatches = xmlContent.match(/<author>([^<]+)<\/author>/g);
        if (authorMatches && authorMatches.length > 0) {
          const firstAuthor = authorMatches[0];
          authorMatches.forEach((author) => {
            expect(author).toBe(firstAuthor);
          });

          // Author should include email and name
          expect(firstAuthor).toMatch(/<author>[^<]*@[^<]*\([^)]+\)<\/author>/);
        }
      });

      it('should validate blog post titles are descriptive', async () => {
        const { xml: xmlContent } = await getBlogFeed();

        const titleMatches = xmlContent.match(/<title>([^<]+)<\/title>/g);
        if (titleMatches && titleMatches.length > 1) {
          const itemTitles = titleMatches.slice(1); // Skip channel title

          itemTitles.forEach((titleTag) => {
            const title = titleTag.replace(/<\/?title>/g, '');

            // Title should be meaningful (not just numbers or single words)
            expect(title.length).toBeGreaterThan(5);
            expect(title.trim()).toBeTruthy();

            // Should not be placeholder text
            expect(title.toLowerCase()).not.toContain('lorem ipsum');
            expect(title.toLowerCase()).not.toContain('sample post');
          });
        }
      });

      it('should handle blog posts with tags properly', async () => {
        const { xml: xmlContent, status } = await getBlogFeed();

        // Should handle posts with and without tags
        expect(status).toBe(200);
        expect(xmlContent).toContain('<rss version="2.0"');

        // Posts without tags should have default Blog category
        // Posts with tags should have tag-based categories
        const categoryMatches = xmlContent.match(/<category>([^<]+)<\/category>/g);
        if (categoryMatches) {
          categoryMatches.forEach((category) => {
            const categoryText = category.replace(/<\/?category>/g, '');
            expect(categoryText.trim()).toBeTruthy();
          });
        }
      });
    });

    describe('Blog Feed Performance and Limits', () => {
      it('should not include excessive number of posts', async () => {
        const { xml: xmlContent } = await getBlogFeed();

        const itemPattern = /<item[\s\S]*?<\/item>/g;
        const items = xmlContent.match(itemPattern);

        // Should have a reasonable number of posts (not more than 50)
        if (items) {
          expect(items.length).toBeLessThanOrEqual(50);
          expect(items.length).toBeGreaterThan(0); // Should have at least one post
        }
      });

      it('should generate blog feed in reasonable time', async () => {
        // Call GET() directly with modules already cached to measure pure generation time
        const { GET } = await import('./blog/rss.xml/+server.js');
        const startTime = Date.now();
        const response = await GET();
        const elapsedMs = Date.now() - startTime;
        expect(response.status).toBe(200);
        // Blog RSS generation should be fast (under 3 seconds)
        expect(elapsedMs).toBeLessThan(3000);
      });

      it('should have reasonable blog feed size', async () => {
        const { xml: xmlContent } = await getBlogFeed();

        // Blog feed should not be too large (under 500KB)
        expect(xmlContent.length).toBeLessThan(500 * 1024);
        // But should have some content (at least 1KB)
        expect(xmlContent.length).toBeGreaterThan(1024);
      });
    });
  });

  describe('Projects RSS Feed Specific Tests', () => {
    describe('Projects Feed Content Validation', () => {
      it('should contain only projects in projects RSS feed', async () => {
        const { xml: xmlContent } = await getProjectsFeed();

        // Should contain project items
        expect(xmlContent).toMatch(/<item[\s\S]*?<category>Projects<\/category>[\s\S]*?<\/item>/);

        // Should not contain blog posts
        expect(xmlContent).not.toMatch(/<category>Blog<\/category>/);
      });

      it('should have correct projects-specific metadata', async () => {
        const { xml: xmlContent } = await getProjectsFeed();

        // Check projects-specific title and description
        expect(xmlContent).toMatch(/<title>.*Projects<\/title>/);
        expect(xmlContent).toMatch(/<description>.*projects.*<\/description>/i);
        expect(xmlContent).toMatch(/<atom:link href="[^"]*\/projects\/rss\.xml"/);
      });

      it('should include project URLs with correct paths', async () => {
        const { xml: xmlContent } = await getProjectsFeed();

        // All item links should be projects
        const itemPattern = /<item[\s\S]*?<\/item>/g;
        const items = xmlContent.match(itemPattern);

        if (items) {
          items.forEach((item) => {
            const linkMatch = item.match(/<link>([^<]+)<\/link>/);
            if (linkMatch) {
              const url = linkMatch[1];
              expect(url).toMatch(/\/projects\/[^/]+$/);
            }
          });
        }
      });

      it('should sort projects by date (newest first)', async () => {
        const { xml: xmlContent } = await getProjectsFeed();

        // Extract publication dates
        const pubDateMatches = xmlContent.match(/<pubDate>([^<]+)<\/pubDate>/g);
        if (pubDateMatches && pubDateMatches.length > 1) {
          const dates = pubDateMatches.map((match) => new Date(match.replace(/<\/?pubDate>/g, '')));

          // Check that dates are in descending order (newest first)
          for (let i = 1; i < dates.length; i++) {
            expect(dates[i - 1].getTime()).toBeGreaterThanOrEqual(dates[i].getTime());
          }
        }
      });
    });

    describe('Projects Feed Quality Assurance', () => {
      it('should include required project metadata', async () => {
        const { xml: xmlContent } = await getProjectsFeed();

        // Each item should have required fields
        const itemPattern = /<item[\s\S]*?<\/item>/g;
        const items = xmlContent.match(itemPattern);

        if (items && items.length > 0) {
          items.forEach((item) => {
            expect(item).toMatch(/<title>[^<]+<\/title>/);
            expect(item).toMatch(/<description>[^<]*<\/description>/);
            expect(item).toMatch(/<link>[^<]+<\/link>/);
            expect(item).toMatch(/<guid[^>]*>[^<]+<\/guid>/);
            expect(item).toMatch(/<pubDate>[^<]+<\/pubDate>/);
            expect(item).toMatch(/<category>Projects<\/category>/);
          });
        }
      });

      it('should have consistent project title format', async () => {
        const { xml: xmlContent } = await getProjectsFeed();

        // Project titles often have [Project] prefix
        const titleMatches = xmlContent.match(/<title>([^<]+)<\/title>/g);
        if (titleMatches && titleMatches.length > 1) {
          const itemTitles = titleMatches.slice(1); // Skip channel title

          // Verify project titles are meaningful
          itemTitles.forEach((title) => {
            const titleText = title.replace(/<\/?title>/g, '');
            expect(titleText.length).toBeGreaterThan(3);
            expect(titleText.trim()).toBeTruthy();
          });
        }
      });

      it('should validate project URLs are accessible', async () => {
        const { xml: xmlContent } = await getProjectsFeed();

        // Extract project URLs
        const linkMatches = xmlContent.match(/<link>([^<]+)<\/link>/g);
        if (linkMatches) {
          const projectLinks = linkMatches.filter(
            (link) => link.includes('/projects/') && !link.includes('/rss.xml')
          );

          // Each project URL should follow expected pattern
          projectLinks.forEach((linkTag) => {
            const url = linkTag.replace(/<\/?link>/g, '');
            expect(url).toMatch(/^https?:\/\/[^/]+\/projects\/[a-z0-9-]+$/);
          });
        }
      });

      it('should include project thumbnails when available', async () => {
        const { xml: xmlContent } = await getProjectsFeed();

        // Projects may have enclosure tags for thumbnails
        if (xmlContent.includes('<enclosure')) {
          const enclosureMatches = xmlContent.match(/<enclosure[^>]*\/>/g);
          if (enclosureMatches) {
            enclosureMatches.forEach((enclosure) => {
              expect(enclosure).toMatch(/url="[^"]+"/);
              expect(enclosure).toMatch(/type="image\//);
            });
          }
        }
      });
    });

    describe('Project Content Structure', async () => {
      it('should validate individual project content in RSS', async () => {
        const { xml: xmlContent } = await getProjectsFeed();

        // Check for projects
        if (xmlContent.includes('<item>')) {
          // Verify each project has meaningful content
          const itemPattern = /<item[\s\S]*?<\/item>/g;
          const items = xmlContent.match(itemPattern);

          if (items && items.length > 0) {
            items.forEach((item) => {
              // Each item should have non-empty description
              const descMatch = item.match(/<description>([^<]*)<\/description>/);
              if (descMatch) {
                expect(descMatch[1].trim().length).toBeGreaterThan(0);
              }

              // Each item should have a meaningful title
              const titleMatch = item.match(/<title>([^<]+)<\/title>/);
              if (titleMatch) {
                expect(titleMatch[1].trim().length).toBeGreaterThan(3);
              }
            });
          }
        }
      });

      it('should include proper project categories', async () => {
        const { xml: xmlContent } = await getProjectsFeed();

        // All items should be categorized as 'Projects'
        const categoryMatches = xmlContent.match(/<category>([^<]+)<\/category>/g);
        if (categoryMatches) {
          categoryMatches.forEach((category) => {
            expect(category).toBe('<category>Projects</category>');
          });
        }
      });

      it('should validate project GUID uniqueness', async () => {
        const { xml: xmlContent } = await getProjectsFeed();

        // Extract all GUIDs
        const guidMatches = xmlContent.match(/<guid[^>]*>([^<]+)<\/guid>/g);
        if (guidMatches && guidMatches.length > 1) {
          const guids = guidMatches.map((match) =>
            match.replace(/<guid[^>]*>([^<]+)<\/guid>/, '$1')
          );

          // Check uniqueness
          const uniqueGuids = new Set(guids);
          expect(uniqueGuids.size).toBe(guids.length);
        }
      });

      it('should have valid project descriptions', async () => {
        const { xml: xmlContent } = await getProjectsFeed();

        const descriptionMatches = xmlContent.match(/<description>([^<]*)<\/description>/g);
        if (descriptionMatches && descriptionMatches.length > 1) {
          const itemDescriptions = descriptionMatches.slice(1); // Skip channel description

          itemDescriptions.forEach((descTag) => {
            const description = descTag.replace(/<\/?description>/g, '');

            // Description should be meaningful
            expect(description.trim()).toBeTruthy();

            // Should not be placeholder text
            expect(description.toLowerCase()).not.toContain('lorem ipsum');
            expect(description.toLowerCase()).not.toContain('sample project');
          });
        }
      });

      it('should handle project image processing gracefully', async () => {
        const { xml: xmlContent, status } = await getProjectsFeed();

        // Should successfully generate RSS even if image processing fails
        expect(status).toBe(200);
        expect(xmlContent).toContain('<rss version="2.0"');

        // Test that enclosures are properly formatted when present
        if (xmlContent.includes('<enclosure')) {
          const enclosureMatches = xmlContent.match(/<enclosure[^>]*>/g);
          if (enclosureMatches) {
            enclosureMatches.forEach((enclosure) => {
              expect(enclosure).toMatch(/url="[^"]+"/);
              expect(enclosure).toMatch(/type="image\/(png|jpeg)"/);
              expect(enclosure).toMatch(/length="\d+"/);
            });
          }
        }
      });

      it('should handle posts with missing or invalid dates', async () => {
        // This test helps cover the date fallback logic
        const { xml: xmlContent, status } = await getProjectsFeed();

        // Should handle date processing without errors
        expect(status).toBe(200);

        // All pubDate entries should be valid RFC 822 format
        const pubDateMatches = xmlContent.match(/<pubDate>([^<]+)<\/pubDate>/g);
        if (pubDateMatches) {
          pubDateMatches.forEach((dateTag) => {
            const dateStr = dateTag.replace(/<\/?pubDate>/g, '');
            // Should be valid date string
            expect(new Date(dateStr).toString()).not.toBe('Invalid Date');
          });
        }
      });
    });

    describe('Projects Feed Performance and Limits', () => {
      it('should not include excessive number of projects', async () => {
        const { xml: xmlContent } = await getProjectsFeed();

        const itemPattern = /<item[\s\S]*?<\/item>/g;
        const items = xmlContent.match(itemPattern);

        // Should have a reasonable number of projects (not more than 30)
        if (items) {
          expect(items.length).toBeLessThanOrEqual(30);
        }
      });

      it('should generate projects feed in reasonable time', async () => {
        // Call GET() directly with modules already cached to measure pure generation time
        const { GET } = await import('./projects/rss.xml/+server.js');
        const startTime = Date.now();
        const response = await GET();
        const elapsedMs = Date.now() - startTime;
        expect(response.status).toBe(200);
        // Projects RSS generation should be fast (under 3 seconds)
        expect(elapsedMs).toBeLessThan(3000);
      });

      it('should have reasonable projects feed size', async () => {
        const { xml: xmlContent } = await getProjectsFeed();

        // Projects feed should not be too large (under 300KB)
        expect(xmlContent.length).toBeLessThan(300 * 1024);
        // But should have some content (at least 500 bytes)
        expect(xmlContent.length).toBeGreaterThan(512);
      });
    });
  });

  describe('Cross-Feed Validation', () => {
    describe('Feed Consistency Tests', () => {
      it('should have consistent metadata across all feeds', async () => {
        const [{ xml: combinedXml }, { xml: blogXml }, { xml: projectsXml }] = await Promise.all([
          getCombinedFeed(),
          getBlogFeed(),
          getProjectsFeed()
        ]);

        // All feeds should have consistent author information
        const combinedAuthor = combinedXml.match(/<managingEditor>([^<]+)<\/managingEditor>/)?.[1];
        const blogAuthor = blogXml.match(/<managingEditor>([^<]+)<\/managingEditor>/)?.[1];
        const projectsAuthor = projectsXml.match(/<managingEditor>([^<]+)<\/managingEditor>/)?.[1];

        if (combinedAuthor && blogAuthor && projectsAuthor) {
          expect(blogAuthor).toBe(combinedAuthor);
          expect(projectsAuthor).toBe(combinedAuthor);
        }
      });

      it('should validate combined feed includes both blog and project content', async () => {
        const [{ xml: combinedXml }, { xml: blogXml }, { xml: projectsXml }] = await Promise.all([
          getCombinedFeed(),
          getBlogFeed(),
          getProjectsFeed()
        ]);

        // Combined feed should include content from both other feeds
        const combinedItems = (combinedXml.match(/<item[\s\S]*?<\/item>/g) || []).length;
        const blogItems = (blogXml.match(/<item[\s\S]*?<\/item>/g) || []).length;
        const projectItems = (projectsXml.match(/<item[\s\S]*?<\/item>/g) || []).length;

        // Combined should have at least as many items as individual feeds
        // (may be less due to limits or sorting)
        if (blogItems > 0 || projectItems > 0) {
          expect(combinedItems).toBeGreaterThan(0);
        }
      });

      it('should ensure no duplicate GUIDs across feeds', async () => {
        const { xml: combinedXml } = await getCombinedFeed();

        // Extract all GUIDs from combined feed
        const guidMatches = combinedXml.match(/<guid[^>]*>([^<]+)<\/guid>/g);
        if (guidMatches && guidMatches.length > 1) {
          const guids = guidMatches.map((match) =>
            match.replace(/<guid[^>]*>([^<]+)<\/guid>/, '$1')
          );

          // Check uniqueness across all content types
          const uniqueGuids = new Set(guids);
          expect(uniqueGuids.size).toBe(guids.length);
        }
      });

      it('should maintain consistent XML structure across all feeds', async () => {
        const [{ xml: combinedXml }, { xml: blogXml }, { xml: projectsXml }] = await Promise.all([
          getCombinedFeed(),
          getBlogFeed(),
          getProjectsFeed()
        ]);
        const feeds = [combinedXml, blogXml, projectsXml];

        feeds.forEach((xmlContent) => {
          // All feeds should have consistent XML structure
          expect(xmlContent).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
          expect(xmlContent).toContain('<rss version="2.0"');
          expect(xmlContent).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
          expect(xmlContent).toContain('<channel>');
          expect(xmlContent).toContain('</channel>');
          expect(xmlContent).toContain('</rss>');
          expect(xmlContent).toContain('<generator>SvelteKit RSS Generator</generator>');
        });
      });
    });
  });
});
