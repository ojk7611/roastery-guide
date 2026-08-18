import Link from "next/link";
import { regions } from "@/lib/regions";
import { getRoasteriesByRegion } from "@/data/roasteries";
import type { Region } from "@/types/roastery";
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  REGION_PATHS,
  REGION_CENTROIDS,
  REGION_RENDER_ORDER,
} from "@/lib/region-map-data";

const SHORT_LABEL: Partial<Record<Region, string>> = {
  gwangju: "광주",
  gangwon: "강원",
  gyeonggi: "경기",
  gyeongsang: "경상",
  jeolla: "전라",
  chungcheong: "충청",
};

// 지도 위에 글자를 새기기엔 너무 작은 지역(서울/대전/대구/인천)은
// 텍스트 대신 작은 점으로 표시한다. 이름은 hover 툴팁과 아래 범례에서
// 확인할 수 있다. 서울·인천은 서로 붙어 있어 라벨이 겹치기 쉽다.
const DOT_REGIONS = new Set<Region>(["seoul", "daejeon", "daegu", "incheon"]);

export default function RegionMap() {
  const regionBySlug = new Map(regions.map((r) => [r.slug, r]));

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        role="group"
        aria-label="지역별 로스터리 지도"
        className="w-full max-w-[300px] sm:max-w-[360px]"
      >
        {REGION_RENDER_ORDER.map((slug) => {
          const region = regionBySlug.get(slug);
          if (!region) return null;
          const count = getRoasteriesByRegion(region.slug).length;
          const label = SHORT_LABEL[region.slug] ?? region.label;
          const [cx, cy] = REGION_CENTROIDS[slug];
          const isDot = DOT_REGIONS.has(region.slug);

          return (
            <Link
              key={slug}
              href={`/${region.slug}`}
              className="group cursor-pointer outline-none"
            >
              <title>{`${region.label} · 로스터리 ${count}곳`}</title>
              <path
                d={REGION_PATHS[slug]}
                className="fill-black/[.06] stroke-background transition-colors group-hover:fill-foreground/70 group-focus-visible:fill-foreground/70 dark:fill-white/[.12]"
                strokeWidth={1.5}
              />
              {isDot ? (
                <circle
                  cx={cx}
                  cy={cy}
                  r={4}
                  className="pointer-events-none fill-foreground/60 transition-colors group-hover:fill-background dark:fill-foreground/70"
                />
              ) : (
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none select-none fill-foreground/70 transition-colors group-hover:fill-background dark:fill-foreground/80"
                  style={{ fontSize: 12, fontWeight: 600 }}
                >
                  {label}
                </text>
              )}
            </Link>
          );
        })}
      </svg>

      <nav
        aria-label="지역 목록"
        className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 text-xs"
      >
        {regions.map((region) => {
          const count = getRoasteriesByRegion(region.slug).length;
          return (
            <Link
              key={region.slug}
              href={`/${region.slug}`}
              className="text-foreground/60 transition-colors hover:text-foreground"
            >
              {region.label}
              <span className="text-foreground/35"> {count}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
