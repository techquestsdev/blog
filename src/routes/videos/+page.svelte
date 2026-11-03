<script>
  import { fmtDate, pad } from '$lib/js/site.js';

  export let data;
</script>

<section class="block" style="--blk:var(--rp-foam)">
  <section class="g ph">
    <div class="side">
      <span class="lab">03 · Recorded</span>
      <span class="lab">{data.videos.length} released</span>
      <a class="lab" href="/videos/rss.xml">RSS ↗</a>
    </div>
    <h1 class="mega c-r">Episodes</h1>
    <p class="lede c-r">The video side of the quests. Walkthroughs and builds, recorded.</p>
  </section>
</section>

<ul class="idx ep" style="margin-top:48px">
  {#each data.videos as video, i (video.slug)}
    <li>
      <a class="g" href={`/videos/${video.slug}`}>
        <span class="thumb" aria-hidden="true">
          <span class="th-top">
            <span class="lab">Episode {pad(data.videos.length - i, 2)}</span>
            <svg class="mk" style="width:56px;color:#e0def4;--a1:#eb6f92;--a2:#f6c177">
              <use href="#m" />
            </svg>
          </span>
          <span class="th-t">{video.name}</span>
          <span class="epn">{pad(data.videos.length - i, 2)}</span>
        </span>
        <span class="body">
          <span class="lab">Episode {pad(data.videos.length - i, 2)} · {fmtDate(video.date)}</span>
          <span class="big mono">{video.name}</span>
          <span style="color:var(--tq-ink-2)">{video.description}</span>
        </span>
      </a>
    </li>
  {/each}
</ul>

<div class="g">
  <p class="c-r empty" style="margin-bottom:64px">More episodes are on the way.</p>
</div>
