<script>
  import { page } from '$app/stores';
</script>

<main>
  {#if $page.error}
    <h1 class="errorCode">{$page.status}</h1>
    <h2 class="errorMessage">{$page.error.message}</h2>
    <div class="links">
      <a href="/">Home</a>
      <a href="/blog">Blog</a>
      <a href="/projects">Projects</a>
      <a href="/about">About</a>
    </div>
  {/if}
</main>

<style lang="scss">
  main {
    @include flex(column, center, center);

    height: 100%;
    max-height: calc(100vh - $spacing-8xl);
    gap: $spacing-xl;
  }

  .errorCode {
    font-size: $font-4xl;
    margin: 0;
  }

  .errorMessage {
    margin: 0;
    color: var(--txt);
  }

  .links {
    @include flex(row, center, center);
    gap: $spacing-md;

    a {
      color: var(--primary);
      text-decoration: none;
      font-weight: bold;

      &:hover {
        text-decoration: underline;
      }
    }
  }
</style>
