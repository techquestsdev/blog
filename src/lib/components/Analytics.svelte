<script>
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';

  afterNavigate(() => {
    // Track page views manually with Umami
    if (typeof window !== 'undefined' && window.umami) {
      // For page views, just call umami.track() or umami() with current URL
      window.umami.track('pageview', { url: $page.url.pathname });
    }
  });
</script>
