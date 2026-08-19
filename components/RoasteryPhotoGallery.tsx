import Image from "next/image";
import type { Submission } from "@/lib/db";

export default function RoasteryPhotoGallery({
  photos,
}: {
  photos: Submission[];
}) {
  const withPhoto = photos.filter(
    (s): s is Submission & { photoUrl: string } => s.photoUrl !== null,
  );

  if (withPhoto.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2">
      {withPhoto.map((s) => (
        <div key={s.id}>
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
        </div>
      ))}
    </div>
  );
}
