<script>
  import { formatDate } from '$lib/js/utils.js';

  export let data;
</script>

<main>
  <h1>Blog</h1>

  <div class="posts">
    {#each data.posts as post (post.slug)}
      <a href={'/blog/' + post.slug} class="link">
        <div class="date">{formatDate(post.date)}</div>
        <h2>
          <iconify-icon icon={post.icon}> </iconify-icon>{post.name}<span class="arrow"
            >&nbsp;></span
          ><span class="slash">/</span>
        </h2>
        <div class="description">{post.description}</div>
      </a>
    {/each}
  </div>
</main>

<style lang="scss">
  main {
    @include page-container;
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
    font-size: $font-sm;
    font-family: 'Fira Mono', monospace;
    color: var(--txt-2);
    margin-top: $spacing-2xs;
  }

  a {
    display: grid;
    grid-template-columns: auto auto;
    justify-content: left;
    gap: $spacing-md $spacing-3xl;
  }

  .description {
    grid-column: 2;
  }

  @media (max-width: $breakpoint-mobile) {
    a {
      grid-template-columns: auto;
      gap: $spacing-md;

      .description {
        grid-column: 1;
      }
    }
  }
</style>
