<main>
  <div class="card">
    <div class="mark"><span class="dot"></span>UnKee</div>
    <h1>You're signed in</h1>
    <p>
      Cloud Sync sign-in was confirmed. If you're not returned to the app automatically, switch
      back to UnKee — you can close this tab.
    </p>
  </div>
</main>

<style lang="scss">
  main {
    @include flex(column, center, center);

    height: 100%;
    max-height: calc(100vh - $spacing-8xl);
  }

  .card {
    width: 100%;
    max-width: 380px;
    text-align: center;
  }

  .mark {
    @include flex(row, center, center);

    gap: $spacing-xs;
    font-size: $font-sm;
    font-weight: 600;
    color: var(--txt-2);
    margin-bottom: $spacing-xl;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--green);
  }

  h1 {
    font-size: $font-xl;
    margin: 0 0 $spacing-sm;
  }

  p {
    margin: 0;
    color: var(--txt-2);
    line-height: 1.5;
  }
</style>
