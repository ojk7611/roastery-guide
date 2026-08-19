"use client";

import { useState, type ReactNode } from "react";

export default function RoasteryPhotoTabs({
  heroContent,
  galleryContent,
  galleryCount,
}: {
  heroContent: ReactNode;
  galleryContent: ReactNode;
  galleryCount: number;
}) {
  const [tab, setTab] = useState<"hero" | "gallery">("hero");

  if (galleryCount === 0) {
    return <>{heroContent}</>;
  }

  return (
    <div>
      <div className="mb-2 flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setTab("hero")}
          className={`rounded-full px-3 py-1.5 transition-colors ${
            tab === "hero"
              ? "bg-foreground text-background"
              : "bg-black/5 text-foreground/70 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
          }`}
        >
          대표 사진
        </button>
        <button
          type="button"
          onClick={() => setTab("gallery")}
          className={`rounded-full px-3 py-1.5 transition-colors ${
            tab === "gallery"
              ? "bg-foreground text-background"
              : "bg-black/5 text-foreground/70 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
          }`}
        >
          방문객 사진 ({galleryCount})
        </button>
      </div>
      {tab === "hero" ? heroContent : galleryContent}
    </div>
  );
}
