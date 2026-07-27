<script>
  import { formatDate } from '$lib/js/utils.js';
  import RssIcon from '~icons/ph/rss';

  export let data;
</script>

<main>
  <div class="title-row">
    <h1>Chronicles <span class="count">[{data.posts.length}]</span></h1>
    <a
      href="/blog/rss.xml"
      class="rss-link"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Blog RSS feed"
    >
      <RssIcon /> RSS
    </a>
  </div>

  <div class="posts">
    {#each data.posts as post (post.slug)}
      <a href={'/blog/' + post.slug} class="link">
        <h2>
          <iconify-icon icon={post.icon}> </iconify-icon>{post.name}<span
            class="arrow"
            aria-hidden="true">&nbsp;></span
          ><span class="slash" aria-hidden="true">/</span>
        </h2>
        <div class="meta">
          {formatDate(post.date)}{#if post.journey}
            · {post.journey}{/if}
        </div>
        <div class="description">{post.description}</div>
      </a>
    {/each}
  </div>
</main>

<style lang="scss">
  main {
    @include page-container;
    padding-top: 0;
  }

  .title-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: $spacing-md;
    flex-wrap: wrap;
    margin: $spacing-xl 0 $spacing-2xl 0;

    h1 {
      margin: 0;
    }
  }

  .rss-link {
    font-family: $font-family-mono;
    font-size: $font-xs;
    color: var(--txt-3);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.4ch;
    transition: color $transition-fast;

    :global(svg) {
      font-size: 1em;
    }

    &:hover {
      color: var(--txt);
    }
  }

  .count {
    font-family: $font-family-mono;
    font-size: $font-base;
    color: var(--txt-3);
    font-weight: 400;
    margin-left: 0.5ch;
  }

  .posts {
    @include flex(column);
    gap: $spacing-xl;
    max-width: 100%;
  }

  a.link {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  h2 {
    margin: 0;
    color: var(--txt);
  }

  .meta {
    font-family: $font-family-mono;
    font-size: $font-xs;
    color: var(--txt-3);
  }
</style>
