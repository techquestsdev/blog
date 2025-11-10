<script context="module">
  import img from '$lib/components/MdsvexImage.svelte';
  export { img };
</script>

<script>
  import { onMount } from 'svelte';
  import { mermaidRendered } from '$lib/stores';
  import mermaid from 'mermaid';

  // shared (blog and projects)
  export let title = '';
  export let description = '';
  export let published = true;
  export let name = '';
  export let icon = '';
  export let date = '';

  // projects
  export let thumbnail = '';
  export let images = [];
  export let aspect_ratio = '';
  export let github = '';
  export let website = '';

  mermaid.initialize({
    theme: 'neutral',
    startOnLoad: false
  });

  onMount(() => {
    mermaidRendered.set(true);
    setTimeout(async () => {
      await mermaid.run();
    }, 0);
  });
</script>

<!-- Use the values to suppress warnings -->
{#if false}
  <div style="display: none">
    {title}{description}{name}{icon}{date}{thumbnail}{github}{website}
    {aspect_ratio}{published ? 'published' : 'draft'}
    {#each images as image (image)}
      {image}
    {/each}
  </div>
{/if}

<slot />
