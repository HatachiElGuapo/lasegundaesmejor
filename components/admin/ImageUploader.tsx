"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { createBrowserClient } from "@supabase/ssr";

interface ImageUploaderProps {
  existingImages?: string[];
  onImagesChange: (urls: string[]) => void;
}

export default function ImageUploader({
  existingImages = [],
  onImagesChange,
}: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleFiles(files: FileList) {
    if (!files.length) return;
    setUploading(true);

    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(`products/${fileName}`, file, { upsert: false });

      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(data.path);
        newUrls.push(urlData.publicUrl);
      }
    }

    const updated = [...images, ...newUrls];
    setImages(updated);
    onImagesChange(updated);
    setUploading(false);
  }

  function removeImage(url: string) {
    const updated = images.filter((img) => img !== url);
    setImages(updated);
    onImagesChange(updated);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div key={url} className="relative w-24 h-24 rounded overflow-hidden border border-border group">
            <Image src={url} alt={`Imagen ${i + 1}`} fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute inset-0 bg-ink/60 text-bg text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              aria-label="Eliminar imagen"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-24 h-24 border-2 border-dashed border-border rounded flex flex-col items-center justify-center gap-1 text-muted hover:border-accent hover:text-accent transition-colors disabled:opacity-50 text-xs"
        >
          {uploading ? (
            <span>...</span>
          ) : (
            <>
              <span className="text-2xl leading-none">+</span>
              <span>Agregar</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
    </div>
  );
}
