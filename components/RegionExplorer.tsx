"use client";

import Link from "next/link";
import { useState } from "react";
import KakaoMap from "./KakaoMap";
import { extractClosedDay } from "@/lib/hours";
import type { Roastery } from "@/types/roastery";

export default function RegionExplorer({
  roasteries,
}: {
  roasteries: Roastery[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = roasteries.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="mt-8 flex flex-col gap-4 lg:flex-row">
      <KakaoMap
        className="h-96 w-full lg:w-2/3"
        markers={roasteries.map((r) => ({
          id: r.id,
          lat: r.lat,
          lng: r.lng,
          name: r.name,
        }))}
        onMarkerClick={setSelectedId}
      />

      <div className="flex flex-col gap-3 lg:w-1/3">
        {selected ? (
          <div className="rounded-xl border border-black/10 p-4 text-sm dark:border-white/10">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-foreground/50">
                  {selected.neighborhood}
                </p>
                <Link
                  href={`/${selected.region}/${selected.slug}`}
                  className="text-base font-semibold hover:underline"
                >
                  {selected.name}
                </Link>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="닫기"
                className="text-foreground/40 hover:text-foreground/70"
              >
                ✕
              </button>
            </div>

            <dl className="mt-3 space-y-2">
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-foreground/50">주소</dt>
                <dd>{selected.address}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-foreground/50">영업시간</dt>
                <dd>{selected.hours}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-foreground/50">휴무일</dt>
                <dd>{extractClosedDay(selected.hours)}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-foreground/50">주차</dt>
                <dd>확인 필요</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-foreground/50">대표메뉴</dt>
                <dd>{selected.signature.join(", ")}</dd>
              </div>
            </dl>

            <Link
              href={`/${selected.region}/${selected.slug}`}
              className="mt-3 inline-block text-xs text-foreground/50 underline decoration-foreground/30 underline-offset-2 hover:text-foreground/80"
            >
              상세 페이지 보기 →
            </Link>
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-black/10 px-4 text-center text-xs text-foreground/40 dark:border-white/15">
            지도 핀이나 아래 목록에서 카페를 선택해보세요.
          </div>
        )}

        <ul className="max-h-80 space-y-1 overflow-y-auto rounded-xl border border-black/10 p-2 text-sm dark:border-white/10">
          {roasteries.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => setSelectedId(r.id)}
                className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left transition-colors ${
                  selectedId === r.id
                    ? "bg-foreground text-background"
                    : "text-foreground/70 hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                <span aria-hidden>📍</span>
                <span className="truncate">{r.name}</span>
                <span
                  className={`ml-auto shrink-0 text-xs ${
                    selectedId === r.id
                      ? "text-background/70"
                      : "text-foreground/40"
                  }`}
                >
                  {r.neighborhood}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
