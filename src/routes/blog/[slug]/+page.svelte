<script>
  import { formatDate } from '$lib/js/utils.js';

  export let data;

  let { default: content, metadata } = data.post;
</script>

<main>
  <h1>
    <iconify-icon icon={metadata.icon}> </iconify-icon>
    {metadata.name}
  </h1>
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
    font-size: $font-sm;
    margin: $spacing-sm 0 $spacing-3xl 0;
    font-style: italic;
    color: var(--txt-2);
  }

  .meta {
    margin: $spacing-sm 0 0 0;
    font-size: $font-sm;
    font-family: 'Fira Mono', monospace;
    color: var(--txt-2);
    display: flex;
    gap: $spacing-sm;
    align-items: center;
  }

  .divider {
    color: var(--txt-3);
  }

  h1 {
    margin: $spacing-lg 0;
    line-height: 1.3;
    display: flex;
    align-items: center;
    gap: 0;
  }

  h1 :global(iconify-icon) {
    padding-right: 0.75ch;
  }
</style>
