<script>
  import { page } from '$app/stores';

  export let title;
  export let description;
  export let type = 'website';
  export let image = null;
  export let jsonLd = null;

  const hostname = 'https://techquests.dev';
  const siteName = 'Tech Quests';
  const authorName = 'Andre Nogueira';

  $: canonicalUrl = `${hostname}${$page.url.pathname}`;
  $: hasImage = Boolean(image?.img?.src);
  $: twitterCard = hasImage ? 'summary_large_image' : 'summary';
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="author" content={authorName} />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <link rel="canonical" href={canonicalUrl} />
  <link
    rel="alternate"
    type="application/rss+xml"
    title="Tech Quests RSS"
    href={`${hostname}/rss.xml`}
  />
  <meta property="og:site_name" content={siteName} />
  <meta property="og:locale" content="en_US" />
  <meta property="og:title" content={title} />
  <meta property="og:type" content={type} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonicalUrl} />
  <meta name="twitter:card" content={twitterCard} />
  <meta name="twitter:site" content="@0xaanogueira" />
  <meta name="twitter:creator" content="@0xaanogueira" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  {#if hasImage}
    <meta property="og:image" content={hostname + image.img.src} />
    {#if image.img.w && image.img.h}
      <meta property="og:image:width" content={image.img.w} />
      <meta property="og:image:height" content={image.img.h} />
    {/if}
    <meta property="og:image:alt" content={title} />
    <meta name="twitter:image" content={hostname + image.img.src} />
    <meta name="twitter:image:alt" content={title} />
  {:else}
    <meta property="og:image" content={`${hostname}/blog.png`} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content={siteName} />
    <meta name="twitter:image" content={`${hostname}/blog.png`} />
    <meta name="twitter:image:alt" content={siteName} />
  {/if}
  {#if jsonLd}
    <script type="application/ld+json">
      {@html JSON.stringify(jsonLd)}
    </script>
  {/if}
</svelte:head>
