"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImageCarousel({
  images,
  alt,
  className,
}: {
  images: string[];
  alt: string;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const safeImages = images.length > 0 ? images : ["/next.svg"];
  const current = safeImages[index % safeImages.length];

  return (
    <div className={cn("group relative overflow-hidden bg-muted", className)}>
      <Image
        src={current}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      />
      {safeImages.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
            }}
            className="absolute top-1/2 left-2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-card/85 text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIndex((prev) => (prev + 1) % safeImages.length);
            }}
            className="absolute top-1/2 right-2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-card/85 text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
          >
            <ChevronRight className="size-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {safeImages.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 w-1 rounded-full bg-white/50",
                  i === index % safeImages.length && "w-3 bg-white"
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
