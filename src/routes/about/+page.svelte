<script>
  import GithubIcon from '~icons/ph/github-logo';
  import LinkedinIcon from '~icons/ph/linkedin-logo';
  import MediumIcon from '~icons/ph/medium-logo';
  import DevToIcon from '~icons/ph/dev-to-logo';
  import CoffeeIcon from '~icons/ph/coffee';
  import RssIcon from '~icons/ph/rss';
</script>

<main>
  <h1>About</h1>
  <p>
    Howdy! I'm <strong>Andre Nogueira</strong> – a Portugal-based Site Reliability Engineer who goes
    by <strong>aanogueira</strong> online. <strong>Tech Quests</strong> is where I write about the
    technical work that doesn't fit on a CV: homelab adventures, SRE rabbit-holes, platform
    engineering experiments, the kind of projects that start with
    <em>"what if I just tried..."</em>.
  </p>
  <p>Long-form posts, hands-on projects, and the occasional video. Best paired with coffee.</p>
  <h2>Links</h2>
  <ul class="link-list">
    <li>
      <a
        href="https://github.com/aanogueira"
        class="external"
        target="_blank"
        rel="noopener noreferrer"
        ><GithubIcon /> Github profile<span class="arrow">-></span>
      </a>
    </li>
    <li>
      <a
        href="https://linkedin.com/in/aanogueira"
        class="external"
        target="_blank"
        rel="noopener noreferrer"
        ><LinkedinIcon /> Linkedin profile<span class="arrow">-></span>
      </a>
    </li>
    <li>
      <a
        href="https://medium.com/@aanogueira"
        class="external"
        target="_blank"
        rel="noopener noreferrer"
        ><MediumIcon /> Medium profile<span class="arrow">-></span>
      </a>
    </li>
    <li>
      <a href="https://dev.to/aanogueira" class="external" target="_blank" rel="noopener noreferrer"
        ><DevToIcon /> Dev.to profile<span class="arrow">-></span>
      </a>
    </li>
    <li>
      <a
        href="https://buymeacoffee.com/aanogueira"
        class="external"
        target="_blank"
        rel="noopener noreferrer"
        ><CoffeeIcon /> Buy me a coffee<span class="arrow">-></span>
      </a>
    </li>
  </ul>

  <h2>RSS Feeds</h2>
  <ul class="link-list">
    <li>
      <a href="/rss.xml" class="external" target="_blank" rel="noopener noreferrer"
        ><RssIcon /> All content feed<span class="arrow">-></span></a
      >
    </li>
  </ul>
  <h2>CV</h2>
  <ul class="link-list">
    <li>
      <a
        href="https://github.com/aanogueira/cv/releases/download/latest/cv.pdf"
        class="external"
        target="_blank"
        rel="noopener noreferrer"
        >Download CV (light)<span class="arrow">-></span>
      </a>
    </li>
    <li>
      <a
        href="https://github.com/aanogueira/cv/releases/download/latest/cv-dark.pdf"
        class="external"
        target="_blank"
        rel="noopener noreferrer"
        >Download CV (dark)<span class="arrow">-></span>
      </a>
    </li>
  </ul>
  <h2>This blog</h2>
  <ul class="link-list">
    <li>
      <a
        href="https://github.com/techquestsdev/blog"
        class="external"
        target="_blank"
        rel="noopener noreferrer">Github repo<span class="arrow">-></span></a
      >
    </li>
    <li>
      <a
        href="https://analytics.techquests.dev/share/XKuVSonQXqJALOvj/Blog"
        class="external"
        target="_blank"
        rel="noopener noreferrer">Analytics<span class="arrow">-></span></a
      >
    </li>
  </ul>
  <div class="info">
    <span class="main">Stack</span> <span class="sub">-></span>
    SvelteKit <span class="sub">/</span>
    Vite <span class="sub">/</span>
    MDsveX <span class="sub">/</span>
    Mermaid
  </div>
  <div class="info">
    <span class="main">Fonts</span> <span class="sub">-></span>
    Inter <span class="sub">/</span>
    Fira Mono
  </div>
  <div class="info">
    <div class="colors">
      <div class="color" style="background: var(--bg); border: 2px solid var(--bg-2);">
        bg<span class="cli-only"> (dark #121416 / light #edebe9)</span>
      </div>
      <div class="color" style="background: var(--bg-2);">
        bg-2<span class="cli-only"> (dark #191b1f / light #e6e4e0)</span>
      </div>
      <div class="color" style="background: var(--bg-3);">
        bg-3<span class="cli-only"> (dark #25272d / light #dad8d2)</span>
      </div>
      <div class="color" style="background: var(--txt-3); color: var(--bg);">
        txt-3<span class="cli-only"> (dark #4f5663 / light #b0a99c)</span>
      </div>
      <div class="color" style="background: var(--txt-2); color: var(--bg);">
        txt-2<span class="cli-only"> (dark #8e95a4 / light #716a5b)</span>
      </div>
      <div class="color" style="background: var(--txt); color: var(--bg);">
        txt<span class="cli-only"> (dark #bdc7db / light #423824)</span>
      </div>
      <div class="color" style="background: var(--txt-0); color: var(--bg);">
        txt-0<span class="cli-only"> (dark #dae2f1 / light #251d0e)</span>
      </div>
      <div class="color" style="background: var(--salmon); color: var(--bg);">
        salmon<span class="cli-only"> (dark #e5afae / light #cc6c6b)</span>
      </div>
      <div class="color" style="background: var(--green); color: var(--bg);">
        green<span class="cli-only"> (dark #8cc5cf / light #45818c)</span>
      </div>
      <div class="color" style="background: var(--yellow); color: var(--bg);">
        yellow<span class="cli-only"> (dark #f2b463 / light #e38b26)</span>
      </div>
    </div>
  </div>
</main>

<style lang="scss">
  main {
    @include page-container;
  }

  a {
    font-family: $font-family-mono;
    font-size: $font-sm;
    margin: $spacing-sm 0;
    display: block;
  }

  .info {
    font-size: $font-sm;
    margin: $spacing-sm 0;
    font-family: $font-family-mono;

    .main {
      font-weight: bold;
      color: var(--txt-2);
    }
  }

  .link-list {
    list-style: none;
    padding: 0;
    margin: 0 0 $spacing-lg 0;

    li {
      margin: $spacing-sm 0;
    }
  }

  .colors {
    display: inline-flex;
    margin-top: $spacing-xxs;
    flex-wrap: wrap;
  }

  .color {
    display: inline-block;
    padding: 0 $spacing-xxs;
    width: $width-color-box;
    text-align: center;
    font-size: 0.9em;
  }

  .cli-only {
    display: none;
  }

  h1 {
    margin-bottom: $spacing-3xl;
  }

  a.external :global(svg) {
    vertical-align: -0.15em;
    margin-right: 0.5ch;
    font-size: 0.95em;
    color: var(--txt);
  }
</style>
