import { getPosts, importOgImage } from '$lib/js/posts.js';
import { escapeXml, getMarkdownContent, generateRssXml } from '$lib/utils/rss.js';

export const prerender = true;

export async function GET() {
  // Get all projects using the existing getPosts function for metadata
  const modules = import.meta.glob('/src/content/projects/*/*.md');
  const projects = await getPosts(modules);

  // Get modules for loading raw content
  const projectContentModules = import.meta.glob('/src/content/projects/*/*.md', {
    query: '?raw',
    import: 'default'
  });

  /**
   * Create enhanced content for project RSS items
   */
  async function createEnhancedProjectContent(project) {
    let content = '';
    const pathKey = Object.keys(projectContentModules).find((path) => path.includes(project.slug));

    // Convert markdown to HTML
    if (pathKey) {
      try {
        const markdownContent = await getMarkdownContent(pathKey, projectContentModules);
        if (markdownContent?.trim()) {
          const { markdownToHtml } = await import('$lib/utils/markdown.js');
          let htmlContent = await markdownToHtml(markdownContent);

          content += htmlContent;
        }
      } catch (error) {
        console.warn('Failed to process markdown content for:', project.slug, error);
        if (project.description) {
          content += `<p>${escapeXml(project.description)}</p>`;
        }
      }
    }

    // Fallback to description if no content was found
    if (!content && project.description) {
      content += `<p>${escapeXml(project.description)}</p>`;
    }

    // Add metadata information
    content +=
      '<hr><div style="margin-top: 20px; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">';

    if (project.description) {
      content += `<p><strong>Summary:</strong> ${escapeXml(project.description)}</p>`;
    }

    if (project.date) {
      content += `<p><strong>Published:</strong> ${new Date(project.date).toDateString()}</p>`;
    }

    if (project.tags?.length > 0) {
      content += `<p><strong>Tags:</strong> ${project.tags.map((tag) => escapeXml(tag)).join(', ')}</p>`;
    }

    // Add project-specific metadata
    if (project.icon) {
      content += `<p><strong>Icon:</strong> ${escapeXml(project.icon)}</p>`;
    }

    if (project.website) {
      content += `<p><strong>Website:</strong> <a href="${escapeXml(project.website)}">${escapeXml(project.website)}</a></p>`;
    }

    if (project.github) {
      content += `<p><strong>GitHub:</strong> <a href="${escapeXml(project.github)}">${escapeXml(project.github)}</a></p>`;
    }

    content += '</div>';

    return content || 'No content available';
  }

  // Process projects with enhanced content
  const processedProjects = await Promise.all(
    projects
      .filter((project) => project.published !== false)
      .map(async (project) => ({
        ...project,
        content: await createEnhancedProjectContent(project)
      }))
  );

  // Sort by date (newest first)
  const sortedPosts = processedProjects.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Process projects with images
  const projectsWithImages = await Promise.all(
    sortedPosts.map(async (project) => {
      let imageData = null;

      if (project.thumbnail) {
        try {
          const imagePath = `projects/${project.slug}/${project.thumbnail}`;
          const imageModule = await importOgImage(imagePath);

          // Handle different image object structures
          const imageSrc = imageModule?.img?.src || imageModule?.src || imageModule?.fallback?.src;

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
        imageData
      };
    })
  );

  // Define feed metadata
  const feedBaseUrl = 'https://techquests.dev';
  const feedTitle = 'Tech Quests Projects';
  const feedDescription = 'Latest projects by Andre Nogueira';
  const feedAuthor = 'Andre Nogueira';
  const feedEmail = 'aanogueira@protonmail.com';

  // Generate RSS items
  const rssItems = projectsWithImages.map(
    (project) => `    <item>
      <title>${escapeXml(project.name || project.title || 'Untitled')}</title>
      <description>${escapeXml(project.description || 'No description available')}</description>
      <content:encoded><![CDATA[${project.content || project.description || 'No content available'}]]></content:encoded>
      <link>${feedBaseUrl}/projects/${project.slug}</link>
      <guid isPermaLink="true">${feedBaseUrl}/projects/${project.slug}</guid>
      <pubDate>${new Date(project.date || new Date()).toUTCString()}</pubDate>
      <author>${feedEmail} (${feedAuthor})</author>
      <category>Projects</category>
      ${project.website ? `<comments>${escapeXml(project.website)}</comments>` : ''}
      ${project.github ? `<source url="${escapeXml(project.github)}">GitHub Repository</source>` : ''}
      ${project.imageData ? `<enclosure url="${feedBaseUrl}${project.imageData.url}" length="${project.imageData.length}" type="${project.imageData.type}" />` : ''}
    </item>`
  );

  // Generate RSS XML using shared utility
  const rss = generateRssXml({
    title: feedTitle,
    description: feedDescription,
    baseUrl: `${feedBaseUrl}/projects`,
    feedUrl: `${feedBaseUrl}/projects/rss.xml`,
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
