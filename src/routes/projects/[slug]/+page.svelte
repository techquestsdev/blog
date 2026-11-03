<script>
  import { onMount, tick } from 'svelte';
  import { page } from '$app/stores';
  import { CATS, LIFE, decorateProject, year } from '$lib/js/site.js';

  export let data;

  let { default: content, metadata } = data.post;
  let p = decorateProject({ slug: $page.params.slug, ...metadata });
  let prose;
  let headings = [];

  onMount(() => {
    let observer;
    const existingIds = new Set(
      [...prose.querySelectorAll('h2[id], h3[id]')].map((heading) => heading.id)
    );
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const usedIds = new Set();
    let section = 0;
    let subsection = 0;
    const items = [];

    prose.querySelectorAll('h2, h3').forEach((heading) => {
      heading.querySelectorAll('.s, .anc').forEach((element) => element.remove());
      const sub = heading.tagName === 'H3';
      if (!sub) {
        section += 1;
        subsection = 0;
      } else {
        if (!section) return;
        subsection += 1;
      }

      const number = sub ? `${section}.${subsection}` : `${section}`;
      const text = heading.textContent.trim();
      let id = heading.id;
      if (!id) {
        const base =
          text
            .toLowerCase()
            .normalize('NFKD')
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/[\s_]+/g, '-') || `s${number}`;
        id = base;
        let suffix = 2;
        while (usedIds.has(id) || existingIds.has(id)) id = `${base}-${suffix++}`;
        heading.id = id;
      }
      usedIds.add(id);

      const numberElement = document.createElement('span');
      numberElement.className = 's';
      numberElement.textContent = number;
      heading.prepend(numberElement);
      items.push({ id, number, text, sub });
    });

    headings = items;
    tick().then(() => {
      if (!items.length) return;
      const links = [...prose.parentElement.querySelectorAll('.toc a')];
      observer = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            links.forEach((link) =>
              link.classList.toggle('on', link.getAttribute('href') === `#${entry.target.id}`)
            );
          }),
        { rootMargin: '-20% 0px -70% 0px' }
      );
      prose.querySelectorAll('h2[id], h3[id]').forEach((heading) => observer.observe(heading));
    });

    return () => observer?.disconnect();
  });
</script>

<div class="g">
  <a class="back c-full" href="/projects">← 02 Artifacts</a>
</div>
<section class="g post-head band heavy">
  <span class="c-l lab" style="align-self:start;padding-top:16px">Artifact</span>
  <h1 style="font-size:var(--mega);overflow-wrap:anywhere">{p.name}</h1>
  <p class="lede c-r">{p.description}</p>
</section>
<div class="g article band">
  <aside>
    <dl class="facts">
      <div>
        <dt class="lab">Year</dt>
        <dd>{year(p.date)}</dd>
      </div>
      <div>
        <dt class="lab">Type</dt>
        <dd>
          <span class="lab" style="display:inline-flex;align-items:center">
            <span class="sw" style={`background:var(--tq-cat-${p.cat})`} aria-hidden="true"></span>
            {CATS[p.cat]}
          </span>
        </dd>
      </div>
      {#if p.stack}
        <div>
          <dt class="lab">Stack</dt>
          <dd>{p.stack}</dd>
        </div>
      {/if}
      <div>
        <dt class="lab">Status</dt>
        <dd><span class={`life ${p.life}`}><i aria-hidden="true"></i>{LIFE[p.life]}</span></dd>
      </div>
      {#if p.github}
        <div>
          <dt class="lab">Source</dt>
          <dd>
            <a href={p.github} target="_blank" rel="noopener noreferrer">
              {p.github.replace('https://github.com/', '')}
            </a>
          </dd>
        </div>
      {/if}
      {#if p.website}
        <div>
          <dt class="lab">Live</dt>
          <dd>
            <a href={p.website} target="_blank" rel="noopener noreferrer">
              {p.website.replace('https://', '')}
            </a>
          </dd>
        </div>
      {/if}
    </dl>
    <nav class="toc" aria-label="On this page" hidden={!headings.length}>
      <span class="lab" style="padding-bottom:8px">Contents</span>
      {#each headings as heading (heading.id)}
        <a href={`#${heading.id}`} class:sub={heading.sub}>
          <span class="tn">{heading.number}</span>{heading.text}
        </a>
      {/each}
    </nav>
  </aside>
  <div class="prose" bind:this={prose}>
    <svelte:component this={content} />
    {#if p.website || p.github}
      <p class="see lab">
        See it in action:
        {#if p.website}<a href={p.website} target="_blank" rel="noopener noreferrer">live ↗</a>{/if}
        {#if p.website && p.github}
          ·
        {/if}
        {#if p.github}<a href={p.github} target="_blank" rel="noopener noreferrer"
            >code on GitHub ↗</a
          >{/if}
      </p>
    {/if}
    <div class="byline lab">
      <svg class="mk" aria-hidden="true"><use href="#m" /></svg>A TechQuests project
    </div>
  </div>
</div>
