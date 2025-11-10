<script>
  import { page } from '$app/stores';

  export let title;
  export let description;
  export let type = 'website';
  export let image = {};

  const hostname = 'https://techquests.dev';

  $: canonicalUrl = $page.url.href.replace(/^http:\/\/[^/]+/, hostname);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:site_name" content="Tech Quests" />
  <meta property="og:title" content={title} />
  <meta property="og:type" content={type} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonicalUrl} />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:site" content="@0xaanogueira" />
  <meta name="twitter:creator" content="@0xaanogueira" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  {#if image}
    <meta property="og:image" content={hostname + image.img.src} />
    <meta property="og:image:width" content={image.img.w} />
    <meta property="og:image:height" content={image.img.h} />
    <meta property="og:image:alt" content={title} />
    <meta name="twitter:image" content={hostname + image.img.src} />
    <meta name="twitter:image:alt" content={title} />
  {/if}
</svelte:head>
