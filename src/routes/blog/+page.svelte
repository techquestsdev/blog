<script>
  import { formatDate } from '$lib/js/utils.js';
  import RssIcon from '~icons/ph/rss';

  export let data;
</script>

<main>
  <div class="title-row">
    <h1>Blog <span class="count">[{data.posts.length}]</span></h1>
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
        <div class="date">{formatDate(post.date)}</div>
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

  h2 {
    margin: 0;
    color: var(--txt);
  }

  .date {
    grid-area: date;
    font-size: $font-sm;
    font-family: $font-family-mono;
    color: var(--txt-3);
    margin-top: $spacing-2xs;
  }

  a {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-areas:
      'date title'
      '. description';
    justify-content: left;
    gap: $spacing-md $spacing-3xl;
  }

  h2 {
    grid-area: title;
  }

  .description {
    grid-area: description;
  }

  @media (max-width: $breakpoint-mobile) {
    a {
      grid-template-columns: auto;
      grid-template-areas:
        'date'
        'title'
        'description';
      gap: $spacing-xs;

      .description {
        grid-column: 1;
      }

      .date {
        margin-top: 0;
      }
    }
  }
</style>
