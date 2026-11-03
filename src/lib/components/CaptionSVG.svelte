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
    font: 500 var(--tq-text-xs) / 1.5 var(--tq-font-display);
    letter-spacing: var(--tq-tracking-label);
    text-transform: uppercase;
    font-style: normal;
    color: var(--tq-ink-2);
    text-align: left;
    margin-top: 12px;
  }
</style>
