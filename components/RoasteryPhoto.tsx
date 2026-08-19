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

export interface GooglePhoto {
  url: string;
  authorName: string | null;
  authorUri: string | null;
}

export default function RoasteryPhoto({
  slug,
  name,
  className,
  overrideUrl,
  googlePhoto,
}: {
  slug: string;
  name: string;
  className?: string;
  overrideUrl?: string | null;
  googlePhoto?: GooglePhoto | null;
}) {
  const photoUrl = overrideUrl || googlePhoto?.url;
  // 방문객이 제보해 대표 사진으로 지정된 것이 아니라 구글에서 가져온
  // 사진일 때만 저작자 표시를 보여준다(구글 Places API 이용약관 요건).
  const attribution = !overrideUrl ? googlePhoto : null;

  if (photoUrl) {
    return (
      <div className={`relative overflow-hidden rounded-xl ${className ?? ""}`}>
        <Image
          src={photoUrl}
          alt={name}
          fill
          sizes="(min-width: 640px) 400px, 100vw"
          className="object-cover"
        />
        {attribution &&
          (attribution.authorUri ? (
            <a
              href={attribution.authorUri}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="absolute right-1.5 bottom-1.5 rounded bg-black/50 px-1.5 py-0.5 text-[10px] leading-none text-white/90 backdrop-blur-sm hover:text-white"
            >
              사진: {attribution.authorName ?? "Google"}
            </a>
          ) : (
            <span className="absolute right-1.5 bottom-1.5 rounded bg-black/50 px-1.5 py-0.5 text-[10px] leading-none text-white/90 backdrop-blur-sm">
              사진: {attribution.authorName ?? "Google"}
            </span>
          ))}
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
