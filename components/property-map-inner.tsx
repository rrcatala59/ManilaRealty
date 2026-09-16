"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function RecenterOnPoint({ x, y }: { x: number; y: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([y, x], 14);
  }, [map, x, y]);
  return null;
}

export function PropertyMapInner({
  x,
  y,
  title,
}: {
  x: number;
  y: number;
  title: string;
}) {
  const position: [number, number] = [y, x];

  return (
    <MapContainer center={position} zoom={14} scrollWheelZoom={false} className="h-full w-full">
      <RecenterOnPoint x={x} y={y} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={icon}>
        <Popup>{title}</Popup>
      </Marker>
    </MapContainer>
  );
}
