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

  const cleanedMarkdown = markdown
    .replace(/<script[\s\S]*?<\/script>/gim, '')
    .replace(/<CaptionMermaid[^>]*>[\s\S]*?<\/CaptionMermaid>/gim, (match) => {
      const altMatch = match.match(/alt=["']([^"']*)["']/i);
      const altText = altMatch?.[1]?.trim();
      return altText ? `\n\n**Diagram:** ${altText}\n\n` : '';
    })
    .replace(/<CaptionImage>[\s\S]*?<\/CaptionImage>/gim, (match) => {
      const altMatch = match.match(/alt=["']([^"']*)["']/i);
      const altText = altMatch?.[1]?.trim();
      return altText ? `\n\n**Image:** ${altText}\n\n` : '';
    })
    .replace(/<CaptionImage\s+[^>]*\/?>/gim, (match) => {
      const altMatch = match.match(/alt=["']([^"']*)["']/i);
      const altText = altMatch?.[1]?.trim();
      return altText ? `\n\n**Image:** ${altText}\n\n` : '';
    })
    .replace(/<svelte:component[^>]*>[\s\S]*?<\/svelte:component>/gim, '');

  const codeBlocks = [];
  const inlineCodes = [];
  let html = cleanedMarkdown.replace(/```([\s\S]*?)```/gims, (match, code) => {
    const token = `@@CODEBLOCK${codeBlocks.length}@@`;
    codeBlocks.push(`<pre><code>${code}</code></pre>`);
    return `\n\n${token}\n\n`;
  });

  html = html.replace(/`([^`]*?)`/gim, (match, code) => {
    const token = `@@INLINECODE${inlineCodes.length}@@`;
    inlineCodes.push(`<code>${code}</code>`);
    return token;
  });

  // Basic markdown processing (this is a simple implementation)
  html = html
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Horizontal rules
    .replace(/(^|\n)(-{3,}|\*{3,}|_{3,})(?=\n|$)/gim, '$1<hr>')
    // Blockquotes
    .replace(/(^|\n)>\s?([^\n]+)/gim, '$1<blockquote>$2</blockquote>')
    // Unordered lists
    .replace(/(^|\n)([-*+]\s+[^\n]+(\n[-*+]\s+[^\n]+)*)/gim, (match, start, list) => {
      const items = list
        .split('\n')
        .map((line) => line.replace(/^[-*+]\s+/, '').trim())
        .filter(Boolean)
        .map((item) => `<li>${item}</li>`)
        .join('');
      return `${start}<ul>${items}</ul>`;
    })
    // Ordered lists
    .replace(/(^|\n)(\d+\.\s+[^\n]+(\n\d+\.\s+[^\n]+)*)/gim, (match, start, list) => {
      const items = list
        .split('\n')
        .map((line) => line.replace(/^\d+\.\s+/, '').trim())
        .filter(Boolean)
        .map((item) => `<li>${item}</li>`)
        .join('');
      return `${start}<ol>${items}</ol>`;
    })
    // Bold and italic
    .replace(/\*\*([^*\n]+?)\*\*/gim, '<strong>$1</strong>')
    .replace(/(^|[^\w])__([^_\n]+?)__([^\w]|$)/gim, '$1<strong>$2</strong>$3')
    .replace(/(^|[^*])\*(?!\s|\*)([^*\n]+?)\*(?!\*)/gim, '$1<em>$2</em>')
    .replace(/(^|[^\w])_(?!_)([^_\n]+?)_(?!_)/gim, '$1<em>$2</em>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]*)\)/gim, '<img src="$2" alt="$1">')
    // Links
    .replace(/\[([^\]]*)\]\(([^)]*)\)/gim, '<a href="$2">$1</a>')
    // Line breaks
    .replace(/\n\n/gim, '</p><p>')
    .replace(/\n/gim, '<br>');

  codeBlocks.forEach((block, index) => {
    html = html.replace(`@@CODEBLOCK${index}@@`, block);
  });

  inlineCodes.forEach((block, index) => {
    html = html.replace(`@@INLINECODE${index}@@`, block);
  });

  // Wrap in paragraph tags
  html = '<p>' + html + '</p>';

  // Clean up empty paragraphs and malformed tags
  html = html
    .replace(/<p><\/p>/gim, '')
    .replace(/<p><h([1-6])>/gim, '<h$1>')
    .replace(/<\/h([1-6])><\/p>/gim, '</h$1>')
    .replace(/<p><pre>/gim, '<pre>')
    .replace(/<\/pre><\/p>/gim, '</pre>')
    .replace(/<p><(ul|ol|blockquote)>/gim, '<$1>')
    .replace(/<\/(ul|ol|blockquote)><\/p>/gim, '</$1>')
    .replace(/<p><hr><\/p>/gim, '<hr>');

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
    .replace(/\[object Object\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

export function convertHtmlToPlainText(html) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
