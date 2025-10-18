// frontend/src/lib/imageOptimizer.ts

/**
 * Optimizes Formula1.com image URLs to request appropriate sizes
 * F1 uses a transform service: .transform/SIZE/image.png
 * 
 * Available sizes:
 * - 1col: ~200x200
 * - 2col: ~300x300
 * - 2col-retina: ~412x412 (original)
 * - 4col: ~600x600
 */

export function optimizeF1ImageUrl(url: string | undefined | null, displaySize: 'small' | 'medium' | 'large' = 'medium'): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Only optimize Formula1 CDN images
  if (!url.includes('media.formula1.com') || !url.includes('.transform/')) {
    return url;
  }

  // Map display sizes to F1 transform sizes
  const sizeMap = {
    'small': '1col',      // ~200x200 for thumbnails/avatars
    'medium': '2col',     // ~300x300 for cards
    'large': '2col-retina' // ~412x412 for detailed views
  };

  const targetSize = sizeMap[displaySize];

  // Replace the transform size in the URL
  // Example: .transform/2col-retina/image.png → .transform/2col/image.png
  const optimizedUrl = url.replace(
    /\.transform\/[^/]+\//,
    `.transform/${targetSize}/`
  );

  return optimizedUrl;
}

/**
 * Creates a srcset for responsive image loading
 * Only works with Formula1.com images
 */
export function createF1ImageSrcSet(url: string | undefined | null): string {
  if (!url || typeof url !== 'string' || !url.includes('media.formula1.com')) {
    return '';
  }

  // Generate srcset with different sizes
  const sizes = [
    { transform: '1col', width: 200 },
    { transform: '2col', width: 300 },
    { transform: '2col-retina', width: 412 }
  ];

  return sizes
    .map(({ transform, width }) => {
      const sizedUrl = url.replace(/\.transform\/[^/]+\//, `.transform/${transform}/`);
      return `${sizedUrl} ${width}w`;
    })
    .join(', ');
}

/**
 * Gets the appropriate sizes attribute for responsive images
 */
export function getImageSizes(context: 'card' | 'list' | 'detail' | 'avatar'): string {
  const sizeMap = {
    'avatar': '60px',
    'list': '(max-width: 768px) 150px, 200px',
    'card': '(max-width: 768px) 180px, 300px',
    'detail': '(max-width: 768px) 250px, 400px'
  };

  return sizeMap[context];
}

