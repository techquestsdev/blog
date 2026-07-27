<script>
  export let label = '';
</script>

<div class="section-label">
  <span class="glyph" aria-hidden="true">❖</span>{label}<span class="rule" aria-hidden="true"
  ></span>
</div>

<style lang="scss">
  .section-label {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-family: $font-family-mono;
    font-size: $font-xs;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--txt-3);
    margin: $spacing-3xl 0 $spacing-base 0;

    .glyph {
      color: var(--green);
    }
    .rule {
      flex: 1;
      height: 1px;
      background: var(--bg-3);
    }
  }
</style>
