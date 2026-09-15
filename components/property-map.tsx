"use client";

import dynamic from "next/dynamic";

const PropertyMapInner = dynamic(() => import("./property-map-inner").then((mod) => mod.PropertyMapInner), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
});

export function PropertyMap({
  lat,
  lng,
  title,
}: {
  lat: number;
  lng: number;
  title: string;
}) {
  return (
    <div className="h-[360px] overflow-hidden rounded-sm ring-1 ring-border">
      <PropertyMapInner lat={lat} lng={lng} title={title} />
    </div>
  );
}
