<script>
  import {
    CAMPAIGNS,
    STATUS,
    pad,
    fmtDate,
    year,
    decoratePosts,
    campaignLabel,
    CATS,
    LIFE,
    decorateProject
  } from '$lib/js/site.js';

  export let data;

  $: posts = decoratePosts(data.posts);
  $: latest = posts.slice(0, 5);
  $: featured =
    posts.find((p) => p.campaign && CAMPAIGNS[p.campaign].status === 'active') ??
    posts.find((p) => p.campaign);
  $: camp = featured ? CAMPAIGNS[featured.campaign] : null;
  $: isActive = camp?.status === 'active';
  $: projects = data.projects.map(decorateProject);
</script>

<section class="g hero">
  <h1 class="mega">Every post is a quest<em>.</em></h1>
  <p class="lede">
    Notes from a platform engineer building things: homelabs, terminal tools and side projects,
    logged one mission at a time.
  </p>
  <div class="meta">
    <span class="lab">Field journal</span><span class="lab"><b>André Nogueira</b></span><span
      class="lab">Vol. {new Date().getFullYear()}</span
    >
  </div>
</section>

{#if camp}
  <section class="block" style="--blk:{camp.color}">
    <a class="g block-row" href="/blog/{featured.slug}" style="width:100%">
      <span class="c-l" style="display:grid;gap:8px"
        ><span class="lab">{isActive ? 'Current campaign' : 'Latest campaign'}</span><span
          class="st-w {camp.status}"><span class="gl"></span>{STATUS[camp.status]}</span
        ><span class="num">{pad(featured.act, 2)}</span></span
      >
      <span class="c-r" style="display:grid;gap:16px"
        ><span class="lab"
          >{camp.name} · Act {featured.act} of {featured.act}{isActive ? '+' : ' · Final act'}</span
        ><span class="big mono">{featured.title}</span><span class="cta"
          >{isActive ? 'Continue the campaign →' : 'Read the final act →'}</span
        ></span
      >
    </a>
  </section>
{/if}

<section class="g sh band heavy">
  <span class="c-l lab">01 · Quest log</span>
  <h2 class="huge" style="grid-column:4/12">Latest</h2>
  <a class="more" href="/blog">All quests</a>
</section>
<ul class="idx">
  <li style="border-top:0">
    <div class="g thead lab" aria-hidden="true">
      <span style="grid-column:1/2">No.</span><span style="grid-column:2/4">Campaign</span><span
        style="grid-column:4/10">Quest</span
      ><span style="grid-column:10/13;justify-self:end">Logged</span>
    </div>
  </li>
  {#each latest as p (p.slug)}
    <li>
      <a class="g" href="/blog/{p.slug}">
        <span class="n">{pad(p.n)}</span><span class="camp lab"
          >{#if p.campaign}<span
              class="sw"
              style="background:{CAMPAIGNS[p.campaign].color}"
              aria-hidden="true"
            ></span>{/if}{campaignLabel(p)}</span
        >
        <span class="t"
          >{p.title}{#if p.desc}<span class="d">{p.desc}</span>{/if}</span
        >
        <span class="date lab">{fmtDate(p.date)}</span>
      </a>
    </li>
  {/each}
</ul>

<section class="g sh band heavy" style="margin-top:64px">
  <span class="c-l lab">02 · Built</span>
  <h2 class="huge" style="grid-column:4/12">Artifacts</h2>
  <a class="more" href="/projects">All artifacts</a>
</section>
<ul class="idx art">
  {#each projects.slice(0, 3) as p (p.slug)}
    <li>
      <a class="g" href="/projects/{p.slug}">
        <span class="name">{p.name}</span><span class="desc">{p.description}</span>
        <span class="c-type"
          ><span class="lab" style="display:inline-flex;align-items:center"
            ><span class="sw" style="background:var(--tq-cat-{p.cat})" aria-hidden="true"
            ></span>{CATS[p.cat]}</span
          ></span
        ><span class="c-year lab">{year(p.date)}</span><span class="c-life"
          ><span class="life {p.life}"><i aria-hidden="true"></i>{LIFE[p.life]}</span></span
        >
      </a>
    </li>
  {/each}
</ul>

<section class="g sh band heavy" style="margin-top:64px">
  <span class="c-l lab">03 · Recorded</span>
  <h2 class="huge" style="grid-column:4/12">Episodes</h2>
  <a class="more" href="/videos">All episodes</a>
</section>
<ul class="idx ep" style="margin-bottom:96px">
  {#each data.videos as video, i (video.slug)}
    {@const n = data.videos.length - i}
    <li>
      <a class="g" href="/videos/{video.slug}">
        <span class="thumb" aria-hidden="true"
          ><span class="th-top"
            ><span class="lab">Episode {pad(n, 2)}</span><svg
              class="mk"
              style="width:56px;color:#e0def4;--a1:#eb6f92;--a2:#f6c177"><use href="#m" /></svg
            ></span
          ><span class="th-t">{video.name}</span><span class="epn">{pad(n, 2)}</span></span
        >
        <span class="body"
          ><span class="lab">Episode {pad(n, 2)} · {fmtDate(video.date)}</span><span
            class="big mono">{video.name}</span
          ><span style="color:var(--tq-ink-2)">{video.description}</span></span
        >
      </a>
    </li>
  {/each}
</ul>
