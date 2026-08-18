import Link from "next/link";
import { regions } from "@/lib/regions";
import { getRoasteriesByRegion } from "@/data/roasteries";
import type { Region } from "@/types/roastery";

// 실제 행정구역 경계는 아니고, 대략적인 남북(행)/동서(열) 위치 관계만
// 살린 단순화된 타일 지도. 각 지역 이름은 grid-template-areas에서
// 정확히 하나의 직사각형 블록을 이뤄야 하므로(비직사각형 불가),
// 실제 지형을 단순화해 배치했다.
const GRID_TEMPLATE_AREAS = `
  ".       .            .            gangwon    ."
  "incheon seoul        gyeonggi     gangwon    ."
  ".       .            gyeonggi     gangwon    ."
  "jeolla  chungcheong  chungcheong  daejeon    gyeongsang"
  "jeolla  chungcheong  chungcheong  daejeon    gyeongsang"
  "gwangju gwangju      .            daegu      gyeongsang"
  ".       .            jeju         .          busan"
`;

const SHORT_LABEL: Partial<Record<Region, string>> = {
  gwangju: "광주",
  gangwon: "강원",
  gyeonggi: "경기",
  gyeongsang: "경상",
  jeolla: "전라",
  chungcheong: "충청",
};

export default function RegionMap() {
  return (
    <div
      className="grid gap-1.5"
      style={{
        gridTemplateAreas: GRID_TEMPLATE_AREAS,
        gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
        gridTemplateRows: "repeat(7, minmax(44px, 1fr))",
      }}
    >
      {regions.map((region) => {
        const count = getRoasteriesByRegion(region.slug).length;
        const label = SHORT_LABEL[region.slug] ?? region.label;
        return (
          <Link
            key={region.slug}
            href={`/${region.slug}`}
            title={`${region.label} · 로스터리 ${count}곳`}
            style={{ gridArea: region.slug }}
            className="group flex flex-col items-center justify-center gap-0.5 rounded-lg border border-black/10 bg-black/[.02] text-center transition-colors hover:border-foreground/40 hover:bg-black/[.05] dark:border-white/10 dark:bg-white/[.03] dark:hover:border-foreground/40 dark:hover:bg-white/[.08]"
          >
            <span className="text-sm font-semibold sm:text-base">
              {label}
            </span>
            <span className="text-[11px] text-foreground/50 group-hover:text-foreground/70">
              {count}곳
            </span>
          </Link>
        );
      })}
    </div>
  );
}
