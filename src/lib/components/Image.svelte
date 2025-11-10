<script>
  export let image,
    alt,
    sizes = '',
    loading = 'eager';

  let loaded = false;

  async function importImage(image) {
    if (!image || typeof image !== 'string') {
      return null;
    }

    const pictures = import.meta.glob(`/src/content/**/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp}`, {
      import: 'default',
      query: {
        enhanced: true,
        w: '2400;2000;1600;1200;800;400'
      }
    });

    // Simple exact filename match
    for (const [path, src] of Object.entries(pictures)) {
      const fileName = path.split('/').pop();
      if (fileName === image) {
        try {
          return await src();
        } catch (error) {
          console.error('Error loading image:', error);
          return null;
        }
      }
    }

    return null;
  }

  function handleLoad() {
    loaded = true;
  }
</script>

<picture>
  {#await importImage(image)}
    <div class="loading">Loading...</div>
  {:then src}
    {#if src}
      <source srcset={src.sources.avif} type="image/avif" {sizes} />
      <source srcset={src.sources.webp} type="image/webp" {sizes} />
      <img
        src={src.img.src}
        {alt}
        {loading}
        on:load={handleLoad}
        class:loaded
        width={src.img.w}
        height={src.img.h}
      />
    {:else}
      <div class="error">Image not found: {image}</div>
    {/if}
  {:catch error}
    <div class="error">Error loading image: {error.message}</div>
  {/await}
</picture>

<style lang="scss">
  picture {
    aspect-ratio: var(--aspect-ratio, auto);
  }

  img {
    width: var(--width, 100%);
    height: var(--height, auto);
    aspect-ratio: var(--aspect-ratio, auto);
    object-fit: cover;
    transition: opacity 0.2s;
    opacity: 0;

    &.loaded {
      opacity: 1;
    }
  }

  .loading {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--bg-1);
  }
  .error {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--bg-1);
    color: var(--txt-2);
  }
</style>
