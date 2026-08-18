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
  {
    slug: "gwangju",
    label: "전남광주통합특별시",
    description: "동명동・충장로를 중심으로 성장하는 호남권 커피 씬",
  },
  {
    slug: "daejeon",
    label: "대전",
    description: "대흥동・둔산동 일대의 로스터리 카페",
  },
  {
    slug: "daegu",
    label: "대구",
    description: "동성로・삼덕동・수성못 인근 로스터리 카페",
  },
  {
    slug: "incheon",
    label: "인천",
    description: "송도・개항로 일대에서 자라나는 항구도시 커피 씬",
  },
  {
    slug: "gangwon",
    label: "강원특별자치도",
    description: "안목해변・속초를 중심으로 한 커피 여행지",
  },
  {
    slug: "gyeonggi",
    label: "경기도",
    description: "수원・성남・일산 등 수도권 곳곳의 로스터리",
  },
  {
    slug: "gyeongsang",
    label: "경상권",
    description: "울산・창원・경주 등 영남 지역 곳곳의 로스터리",
  },
  {
    slug: "jeolla",
    label: "전라권",
    description: "전주・군산 등 호남 내륙의 로스터리 카페",
  },
  {
    slug: "chungcheong",
    label: "충청권",
    description: "천안・청주・세종 등 충청 지역의 로스터리",
  },
];

export function getRegion(slug: string): RegionMeta | undefined {
  return regions.find((r) => r.slug === slug);
}
