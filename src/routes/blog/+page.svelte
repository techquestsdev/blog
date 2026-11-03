<script>
  import { CAMPAIGNS, STATUS, pad, fmtDate, decoratePosts, campaignLabel } from '$lib/js/site.js';

  export let data;

  let filter = 'all';
  let posts = [];
  let campaignBlocks = [];
  let visiblePosts = [];

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'homelab', label: 'Homelab' },
    { value: 'tictactoe', label: 'Tic-Tac-Toe' },
    { value: 'side', label: 'Side quests' }
  ];

  $: posts = decoratePosts(data.posts);
  $: campaignBlocks = Object.entries(CAMPAIGNS).map(([key, campaign]) => ({
    key,
    ...campaign,
    acts: posts.filter((post) => post.campaign === key).sort((a, b) => a.act - b.act)
  }));
  $: visiblePosts = posts.filter(
    (post) => filter === 'all' || (filter === 'side' ? !post.campaign : post.campaign === filter)
  );
</script>

<section class="g ph">
  <div class="side">
    <span class="lab">01 · Quest log</span>
    <span class="lab">{posts.length} entries</span>
    <a class="lab" href="/blog/rss.xml">RSS ↗</a>
  </div>
  <h1 class="mega c-r">Quests</h1>
  <p class="lede">
    Long-form write-ups. Series are campaigns, each with its own colour; each chapter is an act.
  </p>
</section>

{#each campaignBlocks as campaign (campaign.key)}
  <div class="camp-block" style={`--cc:${campaign.color}`}>
    <div class="g camp-row">
      <div class="c-l" style="display:grid;gap:8px">
        <span class="lab">Campaign · {campaign.acts.length} acts</span>
        <h2 class="big">{campaign.name}</h2>
        <span class={`st-w ${campaign.status}`}
          ><span class="gl"></span>{STATUS[campaign.status]}</span
        >
        <span class="blurb">{campaign.blurb}</span>
      </div>
      <div class="acts">
        {#each campaign.acts as act (act.slug)}
          <a href={`/blog/${act.slug}`} aria-label={`Act ${act.act}: ${act.title}`}>
            <span class="a">{pad(act.act, 2)}</span>
            <span class="lab">Act</span>
          </a>
        {/each}
        {#if campaign.status === 'active'}
          <span class="todo"><span class="lab">Next</span><span class="lab">In progress</span></span
          >
        {/if}
      </div>
    </div>
  </div>
{/each}

<div class="g side-row band heavy">
  <div class="c-l" style="display:grid;gap:8px">
    <span class="lab">Standalone</span>
    <h2 class="big">Side quests</h2>
  </div>
  <p class="c-r lede" style="align-self:end">
    One-off entries outside any campaign, like the Prologue. No colour.
  </p>
</div>

<section class="g sh band heavy" style="margin-top:48px">
  <span class="c-l lab">Index</span>
  <div class="c-r" style="display:grid;gap:24px">
    <h2 class="huge">All entries</h2>
    <div class="filters" role="group" aria-label="Filter quests">
      {#each filters as option (option.value)}
        <button
          type="button"
          class="chip"
          aria-pressed={filter === option.value}
          on:click={() => (filter = option.value)}>{option.label}</button
        >
      {/each}
    </div>
  </div>
</section>

{#if visiblePosts.length}
  <ul class="idx" style="margin-bottom:96px">
    <li style="border-top:0">
      <div class="g thead lab" aria-hidden="true">
        <span style="grid-column:1/2">No.</span>
        <span style="grid-column:2/4">Campaign</span>
        <span style="grid-column:4/10">Quest</span>
        <span style="grid-column:10/13;justify-self:end">Logged</span>
      </div>
    </li>
    {#each visiblePosts as post (post.slug)}
      <li>
        <a class="g" href={`/blog/${post.slug}`}>
          <span class="n">{pad(post.n)}</span>
          <span class="camp lab">
            {#if post.campaign}
              <span
                class="sw"
                style={`background:${CAMPAIGNS[post.campaign].color}`}
                aria-hidden="true"
              ></span>{campaignLabel(post)}
            {:else}
              {campaignLabel(post)}
            {/if}
          </span>
          <span class="t">
            {post.title}{#if post.desc}<span class="d">{post.desc}</span>{/if}
          </span>
          <span class="date lab">{fmtDate(post.date)}</span>
        </a>
      </li>
    {/each}
  </ul>
{:else}
  <div class="g">
    <p class="c-r empty">
      No quests in this filter yet.
      <button class="more" type="button" on:click={() => (filter = 'all')}>Show all</button>
    </p>
  </div>
{/if}
