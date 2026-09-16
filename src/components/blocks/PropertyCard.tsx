import Image from "next/image";
import { getOptimizedImageUrl } from "@/src/utils/imageLoader";

export function PropertyCardImage({ src, title }: { src: string; title: string }) {
  if (!src) {
    return <div className="relative aspect-[4/3] w-full bg-stone-100" />;
  }

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
      <Image
        src={getOptimizedImageUrl({ url: src, width: 600, quality: 75 })}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-transform duration-500 hover:scale-105"
        loading="lazy"
      />
    </div>
  );
}
