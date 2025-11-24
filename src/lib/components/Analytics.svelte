<script>
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';

  afterNavigate(() => {
    // Track page views manually with Umami
    if (typeof window !== 'undefined' && window.umami) {
      // Call umami.track with the props parameter for page views
      window.umami.track((props) => ({ ...props, url: $page.url.pathname }));
    }
  });
</script>
