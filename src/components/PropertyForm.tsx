"use client";

import { useState } from "react";
import { AMENITY_OPTIONS, CITIES, PROPERTY_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { saveProperty } from "@/app/actions/properties";
import type { PropertyRecord } from "@/src/types";
import { mergeImagePaths, parseImagePathList } from "@/src/utils/storage";
import { compressPropertyImage } from "@/src/utils/compress-image";
import { uploadPropertyImages } from "@/src/utils/upload-images";

const field = "h-11 rounded-sm";

export function PropertyForm({ property }: { property?: PropertyRecord }) {
  const [images, setImages] = useState(property?.images.join("\n") ?? "");
  const [amenities, setAmenities] = useState<string[]>(property?.amenities ?? []);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const imageList = parseImagePathList(images);

  async function handleFiles(list: File[]) {
    const files = list.filter((file) => file.type.startsWith("image/"));
    if (files.length === 0) return;
    setUploading(true);
    try {
      const compressed: File[] = [];
      for (const file of files) {
        compressed.push(await compressPropertyImage(file));
      }
      const uploaded = await uploadPropertyImages(compressed);
      setImages((prev) => mergeImagePaths(prev, uploaded));
      toast.success(uploaded.length === 1 ? "Image uploaded" : `${uploaded.length} images uploaded`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(`Upload: ${message}`);
    } finally {
      setUploading(false);
    }
  }

  async function onUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    await handleFiles(files);
  }

  function removeImage(url: string) {
    setImages(imageList.filter((item) => item !== url).join("\n"));
  }

  return (
    <div>
    <form action={saveProperty.bind(null, property?.id ?? null)} className="space-y-6">
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
          <Label htmlFor="price">Sale price (PHP)</Label>
          <Input id="price" name="price" type="number" required defaultValue={property?.price} className={field} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nightlyRate">Nightly stay rate (PHP)</Label>
          <Input
            id="nightlyRate"
            name="nightlyRate"
            type="number"
            min={0}
            defaultValue={property?.nightlyRate ?? ""}
            className={field}
            placeholder="Leave blank if sale only"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="offering">Offered as</Label>
          <select
            id="offering"
            name="offering"
            defaultValue={property?.offering ?? "BOTH"}
            className="h-11 w-full rounded-sm border border-input bg-transparent px-3 text-sm"
          >
            <option value="BOTH">For sale and for rent</option>
            <option value="SALE">For sale only</option>
            <option value="RENTAL">For rent only</option>
          </select>
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
          <Input id="lat" name="lat" type="number" step="any" defaultValue={property?.coordinates.lat ?? 14.5547} className={field} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lng">Longitude</Label>
          <Input id="lng" name="lng" type="number" step="any" defaultValue={property?.coordinates.lng ?? 121.0244} className={field} />
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

      <div className="space-y-3">
        <Label>Images</Label>
        {imageList.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {imageList.map((url) => (
              <li key={url} className="relative overflow-hidden border border-border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-28 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 bg-primary/80 px-2 py-0.5 text-[10px] tracking-[0.12em] uppercase text-primary-foreground"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No photographs yet. Upload several at once.</p>
        )}
        <div
          className={`rounded-sm border border-dashed px-4 py-6 ${dragOver ? "border-foreground bg-muted/50" : "border-border"}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            void handleFiles(Array.from(event.dataTransfer.files));
          }}
        >
          <p className="text-sm">
            {uploading ? "Compressing and uploading…" : "Drop photographs here, or choose files."}
          </p>
          <button
            type="button"
            className="mt-2 cursor-pointer text-sm underline underline-offset-4"
            onClick={() => document.getElementById("upload")?.click()}
          >
            Choose files
          </button>
          <p className="mt-2 text-xs text-muted-foreground">
            Photos are resized to 1200px wide, converted to WebP at 75% quality, then stored in
            `property-images`.
          </p>
        </div>
        <Textarea
          id="image-urls"
          rows={3}
          value={images}
          onChange={(event) => setImages(event.target.value)}
          className="rounded-sm font-mono text-xs"
          placeholder="Or paste image URLs, one per line"
        />
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isAvailable" defaultChecked={property?.isAvailable ?? true} />
          Open for stay bookings
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
      <form id="property-image-upload" onSubmit={(event) => event.preventDefault()} hidden />
      <input
        id="upload"
        form="property-image-upload"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        multiple
        className="hidden"
        onChange={onUpload}
      />
    </div>
  );
}
