import { getPosts } from '$lib/js/posts.js';
import { escapeXml, getMarkdownContent, generateRssXml } from '$lib/utils/rss.js';
import { convertHtmlToPlainText, truncateHtmlForDescription } from '$lib/utils/markdown.js';

export const prerender = true;

export async function GET() {
  // Get all blog posts using the existing getPosts function for metadata
  const modules = import.meta.glob('/src/content/blog/*/*.md');
  const posts = await getPosts(modules);

  // Get modules for loading raw content
  const blogContentModules = import.meta.glob('/src/content/blog/*/*.md', {
    query: '?raw',
    import: 'default'
  });

  /**
   * Create enhanced content for blog RSS items
   */
  async function createEnhancedBlogContent(post) {
    let content = '';
    const pathKey = Object.keys(blogContentModules).find((path) => path.includes(post.slug));

    // Convert markdown to HTML
    if (pathKey) {
      try {
        const markdownContent = await getMarkdownContent(pathKey, blogContentModules);
        if (markdownContent?.trim()) {
          const { markdownToHtml } = await import('$lib/utils/markdown.js');
          const htmlContent = await markdownToHtml(markdownContent);

          content += htmlContent;
        }
      } catch (error) {
        console.warn('Failed to process markdown content for:', post.slug, error);
        if (post.description) {
          content += `<p>${escapeXml(post.description)}</p>`;
        }
      }
    }

    // Fallback to description if no content was found
    if (!content && post.description) {
      content += `<p>${escapeXml(post.description)}</p>`;
    }

    // Add a text fallback when HTML is empty
    if (!content) {
      content = post.description || 'No content available';
    }

    return content || 'No content available';
  }

  // Process posts with enhanced content
  const processedPosts = await Promise.all(
    posts
      .filter((post) => post.published !== false)
      .map(async (post) => ({
        ...post,
        content: await createEnhancedBlogContent(post)
      }))
  );

  // Sort by date (newest first)
  const sortedPosts = processedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Define feed metadata
  const feedBaseUrl = 'https://techquests.dev';
  const feedTitle = 'Tech Quests Blog';
  const feedDescription = 'Latest blog posts and articles by Andre Nogueira';
  const feedAuthor = 'Andre Nogueira';
  const feedEmail = 'aanogueira@protonmail.com';

  // Generate RSS items
  const rssItems = sortedPosts.map((post) => {
    const body = post.content || post.description || 'No content available';
    const plainText = convertHtmlToPlainText(body);
    const summary = truncateHtmlForDescription(plainText, 220);
    return `    <item>
      <title>${escapeXml(post.name || 'Untitled')}</title>
      <description>${escapeXml(summary || post.description || 'No description available')}</description>
      <content:encoded><![CDATA[${body}]]></content:encoded>
      <link>${feedBaseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${feedBaseUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date || new Date()).toUTCString()}</pubDate>
      <author>${feedEmail} (${feedAuthor})</author>
      ${post.tags ? post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join('\n      ') : '<category>Blog</category>'}
    </item>`;
  });

  // Generate RSS XML using shared utility
  const rss = generateRssXml({
    title: feedTitle,
    description: feedDescription,
    baseUrl: `${feedBaseUrl}/blog`,
    feedUrl: `${feedBaseUrl}/blog/rss.xml`,
    managingEditor: `${feedEmail} (${feedAuthor})`,
    webMaster: `${feedEmail} (${feedAuthor})`,
    lastBuildDate: new Date().toUTCString(),
    pubDate:
      sortedPosts.length > 0
        ? new Date(sortedPosts[0].date || new Date()).toUTCString()
        : new Date().toUTCString(),
    items: rssItems
  });

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    }
  });
}
