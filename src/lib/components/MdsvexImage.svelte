<script>
  export let src;
  export let alt;

  export let height = '';
  export let width = '';
  export let style = '';
</script>

<!-- Use the values to suppress warnings -->
{#if false}
  <div style="display: none">
    {height}{width}{style}
  </div>
{/if}

<img {src} {alt} loading="lazy" />
