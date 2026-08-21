<script>
  import SVG from './SVG.svelte';

  export let svg,
    alt = '',
    source = '';

  source = source.replace(/</g, '').replace(/>/g, '');
</script>

<figure>
  <SVG {svg} />
  {#if alt !== ''}
    <figcaption>
      {alt}
      {#if source !== ''}
        <a href={source}>source</a>{/if}
    </figcaption>
  {/if}
</figure>

<style lang="scss">
  figcaption {
    font-style: italic;
    font-size: $font-xs;
    color: var(--txt-3);
    text-align: center;
    margin-top: $spacing-md;
  }
</style>
