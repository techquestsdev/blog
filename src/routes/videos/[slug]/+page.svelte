<script>
  import { fmtDate } from '$lib/js/site.js';

  export let data;

  const { name, description, date, youtubeId } = data.video;
</script>

<div class="g"><a class="back c-full" href="/videos">← 03 Episodes</a></div>

<section class="g post-head band heavy">
  <span class="c-l lab" style="align-self:start;padding-top:16px"
    >Episode · <time datetime={date}>{fmtDate(date)}</time></span
  >
  <h1>{name}</h1>
  <p class="lede c-r">{description}</p>
</section>

<div class="g">
  <div class="player">
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
      title={name}
      frameborder="0"
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    ></iframe>
  </div>
</div>

<div class="g">
  <article class="prose" style="margin-bottom:64px">
    <svelte:component this={data.Content} />
  </article>
</div>

<style>
  .player iframe {
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
  }
</style>
