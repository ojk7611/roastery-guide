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
  busan: [
    { slug: "jeonpo", label: "전포", keywords: ["전포"] },
    { slug: "gwangalli", label: "광안리", keywords: ["광안리", "남천"] },
    { slug: "haeundae", label: "해운대", keywords: ["해운대", "해리단길"] },
    {
      slug: "wondosim",
      label: "남포·중앙동",
      keywords: ["남포", "중앙동", "40계단", "부민동", "영도"],
    },
    {
      slug: "dongnae-geumjeong",
      label: "동래·금정",
      keywords: ["동래", "온천장", "장전", "만덕", "금정"],
    },
    { slug: "myeongji", label: "명지", keywords: ["명지"] },
    { slug: "seogu", label: "암남·송도", keywords: ["암남", "송도", "서구"] },
  ],
  gwangju: [
    { slug: "dongmyeong", label: "동명동", keywords: ["동명동"] },
    { slug: "sangmu", label: "상무지구", keywords: ["상무지구", "농성동"] },
    { slug: "cheomdan", label: "첨단지구", keywords: ["첨단지구"] },
    { slug: "baekwoon", label: "백운동", keywords: ["백운동"] },
    { slug: "sansu-jisan", label: "산수·지산동", keywords: ["산수동", "지산동"] },
    { slug: "chungjangno", label: "충장로", keywords: ["충장로"] },
    { slug: "hwajeong", label: "화정동", keywords: ["화정동"] },
  ],
  jeju: [
    { slug: "aewol", label: "애월", keywords: ["애월"] },
    { slug: "nohyeong", label: "노형동", keywords: ["노형동", "원노형"] },
    { slug: "gujwa", label: "구좌", keywords: ["구좌"] },
    { slug: "jocheon", label: "조천", keywords: ["조천"] },
    { slug: "hallim", label: "한림·협재", keywords: ["한림", "협재"] },
    { slug: "seogwipo", label: "서귀포", keywords: ["서귀포", "성산읍", "법환동", "표선"] },
    { slug: "jejusi", label: "제주시", keywords: ["제주시", "공항", "화북동", "영평동"] },
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
