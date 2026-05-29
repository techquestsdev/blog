<script>
  import { formatDate } from '$lib/js/utils.js';
  import RssIcon from '~icons/ph/rss';

  export let data;

  function thumbnail(id) {
    return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  }
</script>

<main>
  <div class="title-row">
    <h1>Videos <span class="count">[{data.videos.length}]</span></h1>
    <a
      href="/videos/rss.xml"
      class="rss-link"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Videos RSS feed"
    >
      <RssIcon /> RSS
    </a>
  </div>

  <div class="videos">
    {#each data.videos as video (video.slug)}
      <a href={`/videos/${video.slug}`} class="card">
        <div class="thumb">
          <img src={thumbnail(video.youtubeId)} alt="" loading="lazy" />
        </div>
        <div class="meta">
          <h2>{video.name}</h2>
          <div class="date">{formatDate(video.date)}</div>
          <p class="description">{video.description}</p>
        </div>
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

  .videos {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-2xl;
  }

  .card {
    display: grid;
    grid-template-columns: 16rem 1fr;
    gap: $spacing-xl;
    text-decoration: none;
    color: inherit;
    border: 1px solid var(--bg-3);
    border-radius: 6px;
    padding: $spacing-base;
    transition: border-color $transition-base;

    &:hover {
      border-color: var(--txt-3);
    }

    @media (max-width: $breakpoint-mobile) {
      grid-template-columns: 1fr;
    }
  }

  .thumb {
    position: relative;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border-radius: 4px;
    background: var(--bg-2);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  h2 {
    margin: 0 0 $spacing-xs 0;
    font-size: $font-md;
  }

  .date {
    font-family: $font-family-mono;
    font-size: $font-xs;
    color: var(--txt-3);
    margin-bottom: $spacing-sm;
  }

  .description {
    margin: 0;
    color: var(--txt);
  }
</style>
