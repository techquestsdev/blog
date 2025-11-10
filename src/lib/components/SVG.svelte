<script>
  import DOMPurify from 'dompurify';
  export let svg;

  async function importSVG() {
    const svgs = import.meta.glob(`/src/content/*/*/*.svg`, { query: '?raw' });
    for (const [path, src] of Object.entries(svgs)) {
      if (path.includes(svg)) {
        const res = await src();
        // Use DOMPurify to sanitize the SVG content
        const sanitizedSVG = DOMPurify.sanitize(res.default, { USE_PROFILES: { svg: true } });
        return sanitizedSVG;
      }
    }
  }
</script>

<div class="svg-container">
  {#await importSVG(svg) then src}
    {@html src} <!-- eslint-disable-line svelte/no-at-html-tags -->
  {/await}
</div>

<style lang="scss">
  :global(.svg-container svg) {
    width: 100%;
    height: 100%;
  }
</style>
