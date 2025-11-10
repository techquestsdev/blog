import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex, escapeSvelte } from 'mdsvex';
import { createHighlighterCore } from 'shiki/core';
import { createOnigurumaEngine } from 'shiki';
import getWasm from 'shiki/wasm';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';
import rehypeUnwrapImages from 'rehype-unwrap-images';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkMermaid from 'remark-mermaidjs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize highlighter with only the languages and themes needed
// This dramatically reduces build time by not loading all bundled languages
const highlighterPromise = createHighlighterCore({
  themes: [import('shiki/themes/rose-pine.mjs'), import('shiki/themes/rose-pine-dawn.mjs')],
  langs: [
    // Only import the languages actually used
    import('shiki/langs/javascript.mjs'),
    import('shiki/langs/typescript.mjs'),
    import('shiki/langs/bash.mjs'),
    import('shiki/langs/shell.mjs'),
    import('shiki/langs/yaml.mjs'),
    import('shiki/langs/json.mjs'),
    import('shiki/langs/markdown.mjs'),
    import('shiki/langs/dockerfile.mjs'),
    import('shiki/langs/go.mjs'),
    import('shiki/langs/python.mjs'),
    import('shiki/langs/html.mjs'),
    import('shiki/langs/css.mjs'),
    import('shiki/langs/toml.mjs'),
    import('shiki/langs/ini.mjs'),
    import('shiki/langs/nginx.mjs'),
    import('shiki/langs/jsx.mjs'),
    import('shiki/langs/tsx.mjs')
    // Add more languages as needed
  ],
  loadWasm: getWasm,
  engine: createOnigurumaEngine(getWasm)
});

const mdsvexOptions = {
  extensions: ['.md'],
  layout: {
    _: path.resolve(__dirname, 'src/mdsvex.svelte')
  },
  highlight: {
    highlighter: async (code, lang = 'text') => {
      const highlighter = await highlighterPromise;
      const html = highlighter.codeToHtml(code, {
        lang,
        themes: {
          dark: 'rose-pine',
          light: 'rose-pine-dawn'
        },
        colorReplacements: {
          '#1e1e2e': 'none'
        }
      });
      const escaped = escapeSvelte(html);
      return `{@html \`${escaped}\` }`;
    }
  },
  remarkPlugins: [
    remarkGfm,
    [remarkToc, { tight: true }],
    [
      remarkMermaid,
      {
        mermaidConfig: {
          theme: 'neutral',
          securityLevel: 'loose',
          registerIconPacks: {
            default: 'mdi'
          }
        }
      }
    ]
  ],
  rehypePlugins: [
    rehypeUnwrapImages,
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        behavior: 'wrap',
        properties: {
          class: 'silent'
        }
      }
    ]
  ]
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md'],
  preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter(),
    paths: {
      relative: false
    },
    inlineStyleThreshold: Infinity
  }
};

export default config;
