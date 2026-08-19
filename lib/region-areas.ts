import type { Region } from "@/types/roastery";

export interface RegionArea {
  slug: string;
  label: string;
  keywords: string[];
}

export const REGION_AREAS: Partial<Record<Region, RegionArea[]>> = {
  seoul: [
    { slug: "seongsu", label: "성수", keywords: ["성수", "왕십리"] },
    { slug: "yeonnam", label: "연남", keywords: ["연남", "연신내"] },
    { slug: "mangwon", label: "망원", keywords: ["망원"] },
    { slug: "hannam", label: "한남", keywords: ["한남", "용산", "이태원", "후암", "삼각지"] },
    { slug: "euljiro", label: "을지로", keywords: ["을지로", "시청", "충무로", "소공동", "약수동", "필동", "광화문"] },
    { slug: "gangnam", label: "강남", keywords: ["강남", "압구정", "신사", "삼성동"] },
    { slug: "hongdae", label: "홍대·합정", keywords: ["홍대", "합정", "상수", "서교"] },
    { slug: "jongno", label: "종로·서촌", keywords: ["서촌", "사직동"] },
  ],
  jeolla: [
    { slug: "jeonju", label: "전주", keywords: ["전주"] },
    { slug: "gunsan", label: "군산", keywords: ["군산"] },
    { slug: "yeosu", label: "여수", keywords: ["여수"] },
    { slug: "suncheon", label: "순천", keywords: ["순천"] },
    { slug: "mokpo", label: "목포", keywords: ["목포"] },
  ],
};

export const ETC_LABEL: Partial<Record<Region, string>> = {
  jeolla: "그외",
};

export function getAreaSlug(
  region: Region,
  roastery: { neighborhood: string; address: string; name: string },
): string {
  const areas = REGION_AREAS[region];
  if (!areas) return "etc";

  const haystack = `${roastery.neighborhood} ${roastery.address} ${roastery.name}`;
  for (const area of areas) {
    if (area.keywords.some((kw) => haystack.includes(kw))) {
      return area.slug;
    }
  }
  return "etc";
}
