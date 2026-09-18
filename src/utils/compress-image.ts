export const PROPERTY_IMAGE_MAX_WIDTH = 1200;
export const PROPERTY_IMAGE_QUALITY = 0.75;
export const PROPERTY_IMAGE_OUTPUT_TYPE = "image/webp";

async function loadBitmap(file: File): Promise<ImageBitmap> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      return createImageBitmap(file);
    }
  }
  return decodeWithImageElement(file);
}

function decodeWithImageElement(file: File): Promise<ImageBitmap> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      try {
        resolve(await createImageBitmap(image));
      } catch (error) {
        reject(error);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`${file.name} could not be read as an image.`));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob && blob.size > 0) {
        resolve(blob);
        return;
      }
      if (type === "image/webp") {
        canvas.toBlob((jpeg) => {
          if (jpeg && jpeg.size > 0) resolve(jpeg);
          else reject(new Error("This browser could not encode the photo."));
        }, "image/jpeg", quality);
        return;
      }
      reject(new Error("This browser could not encode the photo."));
    }, type, quality);
  });
}

function outputFilename(originalName: string, mimeType: string) {
  const base = originalName.replace(/\.[^.]+$/, "") || "image";
  if (mimeType === "image/webp") return `${base}.webp`;
  if (mimeType === "image/jpeg") return `${base}.jpg`;
  return `${base}.png`;
}

/** Scale width to 1200px max, encode WebP at 75% quality. Browser canvas only. */
export async function compressPropertyImage(file: File): Promise<File> {
  const bitmap = await loadBitmap(file);
  try {
    const scale = bitmap.width > PROPERTY_IMAGE_MAX_WIDTH ? PROPERTY_IMAGE_MAX_WIDTH / bitmap.width : 1;
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not compress this photo.");
    }
    context.drawImage(bitmap, 0, 0, width, height);
    const blob = await canvasToBlob(canvas, PROPERTY_IMAGE_OUTPUT_TYPE, PROPERTY_IMAGE_QUALITY);
    return new File([blob], outputFilename(file.name, blob.type), {
      type: blob.type,
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}
