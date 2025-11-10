/**
 * Markdown processing utilities for RSS feeds
 */
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Read raw markdown file content and extract body content
 * @param {string} relativePath - The relative path from src/content
 * @returns {Promise<{metadata: object, content: string}>}
 */
export async function readMarkdownFile(relativePath) {
  try {
    // Build the full path to the markdown file
    const fullPath = join(__dirname, '../../content', relativePath);
    const fileContent = await readFile(fullPath, 'utf-8');

    // Split frontmatter and content
    const parts = fileContent.split('---');
    if (parts.length < 3) {
      return {
        metadata: {},
        content: fileContent
      };
    }

    // Extract content (everything after the second ---)
    const content = parts.slice(2).join('---').trim();

    return {
      metadata: {}, // We already have metadata from the imports
      content: content
    };
  } catch (error) {
    console.error('Error reading markdown file:', error);
    return {
      metadata: {},
      content: 'Error reading content'
    };
  }
}

/**
 * Simple markdown to HTML converter (basic implementation)
 * @param {string} markdown - Raw markdown content
 * @returns {string} HTML string
 */
export function markdownToHtml(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  // Basic markdown processing (this is a simple implementation)
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]*)\]\(([^)]*)\)/gim, '<a href="$2">$1</a>')
    // Code blocks (basic)
    .replace(/```([^`]*?)```/gims, '<pre><code>$1</code></pre>')
    .replace(/`([^`]*?)`/gim, '<code>$1</code>')
    // Line breaks
    .replace(/\n\n/gim, '</p><p>')
    .replace(/\n/gim, '<br>');

  // Wrap in paragraph tags
  html = '<p>' + html + '</p>';

  // Clean up empty paragraphs and malformed tags
  html = html
    .replace(/<p><\/p>/gim, '')
    .replace(/<p><h([1-6])>/gim, '<h$1>')
    .replace(/<\/h([1-6])><\/p>/gim, '</h$1>')
    .replace(/<p><pre>/gim, '<pre>')
    .replace(/<\/pre><\/p>/gim, '</pre>');

  return html;
}

/**
 * Truncate HTML content for RSS description
 * @param {string} html - HTML content
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated plain text
 */
export function truncateHtmlForDescription(html, maxLength = 160) {
  // Strip HTML tags for description
  const plainText = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}
