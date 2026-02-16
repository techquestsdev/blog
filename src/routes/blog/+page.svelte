<script>
  import { formatDate } from '$lib/js/utils.js';

  export let data;
</script>

<main>
  <h1>Blog</h1>

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
    font-family: 'Fira Mono', monospace;
    color: var(--txt-2);
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
        'title'
        'date'
        'description';
      gap: $spacing-md;

      .description {
        grid-column: 1;
      }
    }
  }
</style>
