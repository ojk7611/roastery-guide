// Google Places API(New)로 각 로스터리의 대표 사진을 한 번 내려받아
// public/photos/{slug}.jpg 에 저장하는 스크립트.
//
// 사용법:
//   1) https://console.cloud.google.com/ 에서 프로젝트 생성 →
//      "Places API (New)" 활성화 → API 키 발급
//      (무료 크레딧 $200/월 안에서 이 정도 규모는 충분히 커버됨)
//   2) 프로젝트 루트 .env.local에 추가:
//        GOOGLE_PLACES_API_KEY=...
//   3) npm run fetch-photos            (전체)
//      npm run fetch-photos -- seoul   (특정 지역만)
//
// 구글 지도에 등록되지 않은 소규모 카페는 사진을 못 찾을 수 있다.
// 그런 경우 public/photos/{slug}.jpg가 생성되지 않고, 화면에서는
// RoasteryPhoto 컴포넌트가 자동으로 플레이스홀더를 보여준다.

import { writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { roasteries } from "../data/roasteries.ts";

try {
  process.loadEnvFile?.(".env.local");
} catch {
  // .env.local is optional — credentials may already be in the environment.
}

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

if (!API_KEY) {
  console.error(
    "GOOGLE_PLACES_API_KEY 환경변수가 없습니다. .env.local을 확인하세요.",
  );
  process.exit(1);
}

const REQUEST_DELAY_MS = 300;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function findPhotoName(query) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.photos",
    },
    body: JSON.stringify({ textQuery: query, languageCode: "ko" }),
  });

  if (!res.ok) {
    console.warn(`  [경고] 검색 실패 (${res.status}): ${query}`);
    return null;
  }

  const data = await res.json();
  const place = data.places?.[0];
  const photo = place?.photos?.[0];
  return photo?.name ?? null;
}

async function downloadPhoto(photoName, outPath) {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=1000&key=${API_KEY}`;
  const res = await fetch(url, { redirect: "follow" });

  if (!res.ok) {
    console.warn(`  [경고] 사진 다운로드 실패 (${res.status})`);
    return false;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(outPath, buffer);
  return true;
}

async function fileExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const onlyRegion = process.argv[2];
  const targets = onlyRegion
    ? roasteries.filter((r) => r.region === onlyRegion)
    : roasteries;

  const outDir = path.join(import.meta.dirname, "..", "public", "photos");
  await mkdir(outDir, { recursive: true });

  let found = 0;
  let skipped = 0;
  let missing = 0;

  for (const roastery of targets) {
    const outPath = path.join(outDir, `${roastery.slug}.jpg`);

    if (await fileExists(outPath)) {
      skipped++;
      continue;
    }

    const query = `${roastery.name} ${roastery.address}`;
    const photoName = await findPhotoName(query);
    await sleep(REQUEST_DELAY_MS);

    if (!photoName) {
      console.log(`  없음: ${roastery.name}`);
      missing++;
      continue;
    }

    const ok = await downloadPhoto(photoName, outPath);
    await sleep(REQUEST_DELAY_MS);

    if (ok) {
      console.log(`  저장: ${roastery.name}`);
      found++;
    } else {
      missing++;
    }
  }

  console.log(
    `\n완료 — 새로 저장 ${found}곳 / 이미 있음 ${skipped}곳 / 못 찾음 ${missing}곳`,
  );
}

main();
