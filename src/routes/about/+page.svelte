<script>
  import { pad } from '$lib/js/site.js';
  import { theme } from '$lib/js/theme';

  const count = (g) => Object.keys(g).length;
  const questsCount = count(import.meta.glob('/src/content/blog/*/*.md'));
  const artifactsCount = count(import.meta.glob('/src/content/projects/*/*.md'));
  const episodesCount = count(import.meta.glob('/src/content/videos/*/*.md'));

  // One CV link that matches the active theme (dark CV for dark mode, light for light).
  $: cvUrl =
    $theme === 'dark'
      ? 'https://github.com/aanogueira/cv/releases/download/latest/cv-dark.pdf'
      : 'https://github.com/aanogueira/cv/releases/download/latest/cv.pdf';
</script>

<section class="block" style="--blk:var(--tq-ink);color:var(--tq-bg)">
  <div style="--block-ink:var(--tq-bg)">
    <section class="g ph">
      <div class="side">
        <span class="lab" style="color:inherit">04 · The player</span>
        <span class="lab" style="color:inherit">Portugal</span>
      </div>
      <h1 class="mega c-r">André Nogueira</h1>
      <p class="lede">
        Platform engineer who likes building things, then explaining how they work. TechQuests is
        where those side missions get logged.
      </p>
    </section>
  </div>
</section>

<section class="g sh band" style="padding-top:48px">
  <span class="c-l lab">What's here</span>
  <div class="c-r" style="display:grid;gap:16px">
    <h2 class="big">Things I build, written up.</h2>
    <p class="lede">
      Howdy! I'm André Nogueira – a Portugal-based Site Reliability Engineer who goes by
      <strong>aanogueira</strong> online. <strong>Tech Quests</strong> is where I write about the
      technical work that doesn't fit on a CV: homelab adventures, SRE rabbit-holes, platform
      engineering experiments, the kind of projects that start with
      <em>"what if I just tried..."</em>. Long-form posts, hands-on projects, and the occasional
      video. Best paired with coffee.
    </p>
  </div>
</section>

<section class="g sh band" style="padding-top:48px">
  <span class="c-l lab">How the log works</span>
  <div class="c-r" style="display:grid;gap:16px">
    <h2 class="big">Quests, campaigns, artifacts, episodes.</h2>
    <p class="lede">
      Posts are quests. Series are campaigns with numbered acts. Projects are artifacts, and videos
      are episodes.
    </p>
  </div>
</section>

<div class="g" style="margin:32px auto 48px">
  <div class="c-r stats">
    <div><span class="num">{pad(questsCount, 2)}</span><span class="lab">Quests</span></div>
    <div><span class="num">{pad(artifactsCount, 2)}</span><span class="lab">Artifacts</span></div>
    <div><span class="num">{pad(episodesCount, 2)}</span><span class="lab">Episodes</span></div>
  </div>
</div>

<section class="g sh band heavy" style="margin-bottom:96px">
  <span class="c-l lab">Elsewhere</span>
  <div class="c-r">
    <ul class="links" style="padding:0">
      <li>
        <a href="https://github.com/aanogueira" target="_blank" rel="noopener noreferrer"
          >GitHub <span>↗</span></a
        >
      </li>
      <li>
        <a href="https://linkedin.com/in/aanogueira" target="_blank" rel="noopener noreferrer"
          >LinkedIn <span>↗</span></a
        >
      </li>
      <li>
        <a href="https://buymeacoffee.com/aanogueira" target="_blank" rel="noopener noreferrer"
          >Buy me a coffee <span>↗</span></a
        >
      </li>
      <li><a href="/rss.xml">RSS <span>↗</span></a></li>
      <li>
        <a href="https://github.com/techquestsdev/blog" target="_blank" rel="noopener noreferrer"
          >Blog source <span>↗</span></a
        >
      </li>
      <li><a href={cvUrl} target="_blank" rel="noopener noreferrer">CV <span>↓</span></a></li>
    </ul>
  </div>
</section>
