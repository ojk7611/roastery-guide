import type { RegionMeta } from "@/types/roastery";

export const regions: RegionMeta[] = [
  {
    slug: "seoul",
    label: "서울",
    description: "성수・망원・연남 등 스페셜티 로스터리가 밀집한 도심 씬",
  },
  {
    slug: "busan",
    label: "부산",
    description: "전포・해리단길 중심으로 확장 중인 바다 도시의 커피 씬",
  },
  {
    slug: "jeju",
    label: "제주",
    description: "여행자와 로컬이 함께 찾는 자연 속 로스터리",
  },
];

export function getRegion(slug: string): RegionMeta | undefined {
  return regions.find((r) => r.slug === slug);
}
