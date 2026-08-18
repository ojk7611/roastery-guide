// data/roasteries.ts 에서 kakaoUrl과 officialLink가 둘 다 없는 항목을 찾아
// 카카오 로컬 API로 place_url을 검색해 kakaoUrl을 채워 넣는 마이그레이션 스크립트.
//
// 사용법: npm run add-kakao-urls
//
// 이름 + 전체 주소로 검색하면 too-specific해서 실패하는 경우가 많아
// 이름 + 동네(괄호 안 내용 제외)로 검색한다. 실패하면 이름만으로 재시도한다.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

try {
  process.loadEnvFile?.(".env.local");
} catch {
  // .env.local is optional
}

const REST_API_KEY = process.env.KAKAO_REST_API_KEY;
if (!REST_API_KEY) {
  console.error("KAKAO_REST_API_KEY 환경변수가 없습니다. .env.local을 확인하세요.");
  process.exit(1);
}

const REQUEST_DELAY_MS = 200;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function searchPlaceUrl(query) {
  const url = new URL("https://dapi.kakao.com/v2/local/search/keyword.json");
  url.searchParams.set("query", query);
  url.searchParams.set("size", "5");
  url.searchParams.set("category_group_code", "CE7");

  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${REST_API_KEY}` },
  });
  if (!res.ok) return null;

  const data = await res.json();
  return data.documents[0] ?? null;
}

async function main() {
  const filePath = path.join(import.meta.dirname, "..", "data", "roasteries.ts");
  let text = await readFile(filePath, "utf-8");

  const dataModule = await import(`file://${filePath}?t=${Date.now()}`);
  const roasteries = dataModule.roasteries;

  const targets = roasteries.filter((r) => !r.kakaoUrl && !r.officialLink);
  console.log(`대상: ${targets.length}곳`);

  let filled = 0;
  let failed = [];

  for (const r of targets) {
    const shortNeighborhood = r.neighborhood.replace(/\([^)]*\)/g, "").trim();
    const queries = [
      `${r.name} ${shortNeighborhood}`,
      r.name,
    ];

    let match = null;
    for (const q of queries) {
      match = await searchPlaceUrl(q);
      await sleep(REQUEST_DELAY_MS);
      if (match) break;
    }

    if (!match || !match.place_url) {
      console.log(`  [실패] ${r.id} ${r.name}`);
      failed.push(`${r.id} ${r.name}`);
      continue;
    }

    // id 블록을 찾아 source: 라인 뒤에 kakaoUrl을 삽입
    const idPattern = new RegExp(
      `(id: "${r.id}",[\\s\\S]*?source: "[^"]*",\\n)(\\s*\\},)`,
    );
    if (!idPattern.test(text)) {
      console.log(`  [경고] id 블록을 찾지 못함: ${r.id}`);
      failed.push(`${r.id} ${r.name} (블록 못찾음)`);
      continue;
    }

    text = text.replace(
      idPattern,
      `$1    kakaoUrl: "${match.place_url}",\n$2`,
    );
    filled++;
    console.log(`  [성공] ${r.id} ${r.name} -> ${match.place_url}`);
  }

  await writeFile(filePath, text, "utf-8");
  console.log(`\n완료: ${filled}/${targets.length}곳 채움`);
  if (failed.length) {
    console.log(`실패 목록 (${failed.length}):`);
    console.log(failed.join("\n"));
  }
}

main();
