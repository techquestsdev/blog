<!-- <script>
  let content = {
    languages: {
      Web: ['JavaScript', 'TypeScript', 'PHP', 'HTML', 'CSS'],
      Code: ['Go', 'Python', 'C', 'Rust'],
      Script: ['Shell', 'Lua', 'Ruby']
    },
    tech: {
      Frameworks: ['React', 'NextJS', 'SvelteKit'],
      Languages: ['Go', 'Rust', 'TypeScript', 'Python'],
      Databases: ['PostgreSQL', 'Sqlite', 'MongoDB', 'Redis'],
      Cloud: ['GCP', 'AWS', 'Azure'],
      Tools: ['macOS', 'Pop!_OS', 'Ghostty', 'tmux', 'neovim', 'yadm']
    }
  };
</script> -->

<main>
  <h1>About</h1>
  <p>
    Howdy! I'm a SRE living in Portugal who goes by the name aanogueira online. I'm interested in
    tech... that's about it.
  </p>
  <h2>Links</h2>
  <ul class="link-list">
    <li>
      <a
        href="https://github.com/aanogueira"
        class="external"
        target="_blank"
        rel="noopener noreferrer"
        >Github profile<span class="arrow">-></span>
      </a>
    </li>
    <li>
      <a
        href="https://linkedin.com/in/andre-a-nogueira"
        class="external"
        target="_blank"
        rel="noopener noreferrer"
        >Linkedin profile<span class="arrow">-></span>
      </a>
    </li>
    <li>
      <a
        href="https://medium.com/@aanogueira"
        class="external"
        target="_blank"
        rel="noopener noreferrer"
        >Medium profile<span class="arrow">-></span>
      </a>
    </li>
    <li>
      <a href="https://dev.to/aanogueira" class="external" target="_blank" rel="noopener noreferrer"
        >Dev.to profile<span class="arrow">-></span>
      </a>
    </li>
    <li>
      <a
        href="https://buymeacoffee.com/aanogueira"
        class="external"
        target="_blank"
        rel="noopener noreferrer"
        >Buy me a coffee<span class="arrow">-></span>
      </a>
    </li>
  </ul>

  <h2>RSS Feeds</h2>
  <ul class="link-list">
    <li>
      <a href="/rss.xml" class="external" target="_blank" rel="noopener noreferrer"
        >All content feed<span class="arrow">-></span></a
      >
    </li>
    <li>
      <a href="/blog/rss.xml" class="external" target="_blank" rel="noopener noreferrer"
        >Blog posts only<span class="arrow">-></span></a
      >
    </li>
    <li>
      <a href="/projects/rss.xml" class="external" target="_blank" rel="noopener noreferrer"
        >Projects only<span class="arrow">-></span></a
      >
    </li>
  </ul>
  <!-- <a href="/resume.pdf" class="external">Resume<span class="arrow">-></span></a> -->
  <!-- <h2>Languages</h2>
  {#each Object.keys(content.languages) as category (category)}
    <div class="info">
      <span class="main">{category}</span> <span class="sub">-></span>
      {#each content.languages[category] as item (item)}
        {item}
        {#if item !== content.languages[category][content.languages[category].length - 1]}
          <span class="sub">/</span>&nbsp;
        {/if}
      {/each}
    </div>
  {/each}
  <h2>Tech</h2>
  {#each Object.keys(content.tech) as category (category)}
    <div class="info">
      <span class="main">{category}</span> <span class="sub">-></span>
      {#each content.tech[category] as item (item)}
        {item}
        {#if item !== content.tech[category][content.tech[category].length - 1]}
          <span class="sub">/</span>&nbsp;
        {/if}
      {/each}
    </div>
  {/each} -->
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
    Fira <span class="sub">/</span>
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
    font-family: 'Fira Mono', monospace;
    font-size: $font-sm;
    margin: $spacing-sm 0;
    display: block;
  }

  .info {
    font-size: $font-sm;
    margin: $spacing-sm 0;
    font-family: 'Fira Mono', monospace;

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
</style>
