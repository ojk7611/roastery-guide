import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import flowerMark from "@/public/brand/flower-mark.png";

const GRADIENTS = [
  "linear-gradient(135deg, #d9c2a3, #8a6d4b)",
  "linear-gradient(135deg, #c7d3c0, #5f7a63)",
  "linear-gradient(135deg, #e0c3b0, #a3543a)",
  "linear-gradient(135deg, #cbd6e0, #4a6178)",
  "linear-gradient(135deg, #ddd0e0, #6e5580)",
  "linear-gradient(135deg, #e3d0b8, #7a5c3a)",
];

function pickGradient(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}

export default function RoasteryPhoto({
  slug,
  name,
  className,
  overrideUrl,
}: {
  slug: string;
  name: string;
  className?: string;
  overrideUrl?: string | null;
}) {
  if (overrideUrl) {
    return (
      <div className={`relative overflow-hidden rounded-xl ${className ?? ""}`}>
        <Image
          src={overrideUrl}
          alt={name}
          fill
          sizes="(min-width: 640px) 400px, 100vw"
          className="object-cover"
        />
      </div>
    );
  }

  const photoPath = path.join(process.cwd(), "public", "photos", `${slug}.jpg`);
  const hasPhoto = existsSync(photoPath);

  if (hasPhoto) {
    return (
      <div className={`relative overflow-hidden rounded-xl ${className ?? ""}`}>
        <Image
          src={`/photos/${slug}.jpg`}
          alt={name}
          fill
          sizes="(min-width: 640px) 400px, 100vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-xl ${className ?? ""}`}
      style={{ background: pickGradient(slug) }}
    >
      <Image src={flowerMark} alt="" className="h-10 w-10 opacity-70 invert" />
    </div>
  );
}
