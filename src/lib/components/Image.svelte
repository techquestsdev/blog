<script>
  export let image,
    alt,
    sizes = '',
    loading = 'eager';

  let loaded = false;

  const lazyPictures = import.meta.glob(
    `/src/content/**/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp}`,
    {
      import: 'default',
      query: {
        enhanced: true,
        w: '2400;2000;1600;1200;800;400'
      }
    }
  );

  const eagerPictures = import.meta.glob(
    `/src/content/**/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp}`,
    {
      eager: true,
      import: 'default',
      query: {
        enhanced: true,
        w: '2400;2000;1600;1200;800;400'
      }
    }
  );

  const isSSR = import.meta.env.SSR;

  function findModule(modules, image) {
    if (!image || typeof image !== 'string') {
      return null;
    }

    // Normalize path for relative references
    const normalizedImage = image.replace(/^\.\//, '').toLowerCase();

    for (const [path, src] of Object.entries(modules)) {
      const normalizedPath = path.toLowerCase();
      const fileName = path.split('/').pop();
      const normalizedFileName = fileName?.toLowerCase();

      if (
        normalizedFileName === normalizedImage ||
        normalizedPath.endsWith(`/${normalizedImage}`)
      ) {
        return src;
      }
    }

    return null;
  }

  async function importImage(image) {
    const module = findModule(lazyPictures, image);
    if (!module) return null;

    try {
      return typeof module === 'function' ? await module() : module;
    } catch (error) {
      console.error('Error loading image:', error);
      return null;
    }
  }

  function resolveImageSync(image) {
    const module = findModule(eagerPictures, image);
    if (!module) return null;
    return typeof module === 'function' ? null : module;
  }

  $: resolvedImage = isSSR ? resolveImageSync(image) : null;

  function handleLoad() {
    loaded = true;
  }
</script>

<picture>
  {#if isSSR}
    {#if resolvedImage}
      <source srcset={resolvedImage.sources.avif} type="image/avif" {sizes} />
      <source srcset={resolvedImage.sources.webp} type="image/webp" {sizes} />
      <img
        src={resolvedImage.img.src}
        {alt}
        {loading}
        width={resolvedImage.img.w}
        height={resolvedImage.img.h}
      />
    {:else}
      <div class="error">{alt || 'Image unavailable'}</div>
    {/if}
  {:else}
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
        <div class="error">{alt || 'Image unavailable'}</div>
      {/if}
    {:catch}
      <div class="error">{alt || 'Image unavailable'}</div>
    {/await}
  {/if}
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
