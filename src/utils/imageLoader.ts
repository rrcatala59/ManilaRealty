interface OptimizeProps {
  url: string;
  width: number;
  quality?: number;
}

const TRANSFORMABLE = /supabase\.co|googleapis\.com/i;

/**
 * Resize listing photography on Supabase's Image Transformation edge
 * before Next.js serves AVIF/WebP. Unsplash and local /uploads pass through.
 */
export function getOptimizedImageUrl({ url, width, quality = 80 }: OptimizeProps): string {
  if (!url || !TRANSFORMABLE.test(url)) {
    return url;
  }

  const renderUrl = url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
  const hashIndex = renderUrl.indexOf("#");
  const withoutHash = hashIndex >= 0 ? renderUrl.slice(0, hashIndex) : renderUrl;
  const hash = hashIndex >= 0 ? renderUrl.slice(hashIndex) : "";
  const queryIndex = withoutHash.indexOf("?");
  const path = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const params = new URLSearchParams(queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : "");
  params.set("width", String(width));
  params.set("quality", String(quality));
  params.set("format", "origin");
  return `${path}?${params.toString()}${hash}`;
}

export function optimizeImageList(urls: string[], width: number, quality = 80) {
  return urls.map((url) => getOptimizedImageUrl({ url, width, quality }));
}
