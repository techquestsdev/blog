<script>
  import DOMPurify from 'dompurify';
  import { theme } from '$lib/js/theme';
  import { onMount } from 'svelte';
  import { mdsvex } from 'mdsvex';
  import { codeToHtml } from 'shiki';

  export let content = '';
  let hContent = '';

  let currentTheme;
  $: currentTheme = $theme;

  const highlighter = async (code, lang = 'text') => {
    const themeName = currentTheme === 'dark' ? 'rose-pine' : 'rose-pine-dawn';
    const html = await codeToHtml(code, {
      lang,
      theme: themeName,
      colorReplacements: { '#1e1e2e': 'none' }
    });
    return `{@html \`${html}\` }`;
  };

  onMount(async () => {
    const rawHtml = await mdsvex({
      highlight: { highlighter }
    }).process(content);

    hContent = DOMPurify.sanitize(rawHtml.toString(), { USE_PROFILES: { html: true } });
  });
</script>

<div>
  {@html hContent}<!-- eslint-disable-line svelte/no-at-html-tags -->
</div>
