<script>
  export let size = '2rem';
</script>

<div class="logo" style={`width: ${size};`}>
  <svg viewBox="0 -195 800 800" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke-miterlimit="10" fill="none">
      <path
        class="loop"
        pathLength="1"
        stroke-width="30"
        d="M-343.843 6.862A153 153 0 0 1-344 0c-.052-94.424 85.51-159.133 155-160 56.718-.708 105.182 35.999 128.422 70.38C0 0-8.304 23.34 60.366 90.809 90.524 120.44 138.796 155.991 195 155c77.203-1.361 148-75.502 148-155 0-88.638-68.375-153.52-146-160-39.464-3.295-118-.604-197 160-16.674 33.896-33.129 60.481-49.075 81.338"
        transform="translate(400 206)"
      />
      <path
        class="accent teal"
        stroke-width="20"
        d="M-193.997 123.007c-20.015 4.767-37.545 2.732-52.218 1.222-15.169-1.561-31.594-7.935-46.919-18.187"
        transform="translate(441.756 211.719)"
      />
      <path
        class="accent amber"
        stroke-width="20"
        d="M131.322-193.41c14.443-2.1 27.151-2.02 37.843-1.981 41.795.153 90.727 22.932 127.642 61.101"
        transform="translate(441.756 211.719)"
      />
    </g>
  </svg>
</div>

<style lang="scss">
  .logo {
    display: inline-flex;
    aspect-ratio: 800 / 410;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  .loop {
    stroke: var(--txt-0);
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: draw 3.2s ease-in-out infinite alternate;
  }
  .accent.teal {
    stroke: var(--green);
  }
  .accent.amber {
    stroke: var(--yellow);
  }

  @keyframes draw {
    from {
      stroke-dashoffset: 1;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .loop {
      animation: none;
      stroke-dashoffset: 0;
    }
  }
</style>
