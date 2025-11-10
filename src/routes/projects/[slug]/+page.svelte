<script>
  import Image from '$lib/components/Image.svelte';
  import emblaCarouselSvelte from 'embla-carousel-svelte';

  export let data;

  let { default: content, metadata } = data.post;

  let emblaApi;
  let options = { loop: true, align: 'center' };
  let loop = true;

  function emblaInit(event) {
    emblaApi = event.detail;
    loop = emblaApi.internalEngine().slideLooper.canLoop();
  }

  function emblaNext() {
    emblaApi.scrollNext();
  }

  function emblaPrev() {
    emblaApi.scrollPrev();
  }
</script>

<main>
  <div class="head">
    <div class="row">
      <h1>{metadata.name}</h1>
      <div class="links">
        {#if metadata.website}
          <a class="external" href={metadata.website} target="_blank" rel="noopener noreferrer">
            Site<span class="arrow">-></span>
          </a>
        {/if}
        {#if metadata.github}
          <a class="external" href={metadata.github} target="_blank" rel="noopener noreferrer">
            Github<span class="arrow">-></span>
          </a>
        {/if}
      </div>
    </div>
    <p class="description">
      {metadata.description}
    </p>
  </div>
  <div class="embla" use:emblaCarouselSvelte={{ options }} on:emblaInit={emblaInit}>
    <div class="embla__container" class:loop>
      {#each metadata.images as image (image)}
        <div class="embla__slide" class:tall={metadata.aspect_ratio === 'tall'}>
          <Image {image} alt={metadata.description} sizes="(min-width: 800px) 80vw, 100vw" />
        </div>
      {/each}
    </div>
    <button class="embla__prev" on:click={emblaPrev} aria-label="Previous image"
      ><span>&lt;</span></button
    >
    <button class="embla__next" on:click={emblaNext} aria-label="Next image"
      ><span>&gt;</span></button
    >
  </div>
  <div class="content">
    <svelte:component this={content} />
  </div>
</main>

<style lang="scss">
  main {
    width: 100%;
    padding: 0 0 $spacing-3xl 0;
    margin: auto;
  }

  h1 {
    margin: 0;
    margin-right: auto;
  }

  .head {
    margin: $spacing-sm auto $spacing-lg auto;
    padding: 0 $spacing-md;
    width: 100%;
    max-width: $width-content;

    a {
      font-family: $font-family-mono;
      font-size: $font-md;
    }

    .row,
    .links {
      @include flex(row, null, center);
      gap: $spacing-sm $spacing-3xl;
    }

    .description {
      font-size: $font-sm;
      margin: $spacing-xl 0 $spacing-3xl 0;
      font-style: italic;
      color: var(--txt-2);
    }
  }

  .content {
    width: 100%;
    max-width: $width-content;
    margin: auto;
    margin-top: $spacing-lg;
    padding: 0 $spacing-md;
  }

  .embla {
    overflow: hidden;
    position: relative;
  }
  .embla__container {
    display: flex;
    justify-content: center;

    &.loop {
      justify-content: unset;
    }
  }
  .embla__slide {
    flex: 0 0 70%;
    max-width: $width-carousel;
    min-width: 0;
    margin-left: $spacing-xl;
    margin-right: $spacing-xl;

    &.tall {
      flex: 0 0 20%;
      max-width: $width-thumbnail;
    }
  }
  .embla__prev,
  .embla__next {
    position: absolute;
    top: 0;
    bottom: 0;
    width: calc(15% - $spacing-5xl);
    background: none;

    span {
      display: inline-block;
      color: var(--txt-0);
      font-size: $font-2xl;
      font-family: $font-family-mono;
      transform: scale(1);
      transition: $transition-fast;
      opacity: 0;
      background: var(--bg-2);
      width: $width-button;
      height: $width-button;
      line-height: $line-height-2xl;
    }

    &:hover span {
      opacity: 1;
      transform: scale(1.2);
    }
  }
  .embla__next {
    right: 0;
  }
  .embla__prev {
    left: 0;
  }

  @media (max-width: $breakpoint-tablet) {
    .embla__slide {
      flex: 0 0 calc(100% - $spacing-5xl);
      max-width: $width-image-max;
    }
    .embla__prev,
    .embla__next {
      width: 20%;
      span {
        opacity: 1;
      }
    }
    .embla__prev {
      text-align: left;
      padding-left: $spacing-sm;
    }
    .embla__next {
      text-align: right;
      padding-right: $spacing-sm;
    }
  }

  @media (max-width: $breakpoint-mobile) {
    .head {
      .row {
        flex-wrap: wrap;
      }
    }
  }
</style>
