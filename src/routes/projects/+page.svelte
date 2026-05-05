<script>
  import Image from '$lib/components/Image.svelte';
  import RssIcon from '~icons/ph/rss';

  export let data;
</script>

<main>
  <div class="title-row">
    <h1>Projects <span class="count">[{data.posts.length}]</span></h1>
    <a
      href="/projects/rss.xml"
      class="rss-link"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Projects RSS feed"
    >
      <RssIcon /> RSS
    </a>
  </div>

  <div class="posts">
    {#each data.posts as post (post.slug)}
      <a href={'/projects/' + post.slug} class="link">
        <h2>
          {post.name}<span class="arrow" aria-hidden="true">&nbsp;></span><span
            class="slash"
            aria-hidden="true">/</span
          >
        </h2>
        <div class="description">{post.description}</div>
        <div class="thumb">
          <Image
            image={post.thumbnail}
            alt={`${post.name} thumbnail`}
            sizes="(min-width: 1200px) 50vw, 100vw"
            --aspect-ratio="16/9"
          />
        </div>
      </a>
    {/each}
  </div>
</main>

<style lang="scss">
  main {
    width: 100%;
    max-width: 110rem;
    margin: 0 auto $spacing-9xl auto;
    padding: $spacing-xl;
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
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-3xl;
    max-width: 100%;
  }

  @media (max-width: $breakpoint-desktop) {
    .posts {
      grid-template-columns: repeat(2, 1fr);
      gap: $spacing-2xl;
    }
  }

  a.link {
    display: grid;
    grid-template-areas:
      'thumb'
      'title'
      'description';
    gap: $spacing-sm;
  }

  .thumb {
    grid-area: thumb;
  }

  h2 {
    grid-area: title;
    margin: $spacing-sm 0 $spacing-smd 0;
    color: var(--txt);
    font-size: $font-lg;
  }

  .description {
    grid-area: description;
  }

  @media (max-width: $breakpoint-mobile) {
    .posts {
      grid-template-columns: 1fr;
      gap: $spacing-xl;
    }
  }
</style>
