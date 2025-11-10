<script>
  import { theme, toggleTheme } from '$lib/js/theme';
</script>

<button on:click={toggleTheme} aria-label="Toggle theme">
  {#if $theme === 'dark'}
    <iconify-icon icon="ph:sun"></iconify-icon>
  {:else}
    <iconify-icon icon="ph:moon"></iconify-icon>
  {/if}
</button>

<style lang="scss">
  iconify-icon {
    vertical-align: sub;
    font-size: 2em;
    padding: 0;
  }

  button {
    padding: 0;
    display: inline-flex;
    background: none;
  }
</style>
