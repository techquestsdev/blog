const hostname = 'https://techquests.dev';
const authorName = 'Andre Nogueira';
const authorUrl = hostname;
const siteName = 'Tech Quests';
const logoUrl = `${hostname}/favicon.png`;

function normalizeImage(image) {
  if (!image?.img?.src) return null;
  const url = `${hostname}${image.img.src}`;
  const width = image.img.w || undefined;
  const height = image.img.h || undefined;

  return {
    '@type': 'ImageObject',
    url,
    ...(width ? { width } : {}),
    ...(height ? { height } : {})
  };
}

export function buildPersonJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: authorName,
    url: authorUrl,
    jobTitle: 'Site Reliability Engineer',
    sameAs: [
      'https://github.com/aanogueira',
      'https://linkedin.com/in/aanogueira',
      'https://medium.com/@aanogueira',
      'https://dev.to/aanogueira'
    ]
  };
}

export function buildWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: hostname,
    description:
      'The saga of Andre Nogueira, a Site Reliability Engineer sharing insights on homelabs, software engineering, and technological adventures.',
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: logoUrl
      }
    },
    author: {
      '@type': 'Person',
      name: authorName,
      url: authorUrl
    }
  };
}

export function buildBlogPostingJsonLd(metadata, image) {
  const url = `${hostname}/blog/${metadata.slug}`;
  const datePublished = metadata.date ? new Date(metadata.date).toISOString() : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: metadata.name,
    description: metadata.description,
    url,
    ...(datePublished ? { datePublished } : {}),
    author: {
      '@type': 'Person',
      name: authorName,
      url: authorUrl
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: logoUrl
      }
    },
    ...(image ? { image } : {}),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    }
  };
}

export function buildProjectJsonLd(metadata, images) {
  const url = `${hostname}/projects/${metadata.slug}`;
  const datePublished = metadata.date ? new Date(metadata.date).toISOString() : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: metadata.name,
    description: metadata.description,
    url,
    ...(datePublished ? { datePublished } : {}),
    author: {
      '@type': 'Person',
      name: authorName,
      url: authorUrl
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: logoUrl
      }
    },
    ...(images && images.length > 0 ? { image: images } : {}),
    ...(metadata.github ? { codeRepository: metadata.github } : {}),
    ...(metadata.website ? { downloadUrl: metadata.website } : {})
  };
}

export function buildImageObject(image) {
  return normalizeImage(image);
}
