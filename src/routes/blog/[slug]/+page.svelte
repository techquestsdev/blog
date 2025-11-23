<script>
  import { formatDate } from '$lib/js/utils.js';

  export let data;

  let { default: content, metadata } = data.post;
</script>

<main>
  <h1>
    <iconify-icon icon={metadata.icon}> </iconify-icon>{metadata.name}
  </h1>
  <p class="date">{formatDate(metadata.date)}</p>
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

  .date {
    margin: $spacing-sm 0;
    font-size: $font-base;
    font-family: 'Fira Mono', monospace;
  }

  .description {
    font-size: $font-sm;
    margin: $spacing-sm 0 $spacing-3xl 0;
    font-style: italic;
    color: var(--txt-2);
  }

  h1 {
    margin: $spacing-lg 0;
    line-height: 1.3;
  }
</style>
