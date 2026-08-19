"use client";

import { useState } from "react";
import Image from "next/image";
import type { Submission } from "@/lib/db";
import PhotoLightbox from "./PhotoLightbox";

export default function RoasteryPhotoGallery({
  photos,
}: {
  photos: Submission[];
}) {
  const withPhoto = photos.filter(
    (s): s is Submission & { photoUrl: string } => s.photoUrl !== null,
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (withPhoto.length === 0) return null;

  const active = activeIndex !== null ? withPhoto[activeIndex] : null;

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {withPhoto.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveIndex(i)}
            className="text-left"
          >
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src={s.photoUrl}
                alt=""
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
            <p className="mt-1 truncate text-xs text-foreground/50">
              {s.authorName ?? "익명"}
            </p>
          </button>
        ))}
      </div>

      {active && (
        <PhotoLightbox
          photoUrl={active.photoUrl}
          caption={active.authorName ?? "익명"}
          onClose={() => setActiveIndex(null)}
          onPrev={() =>
            setActiveIndex((i) =>
              i === null ? null : (i - 1 + withPhoto.length) % withPhoto.length,
            )
          }
          onNext={() =>
            setActiveIndex((i) => (i === null ? null : (i + 1) % withPhoto.length))
          }
        />
      )}
    </>
  );
}
