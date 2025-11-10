<script>
  import Image from '$lib/components/Image.svelte';

  export let data;
</script>

<main>
  <h1>Projects</h1>

  <div class="posts">
    {#each data.posts as post (post.slug)}
      <a href={'/projects/' + post.slug} class="link">
        <Image
          image={post.thumbnail}
          alt={post.description}
          sizes="(min-width: 1200px) 50vw, 100vw"
          --aspect-ratio="16/9"
        />
        <h2>{post.name}<span class="arrow">-></span><span class="slash">/</span></h2>
        <div class="description">{post.description}</div>
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

  h2 {
    margin: $spacing-sm 0 $spacing-smd 0;
    color: var(--txt);
    font-size: $font-lg;
  }

  @media (max-width: $breakpoint-tablet) {
    .posts {
      grid-template-columns: auto;
    }
  }
</style>
