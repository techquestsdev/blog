import { getPosts, importOgImage } from '$lib/js/posts.js';
import { escapeXml, getMarkdownContent, generateRssItem, generateRssXml } from '$lib/utils/rss.js';

export const prerender = true;

export async function GET() {
  // Get both blog posts and projects using the existing getPosts function
  const blogModules = import.meta.glob('/src/content/blog/*/*.md');
  const projectModules = import.meta.glob('/src/content/projects/*/*.md');

  // Also get the raw content modules for reading markdown content
  const blogContentModules = import.meta.glob('/src/content/blog/*/*.md', {
    query: '?raw',
    import: 'default'
  });
  const projectContentModules = import.meta.glob('/src/content/projects/*/*.md', {
    query: '?raw',
    import: 'default'
  });

  const [blogPosts, projects] = await Promise.all([
    getPosts(blogModules),
    getPosts(projectModules)
  ]);

  /**
   * Create enhanced content for RSS items with full HTML content
   */
  async function createEnhancedContent(item) {
    let content = '';
    const isProject = item.type === 'project' || (!item.type && item.website);
    const contentModules = isProject ? projectContentModules : blogContentModules;
    const pathKey = Object.keys(contentModules).find((path) => path.includes(item.slug));

    // Convert markdown to HTML
    if (pathKey) {
      try {
        const markdownContent = await getMarkdownContent(pathKey, contentModules);
        if (markdownContent?.trim()) {
          const { markdownToHtml } = await import('$lib/utils/markdown.js');
          let htmlContent = await markdownToHtml(markdownContent);

          content += htmlContent + '<hr>';
        }
      } catch (error) {
        console.warn('Failed to process markdown content for:', item.slug, error);
        if (item.description) {
          content += `<p>${escapeXml(item.description)}</p><hr>`;
        }
      }
    }

    // Fallback to description if no content was found
    if (!content && item.description) {
      content += `<p>${escapeXml(item.description)}</p><hr>`;
    }

    // Add metadata information
    content +=
      '<div style="margin-top: 20px; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">';

    if (item.description) {
      content += `<p><strong>Summary:</strong> ${escapeXml(item.description)}</p>`;
    }

    if (item.date) {
      content += `<p><strong>Published:</strong> ${new Date(item.date).toDateString()}</p>`;
    }

    if (item.tags?.length > 0) {
      content += `<p><strong>Tags:</strong> ${item.tags.map((tag) => escapeXml(tag)).join(', ')}</p>`;
    }

    // Add project-specific metadata
    if (item.icon) {
      content += `<p><strong>Icon:</strong> ${escapeXml(item.icon)}</p>`;
    }

    if (item.website) {
      content += `<p><strong>Website:</strong> <a href="${escapeXml(item.website)}">${escapeXml(item.website)}</a></p>`;
    }

    if (item.github) {
      content += `<p><strong>GitHub:</strong> <a href="${escapeXml(item.github)}">${escapeXml(item.github)}</a></p>`;
    }

    content += '</div>';

    return content || 'No content available';
  }

  // Process content with full markdown
  const processedBlogPosts = await Promise.all(
    blogPosts.map(async (post) => ({
      ...post,
      type: 'blog',
      content: await createEnhancedContent({ ...post, type: 'blog' })
    }))
  );

  const processedProjects = await Promise.all(
    projects.map(async (project) => ({
      ...project,
      type: 'project',
      content: await createEnhancedContent({ ...project, type: 'project' })
    }))
  );

  // Combine and process all content with image support
  const allContent = await Promise.all([
    // Process blog posts
    ...processedBlogPosts
      .filter((post) => post.published !== false)
      .map(async (post) => {
        let imageData = null;

        if (post.image) {
          try {
            const imagePath = `blog/${post.slug}/${post.image}`;
            const imageModule = await importOgImage(imagePath);
            const imageSrc =
              imageModule?.img?.src || imageModule?.src || imageModule?.fallback?.src;

            if (imageSrc) {
              imageData = {
                url: imageSrc,
                type: post.image.endsWith('.png') ? 'image/png' : 'image/jpeg',
                length: '0'
              };
            }
          } catch {
            // Silently handle missing images
          }
        }

        return {
          ...post,
          type: 'blog',
          url: `/blog/${post.slug}`,
          sortDate: new Date(post.date || new Date()),
          imageData
        };
      }),
    // Process projects
    ...processedProjects
      .filter((project) => project.published !== false)
      .map(async (project) => {
        let imageData = null;

        if (project.thumbnail) {
          try {
            const imagePath = `projects/${project.slug}/${project.thumbnail}`;
            const imageModule = await importOgImage(imagePath);
            const imageSrc =
              imageModule?.img?.src || imageModule?.src || imageModule?.fallback?.src;

            if (imageSrc) {
              imageData = {
                url: imageSrc,
                type: project.thumbnail.endsWith('.png') ? 'image/png' : 'image/jpeg',
                length: '0'
              };
            }
          } catch {
            // Silently handle missing images
          }
        }

        return {
          ...project,
          type: 'project',
          url: `/projects/${project.slug}`,
          name: project.name || project.title,
          sortDate: new Date(project.date || new Date()),
          imageData
        };
      })
  ]);

  // Sort by date (newest first), with projects treated as recent
  const sortedContent = allContent.sort((a, b) => b.sortDate - a.sortDate).slice(0, 25); // Latest 25 items

  // Define feed metadata
  const baseUrl = 'https://techquests.dev';
  const feedTitle = 'Tech Quests - All Content';
  const feedDescription = 'Latest blog posts and projects by Andre Nogueira';
  const feedAuthor = 'Andre Nogueira';
  const feedEmail = 'aanogueira@protonmail.com';

  // Generate RSS XML using shared utility
  const rssItems = sortedContent.map((item) =>
    generateRssItem(item, baseUrl, feedAuthor, feedEmail)
  );

  const rss = generateRssXml({
    title: feedTitle,
    description: feedDescription,
    baseUrl: baseUrl,
    feedUrl: `${baseUrl}/rss.xml`,
    managingEditor: `${feedEmail} (${feedAuthor})`,
    webMaster: `${feedEmail} (${feedAuthor})`,
    lastBuildDate: new Date().toUTCString(),
    pubDate:
      sortedContent.length > 0 ? sortedContent[0].sortDate.toUTCString() : new Date().toUTCString(),
    items: rssItems
  });

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    }
  });
}
