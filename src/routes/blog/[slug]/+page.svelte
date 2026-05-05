<script>
  import { formatDate } from '$lib/js/utils.js';

  export let data;

  let { default: content, metadata } = data.post;
</script>

<main>
  <a href="/blog" class="back">
    <span class="arrow">&lt;</span>Back to blog
  </a>
  <h1><iconify-icon icon={metadata.icon}></iconify-icon>{metadata.name}</h1>
  <p class="meta">
    <span class="author">Andre Nogueira</span>
    <span class="divider">·</span>
    <time datetime={metadata.date}>{formatDate(metadata.date)}</time>
  </p>
  <p class="description">{metadata.description}</p>
  <div class="content">
    <svelte:component this={content} />
  </div>
</main>

<style lang="scss">
  main {
    @include page-container;
    padding-top: 0;
  }

  .description {
    font-size: $font-base;
    margin: $spacing-md 0 $spacing-3xl 0;
    font-style: italic;
    color: var(--txt-2);
  }

  .meta {
    margin: $spacing-sm 0 0 0;
    font-size: $font-xs;
    font-family: $font-family-mono;
    color: var(--txt-3);
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
    align-items: center;
  }

  .divider {
    color: var(--txt-3);
  }

  h1 {
    margin: 0;
    line-height: 1.3;
  }

  h1 :global(iconify-icon) {
    vertical-align: -0.1em;
    margin-right: 0.1ch;
  }
</style>
