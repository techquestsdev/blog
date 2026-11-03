<script>
  import { page } from '$app/stores';

  $: status = $page.status;
  $: message = status === 404 ? "you've wandered off the map" : $page.error?.message;
</script>

<section class="g ph">
  <div class="side"><span class="lab">Error</span><span class="lab"><b>{status}</b></span></div>
  <h1 class="mega c-r">{status}</h1>
  <p class="lede">{message}</p>
</section>
<div class="g band heavy" style="padding-top:24px;padding-bottom:96px">
  <a class="more c-r" href="/" style="justify-self:start">← Back to home</a>
</div>
