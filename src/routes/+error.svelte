<script>
  import { page } from '$app/stores';
</script>

<main>
  {#if $page.error}
    <h1 class="errorCode">{$page.status}</h1>
    <h2 class="errorMessage">{$page.error.message}</h2>
  {/if}
</main>

<style lang="scss">
  main {
    @include flex(column, center, center);

    height: 100%;
    max-height: calc(100vh - $spacing-8xl);
  }

  .errorCode {
    font-size: $font-4xl;
    margin: 0;
  }

  .errorMessage {
    margin: 0;
    color: var(--txt);
  }
</style>
