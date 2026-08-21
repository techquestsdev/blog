<script>
  import { formatDate } from '$lib/js/utils.js';

  export let data;
</script>

<main>
  <a href="/videos" class="back">
    <span class="arrow">&lt;</span>Back to videos
  </a>

  <h1><iconify-icon icon={data.video.icon}></iconify-icon>{data.video.name}</h1>

  <p class="meta">
    <span class="author">Andre Nogueira</span>
    <span class="divider">·</span>
    <time datetime={data.video.date}>{formatDate(data.video.date)}</time>
  </p>

  <p class="description">{data.video.description}</p>

  <div class="player">
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${data.video.youtubeId}`}
      title={data.video.name}
      frameborder="0"
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    ></iframe>
  </div>

  <article class="content">
    <svelte:component this={data.Content} />
  </article>
</main>

<style lang="scss">
  main {
    @include page-container;
    padding-top: 0;
  }

  h1 {
    margin: 0;
    line-height: 1.3;
  }

  h1 :global(iconify-icon) {
    vertical-align: -0.1em;
    margin-right: 0.1ch;
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

  .description {
    font-size: $font-base;
    margin: $spacing-md 0 $spacing-2xl 0;
    font-style: italic;
    color: var(--txt-2);
  }

  .player {
    aspect-ratio: 16 / 9;
    margin: 0 0 $spacing-xl 0;
    background: var(--bg-2);
    border-radius: 6px;
    overflow: hidden;

    iframe {
      width: 100%;
      height: 100%;
      border: 0;
      display: block;
    }
  }

  .content {
    line-height: 1.7;
  }
</style>
