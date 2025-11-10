<script>
  import { fade } from 'svelte/transition';
  import Loading from '$lib/components/Loading.svelte';
  import { mermaidRendered } from '$lib/stores';
  import { onMount } from 'svelte';

  export let height = '';
  export let alt = '';

  let slotElement;
  let mermaidContainer;
  let cleanedContent = '';

  onMount(() => {
    if (slotElement) {
      // Extract clean text content directly from the slot
      const raw = slotElement.textContent || '';

      // Clean up whitespace, blank lines, and any HTML comments
      cleanedContent = raw
        .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
        .replace(/^\s+|\s+$/g, '') // Trim leading/trailing whitespace
        .replace(/\n\s*\n/g, '\n') // Remove empty lines
        .trim();

      // Set the cleaned content in the mermaid container
      if (mermaidContainer && cleanedContent) {
        mermaidContainer.textContent = cleanedContent;
      }
    }
  });

  // Also update when mermaidContainer becomes available
  $: if (mermaidContainer && cleanedContent) {
    mermaidContainer.textContent = cleanedContent;
  }
</script>

<figure class="container" style:height={$mermaidRendered ? null : `${height}px`}>
  <!-- Hidden slot element to capture content -->
  <div style="display:none" bind:this={slotElement}>
    <slot />
  </div>

  {#if $mermaidRendered}
    <!-- Empty <pre> so Svelte doesn't touch its inner text -->
    <pre
      bind:this={mermaidContainer}
      in:fade={{ delay: 1000, duration: 300 }}
      class="mermaid"
      style:height={`${height}px`}></pre>

    {#if alt}
      <figcaption in:fade={{ delay: 1300, duration: 300 }}>
        {alt}
      </figcaption>
    {/if}
  {:else}
    <div out:fade={{ duration: 300 }} class="placeholder" style:height={`${height}px`}>
      <Loading loading={true} />
    </div>
  {/if}
</figure>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 100%;
    margin: 0;
  }

  .mermaid {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  .placeholder {
    position: absolute;
    display: flex;
    flex-grow: 1;
    height: 100%;
    width: 100%;
    justify-content: center;
    align-items: center;
  }

  figcaption {
    font-style: italic;
    font-size: $font-base;
    text-align: center;
  }
</style>
