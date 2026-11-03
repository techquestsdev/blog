<script>
  import { CATS, LIFE, decorateProject, pad, year } from '$lib/js/site.js';

  export let data;

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'stable', label: 'Stable' },
    { value: 'archived', label: 'Archived' }
  ];

  let filter = 'all';
  let current = null;
  $: projects = data.posts.map(decorateProject);
  $: filteredProjects = projects.filter((project) => filter === 'all' || project.life === filter);

  function showPreview(project) {
    if (window.matchMedia('(min-width: 1025px)').matches) current = project;
  }
</script>

<section class="block" style="--blk:var(--rp-gold)">
  <section class="g ph">
    <div class="side">
      <span class="lab">02 · Built</span>
      <span class="lab">{projects.length} artifacts</span>
      <a class="lab" href="/projects/rss.xml">RSS ↗</a>
    </div>
    <h1 class="mega c-r">Artifacts</h1>
    <p class="lede">
      Things built along the way, published under the TechQuests org. Each keeps its own identity.
    </p>
  </section>
</section>

<section class="g sh">
  <span class="c-l lab">Show</span>
  <div class="c-r txf" role="group" aria-label="Filter by status">
    {#each filters as option, index (option.value)}
      {#if index > 0}<span aria-hidden="true">·</span>{/if}
      <button
        type="button"
        class="tx"
        class:on={filter === option.value}
        aria-pressed={filter === option.value}
        on:click={() => (filter = option.value)}>{option.label}</button
      >
    {/each}
  </div>
</section>

{#if filteredProjects.length}
  <div class="g names-wrap">
    <ol class="names c-full">
      {#each filteredProjects as project (project.slug)}
        <li>
          <a
            class="nm"
            href={'/projects/' + project.slug}
            on:mouseenter={() => showPreview(project)}
            on:focus={() => showPreview(project)}
          >
            <span class="nnum lab">{pad(projects.indexOf(project) + 1, 2)}</span>
            <span class="nn">{project.name}</span>
            <span class="nmeta">
              <span class="lab" style="display:inline-flex;align-items:center"
                ><span
                  class="sw"
                  style={'background:var(--tq-cat-' + project.cat + ')'}
                  aria-hidden="true"
                ></span>{CATS[project.cat]}</span
              >
              <span class="lab">{year(project.date)}</span>
              <span class={'life ' + project.life}
                ><i aria-hidden="true"></i>{LIFE[project.life]}</span
              >
            </span>
          </a>
        </li>
      {/each}
    </ol>

    <aside class="pv" class:on={!!current} aria-label="Project preview">
      <div class="pv-in">
        {#if current}
          <span class="lab"
            >{pad(projects.indexOf(current) + 1, 2)} / {pad(projects.length, 2)}</span
          >
          <p class="pv-d">{current.description}</p>
          <dl class="pv-facts">
            <div>
              <dt class="lab">Type</dt>
              <dd>
                <span class="lab" style="display:inline-flex;align-items:center"
                  ><span
                    class="sw"
                    style={'background:var(--tq-cat-' + current.cat + ')'}
                    aria-hidden="true"
                  ></span>{CATS[current.cat]}</span
                >
              </dd>
            </div>
            {#if current.stack}
              <div>
                <dt class="lab">Stack</dt>
                <dd>{current.stack}</dd>
              </div>
            {/if}
            <div>
              <dt class="lab">Year</dt>
              <dd>{year(current.date)}</dd>
            </div>
            <div>
              <dt class="lab">Status</dt>
              <dd>
                <span class={'life ' + current.life}
                  ><i aria-hidden="true"></i>{LIFE[current.life]}</span
                >
              </dd>
            </div>
            {#if current.website}
              <div>
                <dt class="lab">Live</dt>
                <dd><a href={current.website}>{current.website.replace('https://', '')} ↗</a></dd>
              </div>
            {/if}
            {#if current.github}
              <div>
                <dt class="lab">Source</dt>
                <dd>
                  <a href={current.github}>{current.github.replace('https://github.com/', '')} ↗</a>
                </dd>
              </div>
            {/if}
          </dl>
          <span class="lab">Click the name to open the write-up →</span>
        {/if}
      </div>
    </aside>
  </div>
{:else}
  <div class="g">
    <p class="c-r empty">
      No artifacts with this status.
      <button class="more" type="button" on:click={() => (filter = 'all')}>Show all</button>
    </p>
  </div>
{/if}
