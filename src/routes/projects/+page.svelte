<script>
  import Image from '$lib/components/Image.svelte';

  export let data;
</script>

<main>
  <h1>Projects</h1>

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
    max-width: $spacing-11xl;
    margin: 0 auto $spacing-9xl auto;
    padding: $spacing-xl;
  }

  .posts {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax($width-projects-card, 1fr));
    gap: $spacing-5xl;
    max-width: 100%;
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

  @media (max-width: $breakpoint-tablet) {
    .posts {
      grid-template-columns: auto;
    }
  }
</style>
