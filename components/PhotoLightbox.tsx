"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export default function PhotoLightbox({
  photoUrl,
  caption,
  onClose,
  onPrev,
  onNext,
}: {
  photoUrl: string;
  caption?: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrev, onNext]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 50) onPrev();
    else if (delta < -50) onNext();
    touchStartX.current = null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute top-4 right-4 text-3xl text-white/80 hover:text-white"
      >
        ✕
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="이전 사진"
        className="absolute left-2 z-10 px-2 text-4xl text-white/70 hover:text-white sm:left-6"
      >
        ‹
      </button>

      <div
        className="relative h-[70vh] w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={photoUrl}
          alt=""
          fill
          sizes="90vw"
          className="object-contain"
        />
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="다음 사진"
        className="absolute right-2 z-10 px-2 text-4xl text-white/70 hover:text-white sm:right-6"
      >
        ›
      </button>

      {caption && (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/70">
          {caption}
        </p>
      )}
    </div>
  );
}
