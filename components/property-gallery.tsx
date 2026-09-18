"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getOptimizedImageUrl } from "@/src/utils/imageLoader";

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const photos = images.length ? images : [];

  if (photos.length === 0) {
    return <div className="flex h-80 items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">No photos yet</div>;
  }

  const mosaic = photos.slice(0, 5);
  const extra = photos.length - mosaic.length;

  return (
    <div>
      <div className="relative grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl md:h-[460px]">
        {mosaic.map((src, index) => (
          <button
            key={src + index}
            type="button"
            onClick={() => {
              setActive(index);
              setShowAll(true);
            }}
            className={cn(
              "relative overflow-hidden bg-muted",
              index === 0 ? "col-span-4 row-span-1 min-h-[220px] md:col-span-2 md:row-span-2 md:min-h-0" : "col-span-2 min-h-[110px] md:col-span-1 md:min-h-0",
              index > 2 && "hidden md:block"
            )}
          >
            <Image
              src={getOptimizedImageUrl({ url: src, width: index === 0 ? 1600 : 800, quality: 80 })}
              alt={index === 0 ? title : ""}
              fill
              priority={index === 0}
              className="object-cover transition-transform duration-500 hover:scale-[1.03]"
              sizes={index === 0 ? "(max-width: 768px) 100vw, 50vw" : "25vw"}
            />
          </button>
        ))}
        {photos.length > 1 ? (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="absolute right-3 bottom-3 rounded-full bg-card/95 px-3 py-1.5 text-[11px] tracking-[0.14em] uppercase shadow-sm ring-1 ring-border"
          >
            Show all photos{extra > 0 ? ` · ${photos.length}` : ""}
          </button>
        ) : null}
      </div>

      {showAll ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-background/95 p-5 md:p-10"
          role="dialog"
          aria-label="All photographs"
        >
          <button
            type="button"
            className="mb-6 text-sm underline underline-offset-4"
            onClick={() => setShowAll(false)}
          >
            Close
          </button>
          <div className="mx-auto grid max-w-5xl gap-3">
            {photos.map((src, index) => (
              <button key={src + index} type="button" onClick={() => setActive(index)} className="relative aspect-[16/10] overflow-hidden rounded-xl">
                <Image
                  src={getOptimizedImageUrl({ url: src, width: 1600, quality: 80 })}
                  alt=""
                  fill
                  className={cn("object-cover", active === index && "ring-2 ring-primary")}
                  sizes="100vw"
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
