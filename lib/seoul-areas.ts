export interface SeoulArea {
  slug: string;
  label: string;
  keywords: string[];
}

export const seoulAreas: SeoulArea[] = [
  { slug: "seongsu", label: "성수", keywords: ["성수", "왕십리"] },
  { slug: "yeonnam", label: "연남", keywords: ["연남", "연신내"] },
  { slug: "mangwon", label: "망원", keywords: ["망원"] },
  { slug: "hannam", label: "한남", keywords: ["한남", "용산", "이태원", "후암", "삼각지"] },
  { slug: "euljiro", label: "을지로", keywords: ["을지로", "시청", "충무로", "소공동", "약수동", "필동", "광화문"] },
  { slug: "gangnam", label: "강남", keywords: ["강남", "압구정", "신사", "삼성동"] },
  { slug: "hongdae", label: "홍대·합정", keywords: ["홍대", "합정", "상수", "서교"] },
  { slug: "jongno", label: "종로·서촌", keywords: ["서촌", "사직동"] },
];

export function getSeoulAreaSlug(neighborhood: string): string {
  for (const area of seoulAreas) {
    if (area.keywords.some((kw) => neighborhood.includes(kw))) {
      return area.slug;
    }
  }
  return "etc";
}
