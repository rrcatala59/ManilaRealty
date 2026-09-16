"use client";

import dynamic from "next/dynamic";
import type { MapCoordinates } from "@/src/types";

const PropertyMapInner = dynamic(() => import("./property-map-inner").then((mod) => mod.PropertyMapInner), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
});

export function PropertyMap({
  coordinates,
  title,
}: {
  coordinates: Pick<MapCoordinates, "x" | "y">;
  title: string;
}) {
  return (
    <div
      data-map-placeholder="listing"
      data-map-x={coordinates.x}
      data-map-y={coordinates.y}
      className="h-[360px] overflow-hidden rounded-sm ring-1 ring-border"
    >
      <PropertyMapInner x={coordinates.x} y={coordinates.y} title={title} />
    </div>
  );
}
