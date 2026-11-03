<script>
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import { onDestroy, onMount, tick } from 'svelte';
  import { CAMPAIGNS, pad, fmtDate, decoratePosts, campaignLabel } from '$lib/js/site.js';

  export let data;

  let content;
  let metadata;
  let slug;
  let posts;
  let p;
  let lede;
  let postDate;
  let siblings;
  let postIndex;
  let prev;
  let next;
  let prose;
  let toc;
  let tocObserver;
  let anchorTimer;

  $: content = data.post.default;
  $: metadata = data.post.metadata;
  $: slug = $page.params.slug;
  $: posts = decoratePosts(data.posts || []);
  $: p = posts.find((post) => post.slug === slug) || {
    slug,
    n: '—',
    title: metadata.name,
    desc: metadata.description,
    date: metadata.date,
    campaign: null,
    act: null
  };
  $: lede =
    p.title === (p.desc || metadata.description) ? metadata.name : p.desc || metadata.description;
  $: postDate = p.date || metadata.date;
  $: siblings = p.campaign
    ? posts.filter((post) => post.campaign === p.campaign).sort((a, b) => a.act - b.act)
    : [];
  $: postIndex = siblings.findIndex((post) => post.slug === p.slug);
  $: prev = postIndex > 0 ? siblings[postIndex - 1] : null;
  $: next = postIndex >= 0 ? siblings[postIndex + 1] : null;

  function indexHeadings() {
    if (!prose || !toc) return;

    tocObserver?.disconnect();
    let section = 0;
    let subsection = 0;
    const items = [];
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const used = new Set();

    prose.querySelectorAll('h2, h3').forEach((heading) => {
      heading.querySelectorAll('.s, .anc').forEach((node) => node.remove());
      if (heading.tagName === 'H2') {
        section += 1;
        subsection = 0;
      } else {
        if (!section) return;
        subsection += 1;
      }

      const number = subsection ? `${section}.${subsection}` : `${section}`;
      const text = heading.textContent.trim();
      let id = heading.id;

      if (!id) {
        id =
          text
            .toLowerCase()
            .normalize('NFKD')
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/[\s_]+/g, '-') || `s${number}`;
        while (used.has(id)) id += `-${number.replace('.', '-')}`;
        heading.id = id;
      }
      used.add(id);

      const numberLabel = document.createElement('span');
      numberLabel.className = 's';
      numberLabel.textContent = number;
      heading.prepend(numberLabel);

      const anchor = document.createElement('button');
      anchor.type = 'button';
      anchor.className = 'anc';
      anchor.dataset.anchor = id;
      anchor.textContent = '#';
      anchor.setAttribute('aria-label', `Copy link to section ${number}`);
      heading.append(anchor);

      items.push({ id, number, text, sub: !!subsection });
    });

    let label = toc.querySelector('.lab');
    if (!label) {
      label = document.createElement('span');
      label.className = 'lab';
      label.style.paddingBottom = '8px';
      label.textContent = 'Contents';
    }
    toc.replaceChildren(label);

    items.forEach((item) => {
      const link = document.createElement('a');
      link.href = `#${item.id}`;
      if (item.sub) link.classList.add('sub');

      const number = document.createElement('span');
      number.className = 'tn';
      number.textContent = item.number;
      link.append(number, document.createTextNode(item.text));
      toc.append(link);
    });

    toc.style.display = items.length ? '' : 'none';
  }

  function watchToc() {
    tocObserver?.disconnect();
    if (!toc || !prose || typeof IntersectionObserver === 'undefined') return;

    const links = [...toc.querySelectorAll('a')];
    if (!links.length) return;

    tocObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => {
            link.classList.toggle('on', link.getAttribute('href') === `#${entry.target.id}`);
          });
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    prose.querySelectorAll('h2[id], h3[id]').forEach((heading) => tocObserver.observe(heading));
  }

  async function refreshIndex() {
    await tick();
    if (!prose || !toc) return;
    indexHeadings();
    watchToc();
  }

  function handleArticleClick(event) {
    const target = event.target;
    const anchor = target instanceof Element ? target.closest('[data-anchor]') : null;
    if (!anchor || !prose?.contains(anchor)) return;

    const id = anchor.dataset.anchor;
    const heading = document.getElementById(id);
    if (!id || !heading) return;

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(`https://techquests.dev/blog/${slug}#${id}`).catch(() => {});
    }
    heading.scrollIntoView({ behavior: 'smooth' });

    prose.querySelectorAll('.anc.ok').forEach((button) => button.classList.remove('ok'));
    clearTimeout(anchorTimer);
    anchor.classList.add('ok');
    anchorTimer = setTimeout(() => anchor.classList.remove('ok'), 1600);
  }

  onMount(() => {
    prose.addEventListener('click', handleArticleClick);
    refreshIndex();

    return () => prose.removeEventListener('click', handleArticleClick);
  });

  afterNavigate(() => {
    refreshIndex();
  });

  onDestroy(() => {
    tocObserver?.disconnect();
    clearTimeout(anchorTimer);
  });
</script>

<div>
  <div class="g"><a class="back c-full" href="/blog">← 01 Quests</a></div>
  <section class="g post-head band heavy">
    <span class="num">{pad(p.n)}</span>
    <h1>{p.title}</h1>
    <p class="lede c-r">{lede}</p>
  </section>
  <div class="g article band">
    <aside>
      <dl class="facts">
        <div>
          <dt class="lab">Quest</dt>
          <dd>{pad(p.n)}</dd>
        </div>
        <div>
          <dt class="lab">Campaign</dt>
          <dd>
            {#if p.campaign && CAMPAIGNS[p.campaign]}
              <span
                class="sw"
                style={`background:${CAMPAIGNS[p.campaign].color}`}
                aria-hidden="true"
              ></span>{campaignLabel(p)}
            {:else}
              {campaignLabel(p)}
            {/if}
          </dd>
        </div>
        <div>
          <dt class="lab">Logged</dt>
          <dd><time datetime={postDate}>{fmtDate(postDate)}</time></dd>
        </div>
        <div>
          <dt class="lab">Read</dt>
          <dd>{data.journey ?? '—'}</dd>
        </div>
      </dl>
      <nav class="toc" aria-label="On this page" bind:this={toc} style="display:none">
        <span class="lab" style="padding-bottom:8px">Contents</span>
      </nav>
    </aside>
    <article class="prose" bind:this={prose}>
      <svelte:component this={content} />
    </article>
  </div>
  {#if p.campaign}
    <nav class="pager" aria-label="Campaign navigation">
      {#if prev}
        <a href={`/blog/${prev.slug}`}>
          <span class="lab">← Act {pad(prev.act, 2)}</span>
          <span class="big mono">{prev.title}</span>
        </a>
      {:else}
        <div class="end"><span class="lab">Start of campaign</span></div>
      {/if}
      {#if next}
        <a href={`/blog/${next.slug}`}>
          <span class="lab">Act {pad(next.act, 2)} →</span>
          <span class="big mono">{next.title}</span>
        </a>
      {:else}
        <div class="end">
          <span class="lab"
            >{CAMPAIGNS[p.campaign]?.status === 'active'
              ? 'Next act in progress'
              : 'Campaign complete'}</span
          >
        </div>
      {/if}
    </nav>
  {/if}
</div>
