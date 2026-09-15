"use client";

import { useState } from "react";
import type { Property } from "@prisma/client";
import { AMENITY_OPTIONS, CITIES, PROPERTY_TYPES } from "@/lib/constants";
import { parseJsonList } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const field = "h-11 rounded-sm";

export function PropertyForm({
  property,
  action,
}: {
  property?: Property;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [images, setImages] = useState(property ? parseJsonList(property.images).join("\n") : "");
  const [amenities, setAmenities] = useState<string[]>(
    property ? parseJsonList(property.amenities) : []
  );
  const [uploading, setUploading] = useState(false);

  async function onUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");
      setImages((prev) => (prev ? `${prev}\n${data.url}` : data.url));
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="images" value={images} />
      <input type="hidden" name="amenities" value={amenities.join(",")} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required defaultValue={property?.title} className={field} />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            required
            rows={6}
            defaultValue={property?.description}
            className="rounded-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price">Price (PHP)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            required
            defaultValue={property?.price}
            className={field}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">City</Label>
          <select
            id="city"
            name="city"
            required
            defaultValue={property?.city ?? "Makati"}
            className="h-11 w-full rounded-sm border border-input bg-transparent px-3 text-sm"
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" required defaultValue={property?.address} className={field} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="type">Property type</Label>
          <select
            id="type"
            name="type"
            defaultValue={property?.type ?? "CONDO"}
            className="h-11 w-full rounded-sm border border-input bg-transparent px-3 text-sm"
          >
            {PROPERTY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={property?.status ?? "AVAILABLE"}
            className="h-11 w-full rounded-sm border border-input bg-transparent px-3 text-sm"
          >
            <option value="AVAILABLE">Available</option>
            <option value="RENTED">Rented</option>
            <option value="SOLD">Sold</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="beds">Bedrooms</Label>
          <Input id="beds" name="beds" type="number" defaultValue={property?.beds ?? 0} className={field} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="baths">Bathrooms</Label>
          <Input id="baths" name="baths" type="number" defaultValue={property?.baths ?? 1} className={field} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sqm">Size (sqm)</Label>
          <Input id="sqm" name="sqm" type="number" required defaultValue={property?.sqm} className={field} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lat">Latitude</Label>
          <Input id="lat" name="lat" type="number" step="any" defaultValue={property?.lat ?? 14.5547} className={field} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lng">Longitude</Label>
          <Input id="lng" name="lng" type="number" step="any" defaultValue={property?.lng ?? 121.0244} className={field} />
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Amenities</legend>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {AMENITY_OPTIONS.map((item) => (
            <label key={item} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={amenities.includes(item)}
                onChange={(event) => {
                  setAmenities((prev) =>
                    event.target.checked ? [...prev, item] : prev.filter((value) => value !== item)
                  );
                }}
              />
              {item}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="image-urls">Images (one URL per line)</Label>
        <Textarea
          id="image-urls"
          rows={5}
          value={images}
          onChange={(event) => setImages(event.target.value)}
          className="rounded-sm font-mono text-xs"
        />
        <div className="flex items-center gap-3">
          <Label htmlFor="upload" className="cursor-pointer text-sm underline underline-offset-4">
            {uploading ? "Uploading…" : "Upload a file"}
          </Label>
          <input id="upload" type="file" accept="image/*" className="hidden" onChange={onUpload} />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isAvailable" defaultChecked={property?.isAvailable ?? true} />
          Available for future booking
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isFeatured" defaultChecked={property?.isFeatured ?? false} />
          Featured on homepage
        </label>
      </div>

      <Button type="submit" className="h-11 rounded-sm px-6 tracking-[0.14em] uppercase">
        {property ? "Save listing" : "Publish listing"}
      </Button>
    </form>
  );
}
