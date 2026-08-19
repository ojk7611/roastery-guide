import type { Roastery } from "@/types/roastery";

// 카드에 붙는 영문 배지. tags/signature에 이미 있는 실제 키워드만 보고
// 붙이므로 지어내는 정보가 아니다. 카드당 최대 2개까지만 보여준다.
const BADGE_RULES: { label: string; keywords: string[] }[] = [
  { label: "HAND DRIP", keywords: ["핸드드립"] },
  { label: "FILTER", keywords: ["필터커피", "필터"] },
  { label: "SPECIALTY", keywords: ["스페셜티"] },
  { label: "ROASTERY", keywords: ["직접로스팅", "로스터리"] },
];

export function getHotBadges(roastery: Roastery): string[] {
  const haystack = [...roastery.tags, ...roastery.signature].join(" ");
  const badges: string[] = [];
  for (const rule of BADGE_RULES) {
    if (rule.keywords.some((kw) => haystack.includes(kw))) {
      badges.push(rule.label);
    }
    if (badges.length === 2) break;
  }
  return badges;
}

function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export interface ReviewStats {
  count: number;
  avgRating: number | null;
}

// 지금 기준: 승인된 후기·별점이 많고 평점이 높은 곳을 우선한다(실제
// 참여 신호). 후기가 아직 없는 곳끼리는 날짜를 시드로 한 결정적 순서로
// 채워서, 섹션이 매번 비어 보이지 않으면서도 하루 단위로는 항상 같은
// 카드가 뜨게 한다. 나중에 조회수·검색량·인스타 언급량 등을 더하면
// 이 함수의 정렬 기준만 바꾸면 된다.
export function pickHotRoasteries(
  roasteries: Roastery[],
  reviewStats: Record<string, ReviewStats>,
  count: number,
): Roastery[] {
  const today = new Date();
  const daySeed =
    today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  const candidates = roasteries
    .map((roastery) => ({
      roastery,
      badges: getHotBadges(roastery),
      stats: reviewStats[roastery.slug] ?? { count: 0, avgRating: null },
      rand: seededRandom(daySeed + hashString(roastery.slug)),
    }))
    .filter((c) => c.badges.length > 0);

  candidates.sort((a, b) => {
    if (b.stats.count !== a.stats.count) return b.stats.count - a.stats.count;
    const aRating = a.stats.avgRating ?? 0;
    const bRating = b.stats.avgRating ?? 0;
    if (bRating !== aRating) return bRating - aRating;
    return a.rand - b.rand;
  });

  return candidates.slice(0, count).map((c) => c.roastery);
}
