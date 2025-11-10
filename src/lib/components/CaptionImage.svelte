<script>
  import Image from './Image.svelte';

  export let image,
    alt = '',
    source = '',
    sizes = '',
    loading = '';

  source = source.replace(/</g, '').replace(/>/g, '');
</script>

<figure>
  <Image {image} {alt} {sizes} {loading} />
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
    font-size: $font-base;
    text-align: center;
    margin-top: $spacing-xl;
  }
</style>
