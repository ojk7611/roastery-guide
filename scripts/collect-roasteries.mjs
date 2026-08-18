// 카카오 로컬 API(키워드 검색)로 지역별 로스터리 후보를 모아
// data/collected/{region}.json 에 저장하는 수집 스크립트.
//
// 사용법:
//   1) https://developers.kakao.com/console/app 에서 애플리케이션 생성
//      "앱 키" 탭에서 REST API 키 확인 (환경/도메인 등록 불필요)
//   2) 프로젝트 루트에 .env.local 생성:
//        KAKAO_REST_API_KEY=...
//   3) npm run collect            (전체 지역)
//      npm run collect -- seoul   (특정 지역만)
//
// 출력은 위치 정보(이름/주소/좌표/카테고리)만 담긴 "후보" 데이터입니다.
// 영업시간은 API가 제공하지 않고, 블로그 후기 같은 콘텐츠 보강도 이 스크립트
// 범위 밖입니다(별도로 채워 넣으세요). 항목이 실제 로스터리인지도 검증되지
// 않았으므로(needsReview: true), data/roasteries.ts 로 옮기기 전에 반드시
// 사람이 확인해야 합니다.

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

try {
  process.loadEnvFile?.(".env.local");
} catch {
  // .env.local is optional — credentials may already be in the environment.
}

const REST_API_KEY = process.env.KAKAO_REST_API_KEY;

if (!REST_API_KEY) {
  console.error(
    "KAKAO_REST_API_KEY 환경변수가 없습니다. .env.local을 확인하세요.",
  );
  process.exit(1);
}

const REGION_QUERIES = {
  seoul: [
    "강남 로스터리 카페",
    "압구정 로스터리 카페",
    "신사동 로스터리 카페",
    "왕십리 로스터리 카페",
    "후암동 로스터리 카페",
    "성북동 로스터리 카페",
    "잠실 로스터리 카페",
    "여의도 로스터리 카페",
  ],
  busan: [
    "다대포 로스터리 카페",
    "초량 로스터리 카페",
    "국제시장 로스터리 카페",
    "명지 로스터리 카페",
    "부산 미포 로스터리 카페",
  ],
  jeju: [
    "김녕 로스터리 카페",
    "세화 로스터리 카페",
    "중문 로스터리 카페",
    "노형 로스터리 카페",
    "삼양 로스터리 카페",
  ],
  gwangju: [
    "각화동 로스터리 카페",
    "지산동 로스터리 카페",
    "풍암동 로스터리 카페",
    "광주 광산구 로스터리 카페",
  ],
  daejeon: [
    "노은동 로스터리 카페",
    "문화동 로스터리 카페",
    "대전 중앙로 로스터리 카페",
  ],
  daegu: [
    "대명동 로스터리 카페",
    "이시아폴리스 로스터리 카페",
    "봉덕동 로스터리 카페",
    "산격동 로스터리 카페",
  ],
};

const REQUEST_DELAY_MS = 200;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function searchLocal(query) {
  const url = new URL("https://dapi.kakao.com/v2/local/search/keyword.json");
  url.searchParams.set("query", query);
  url.searchParams.set("size", "15");
  url.searchParams.set("category_group_code", "CE7"); // 카페

  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${REST_API_KEY}` },
  });

  if (!res.ok) {
    console.warn(`  [경고] 검색 실패 (${res.status}): ${query}`);
    return [];
  }

  const data = await res.json();
  return data.documents.map((doc) => ({
    name: doc.place_name,
    category: doc.category_name,
    address: doc.address_name,
    roadAddress: doc.road_address_name || doc.address_name,
    lat: Number(doc.y),
    lng: Number(doc.x),
    phone: doc.phone || null,
    sourceLink: doc.place_url || null,
  }));
}

async function collectRegion(region, queries) {
  console.log(`\n=== ${region} ===`);
  const byAddress = new Map();

  for (const query of queries) {
    console.log(`  검색: ${query}`);
    const results = await searchLocal(query);

    for (const place of results) {
      if (byAddress.has(place.roadAddress)) continue;

      byAddress.set(place.roadAddress, {
        region,
        neighborhood: query.replace(/\s*로스터리.*$|\s*카페.*$/, ""),
        name: place.name,
        category: place.category,
        address: place.address,
        roadAddress: place.roadAddress,
        lat: place.lat,
        lng: place.lng,
        phone: place.phone,
        sourceLink: place.sourceLink,
        blogExcerpt: null,
        blogSource: null,
        hours: null,
        needsReview: true,
        collectedAt: new Date().toISOString(),
      });
    }

    await sleep(REQUEST_DELAY_MS);
  }

  return [...byAddress.values()];
}

async function main() {
  const onlyRegion = process.argv[2];
  const regions = onlyRegion ? [onlyRegion] : Object.keys(REGION_QUERIES);

  const outDir = path.join(import.meta.dirname, "..", "data", "collected");
  await mkdir(outDir, { recursive: true });

  for (const region of regions) {
    const queries = REGION_QUERIES[region];
    if (!queries) {
      console.error(
        `알 수 없는 지역: ${region} (${Object.keys(REGION_QUERIES).join(" | ")})`,
      );
      continue;
    }

    const items = await collectRegion(region, queries);
    const outPath = path.join(outDir, `${region}.json`);
    await writeFile(outPath, JSON.stringify(items, null, 2), "utf-8");
    console.log(`  -> ${items.length}곳 저장: ${outPath}`);
  }
}

main();
