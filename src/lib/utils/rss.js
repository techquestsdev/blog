/**
 * Shared utilities for RSS feed generation
 */

/**
 * Escape XML special characters to prevent XML syntax errors
 */
export function escapeXml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Extract content from raw markdown with frontmatter
 */
export function extractMarkdownContent(rawContent) {
  if (!rawContent) return '';

  const parts = rawContent.split('---');
  if (parts.length < 3) return rawContent;

  return parts.slice(2).join('---').trim();
}

/**
 * Load raw markdown content from import.meta.glob modules
 */
export async function getMarkdownContent(pathKey, contentModules) {
  const rawContent = await contentModules[pathKey]();
  return extractMarkdownContent(rawContent);
}

/**
 * Generate RSS item XML for a content item
 */
export function generateRssItem(item, baseUrl, feedAuthor, feedEmail) {
  let itemXml = `    <item>
      <title>${escapeXml(`${item.type === 'project' ? '[Project] ' : ''}${item.name || 'Untitled'}`)}</title>
      <description>${escapeXml(item.description || 'No description available')}</description>
      <content:encoded><![CDATA[${item.content || item.description || 'No content available'}]]></content:encoded>
      <link>${escapeXml(baseUrl + item.url)}</link>
      <guid isPermaLink="true">${escapeXml(baseUrl + item.url)}</guid>
      <pubDate>${item.sortDate.toUTCString()}</pubDate>
      <author>${feedEmail} (${feedAuthor})</author>
      <category>${escapeXml(item.type === 'project' ? 'Projects' : 'Blog')}</category>`;

  if (item.tags) {
    itemXml += item.tags
      .map(
        (tag) => `
      <category>${escapeXml(tag)}</category>`
      )
      .join('');
  }

  if (item.website && item.type === 'project') {
    itemXml += `
      <comments>${escapeXml(item.website)}</comments>`;
  }

  if (item.imageData) {
    itemXml += `
      <enclosure url="${escapeXml(baseUrl + item.imageData.url)}" length="${escapeXml(item.imageData.length)}" type="${escapeXml(item.imageData.type)}" />`;
  }

  itemXml += `
    </item>`;

  return itemXml;
}

/**
 * Generate RSS XML template
 */
export function generateRssXml({
  title,
  description,
  baseUrl,
  feedUrl,
  managingEditor,
  webMaster,
  lastBuildDate,
  pubDate,
  items
}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${title}</title>
    <description>${description}</description>
    <link>${baseUrl}</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <managingEditor>${managingEditor}</managingEditor>
    <webMaster>${webMaster}</webMaster>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <pubDate>${pubDate}</pubDate>
    <ttl>1440</ttl>
    <generator>SvelteKit RSS Generator</generator>
${items.join('')}
  </channel>
</rss>`;
}

/**
 * Test utilities for RSS validation
 */

/**
 * Parse RSS items from XML content
 */
export function parseRssItems(xmlContent) {
  const itemPattern = /<item[\s\S]*?<\/item>/g;
  return xmlContent.match(itemPattern) || [];
}

/**
 * Validate basic RSS XML structure
 */
export function validateRssStructure(xmlContent) {
  const checks = {
    hasXmlDeclaration: /^<\?xml version="1\.0" encoding="UTF-8"\?>/.test(xmlContent),
    hasRssTag: xmlContent.includes('<rss version="2.0"'),
    hasChannel: xmlContent.includes('<channel>') && xmlContent.includes('</channel>'),
    hasCloseTag: xmlContent.includes('</rss>'),
    hasNamespaces: xmlContent.includes('xmlns:atom=') && xmlContent.includes('xmlns:content='),
    hasContentEncoded: xmlContent.includes('<content:encoded>'),
    hasCDATA: xmlContent.includes('<![CDATA[') && xmlContent.includes(']]></content:encoded>')
  };

  return {
    isValid: Object.values(checks).every(Boolean),
    checks
  };
}

/**
 * Validate XML syntax (excluding CDATA content)
 */
export function validateXmlSyntax(xmlContent) {
  // Split on CDATA boundaries and check non-CDATA parts for syntax errors
  const parts = xmlContent.split(/<!\[CDATA\[|\]\]>/);
  const errors = [];

  for (let i = 0; i < parts.length; i += 2) {
    const xmlPart = parts[i];
    // Check for obvious XML syntax errors in the XML structure parts
    if (xmlPart.match(/<<|>>/)) {
      errors.push(`XML syntax error in part ${i}: contains double angle brackets`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
