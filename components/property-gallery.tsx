"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getOptimizedImageUrl } from "@/src/utils/imageLoader";

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const photos = images.length ? images : [];

  if (photos.length === 0) {
    return <div className="flex h-80 items-center justify-center bg-muted text-sm text-muted-foreground">No photos yet</div>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-[1.4fr_0.8fr]">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted md:aspect-auto md:min-h-[420px]">
        <Image
          src={getOptimizedImageUrl({ url: photos[active], width: 1600, quality: 80 })}
          alt={title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 70vw"
        />
      </div>
      <div className="grid grid-cols-4 gap-2 md:grid-cols-2 md:grid-rows-2">
        {photos.slice(0, 4).map((src, index) => (
          <button
            key={src + index}
            type="button"
            onClick={() => setActive(index)}
            className={cn(
              "relative aspect-[4/3] overflow-hidden ring-1 ring-border transition-opacity",
              active === index ? "opacity-100" : "opacity-70 hover:opacity-100"
            )}
          >
            <Image
              src={getOptimizedImageUrl({ url: src, width: 480, quality: 70 })}
              alt=""
              fill
              className="object-cover"
              sizes="25vw"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
