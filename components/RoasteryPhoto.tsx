import Image from "next/image";

export interface GooglePhoto {
  url: string;
  authorName: string | null;
  authorUri: string | null;
}

export default function RoasteryPhoto({
  name,
  className,
  overrideUrl,
  googlePhoto,
  emptyStateHref,
}: {
  slug: string;
  name: string;
  className?: string;
  overrideUrl?: string | null;
  googlePhoto?: GooglePhoto | null;
  emptyStateHref?: string;
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
      className={`flex flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border border-dashed border-black/10 bg-black/[.02] px-4 text-center dark:border-white/15 dark:bg-white/[.03] ${className ?? ""}`}
    >
      <span className="text-2xl" aria-hidden>
        📷
      </span>
      <p className="text-xs text-foreground/60">아직 방문자 사진이 없습니다</p>
      <p className="text-xs text-foreground/40">첫 번째 사진을 제보해주세요.</p>
      {emptyStateHref ? (
        <a
          href={emptyStateHref}
          className="mt-1 rounded-full bg-foreground px-3 py-1 text-[11px] font-medium text-background hover:opacity-90"
        >
          사진 제보하기
        </a>
      ) : (
        <span className="mt-1 rounded-full bg-foreground px-3 py-1 text-[11px] font-medium text-background">
          사진 제보하기
        </span>
      )}
    </div>
  );
}
