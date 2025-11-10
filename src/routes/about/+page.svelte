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
  <a href="https://github.com/aanogueira" class="external" target="_blank" rel="noopener noreferrer"
    >Github profile<span class="arrow">-></span>
  </a>
  <a
    href="https://linkedin.com/in/andre-a-nogueira"
    class="external"
    target="_blank"
    rel="noopener noreferrer"
    >Linkedin profile<span class="arrow">-></span>
  </a>
  <a
    href="https://medium.com/@aanogueira"
    class="external"
    target="_blank"
    rel="noopener noreferrer"
    >Medium profile<span class="arrow">-></span>
  </a>
  <a href="https://dev.to/aanogueira" class="external" target="_blank" rel="noopener noreferrer"
    >Dev.to profile<span class="arrow">-></span>
  </a>
  <a
    href="https://buymeacoffee.com/aanogueira"
    class="external"
    target="_blank"
    rel="noopener noreferrer"
    >Buy me a coffee<span class="arrow">-></span>
  </a>

  <h2>RSS Feeds</h2>
  <a href="/rss.xml" class="external" target="_blank" rel="noopener noreferrer"
    >All content feed<span class="arrow">-></span></a
  >
  <a href="/blog/rss.xml" class="external" target="_blank" rel="noopener noreferrer"
    >Blog posts only<span class="arrow">-></span></a
  >
  <a href="/projects/rss.xml" class="external" target="_blank" rel="noopener noreferrer"
    >Projects only<span class="arrow">-></span></a
  >
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
  <a
    href="https://github.com/techquestsdev/blog"
    class="external"
    target="_blank"
    rel="noopener noreferrer">Github repo<span class="arrow">-></span></a
  >
  <a
    href="https://analytics.techquests.dev/share/XKuVSonQXqJALOvj/Blog"
    class="external"
    target="_blank"
    rel="noopener noreferrer">Analytics<span class="arrow">-></span></a
  >
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
      <div class="color" style="background: var(--bg); border: 2px solid var(--bg-2);">bg</div>
      <div class="color" style="background: var(--bg-2);">bg-2</div>
      <div class="color" style="background: var(--bg-3);">bg-3</div>
      <div class="color" style="background: var(--txt-3); color: var(--bg);">txt-3</div>
      <div class="color" style="background: var(--txt-2); color: var(--bg);">txt-2</div>
      <div class="color" style="background: var(--txt); color: var(--bg);">txt</div>
      <div class="color" style="background: var(--txt-0); color: var(--bg);">txt-0</div>
      <div class="color" style="background: var(--salmon); color: var(--bg);">salmon</div>
      <div class="color" style="background: var(--green); color: var(--bg);">green</div>
      <div class="color" style="background: var(--yellow); color: var(--bg);">yellow</div>
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

  h1 {
    margin-bottom: $spacing-3xl;
  }
</style>
