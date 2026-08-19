// KOSTAT 2018 시도 경계(southkorea/southkorea-maps)를 이 앱의 12개 지역으로
// 병합해 lib/region-map-data.ts를 재생성하는 스크립트.
//
// 시도(11~39) → 앱 지역 매핑은 REGION_GROUPS에서 관리한다. 여러 시도를
// 하나의 앱 지역으로 묶을 때는 topojson-client의 merge()로 내부 경계를
// 지워서(topological dissolve) 이음새가 보이지 않게 한다.
//
// 사용법: node scripts/generate-region-map.mjs
// 원본 데이터를 매번 GitHub에서 새로 내려받으므로 네트워크 연결이 필요하다.

import { writeFile } from "node:fs/promises";
import { geoMercator, geoPath } from "d3-geo";
import { topology } from "topojson-server";
import { presimplify, simplify, quantile } from "topojson-simplify";
import { feature, merge } from "topojson-client";

const SOURCE_URL =
  "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-provinces-2018-geo.json";

const MAP_WIDTH = 520;
const MAP_HEIGHT = 640;
const PADDING = 14;

// KOSTAT 시도 code -> 앱 지역 slug
const REGION_GROUPS = {
  seoul: ["11"],
  busan: ["21"],
  daegu: ["22"],
  incheon: ["23"],
  gwangju: ["24"],
  daejeon: ["25"],
  gyeonggi: ["31"],
  gangwon: ["32"],
  chungcheong: ["29", "33", "34"], // 세종 + 충북 + 충남
  jeolla: ["35", "36"], // 전북 + 전남
  gyeongsang: ["26", "37", "38"], // 울산 + 경북 + 경남
  jeju: ["39"],
};

const RENDER_ORDER = [
  "gwangju",
  "jeolla",
  "chungcheong",
  "gyeongsang",
  "gyeonggi",
  "gangwon",
  "jeju",
  "busan",
  "incheon",
  "daegu",
  "seoul",
  "daejeon",
];

// 신발끈 공식으로 폴리곤 외곽선 면적(부호 없는, 원본 좌표계 기준)을 구한다.
function ringArea(ring) {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}

// 아주 작은 부속 섬은 지도를 어지럽히고 파일 크기만 키우므로, 각 시도의
// 가장 큰 폴리곤 대비 면적이 너무 작은 폴리곤(외곽선 기준)은 제거한다.
function dropTinyIslands(geometry, minAreaRatio = 0.003) {
  if (geometry.type !== "MultiPolygon") return geometry;
  const areas = geometry.coordinates.map((poly) => ringArea(poly[0]));
  const maxArea = Math.max(...areas);
  const kept = geometry.coordinates.filter(
    (_, i) => areas[i] >= maxArea * minAreaRatio,
  );
  return { type: "MultiPolygon", coordinates: kept };
}

// 단순화 이후에도 투영 좌표(픽셀) 기준으로 너무 작게 뭉개진 조각(섬이든
// 구멍이든, 간소화 부산물)은 지도에서 알아볼 수 없으므로 한 번 더 제거한다.
function projectedBBox(ring, projection) {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const point of ring) {
    const p = projection(point);
    if (!p) continue;
    const [x, y] = p;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { width: maxX - minX, height: maxY - minY };
}

function isRingTiny(ring, projection, minPixels) {
  const { width, height } = projectedBBox(ring, projection);
  return width < minPixels && height < minPixels;
}

function cleanGeometry(geometry, projection, minPixels = 2.5) {
  if (geometry.type === "Polygon") {
    const [outer, ...holes] = geometry.coordinates;
    if (isRingTiny(outer, projection, minPixels)) return null;
    const keptHoles = holes.filter((h) => !isRingTiny(h, projection, minPixels));
    return { type: "Polygon", coordinates: [outer, ...keptHoles] };
  }
  if (geometry.type === "MultiPolygon") {
    const keptPolys = geometry.coordinates
      .map(([outer, ...holes]) => {
        if (isRingTiny(outer, projection, minPixels)) return null;
        const keptHoles = holes.filter((h) => !isRingTiny(h, projection, minPixels));
        return [outer, ...keptHoles];
      })
      .filter((p) => p !== null);
    if (keptPolys.length === 0) return null;
    return { type: "MultiPolygon", coordinates: keptPolys };
  }
  return geometry;
}

async function main() {
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`소스 다운로드 실패: ${res.status}`);
  const sourceGeo = await res.json();
  for (const f of sourceGeo.features) {
    f.geometry = dropTinyIslands(f.geometry);
  }

  const projection = geoMercator().fitExtent(
    [
      [PADDING, PADDING],
      [MAP_WIDTH - PADDING, MAP_HEIGHT - PADDING],
    ],
    sourceGeo,
  );
  const path = geoPath(projection).digits(1);

  // 시도 단위 topology를 만들어 병합 시 내부 경계를 지울 수 있게 한다.
  let topo = topology({ provinces: sourceGeo });
  topo = presimplify(topo);
  const SIMPLIFY_QUANTILE = Number(process.env.SIMPLIFY_QUANTILE ?? "0.0006");
  topo = simplify(topo, quantile(topo, SIMPLIFY_QUANTILE));

  const objects = topo.objects.provinces.geometries;

  const REGION_PATHS = {};
  const REGION_CENTROIDS = {};

  for (const [slug, codes] of Object.entries(REGION_GROUPS)) {
    const parts = objects.filter((g) => codes.includes(g.properties.code));
    if (parts.length === 0) {
      throw new Error(`${slug}: 매칭되는 시도가 없음 (${codes.join(",")})`);
    }

    let geom =
      parts.length === 1
        ? feature(topo, parts[0]).geometry
        : merge(topo, parts);
    geom = cleanGeometry(geom, projection) ?? geom;

    const d = path(geom);
    const [cx, cy] = path.centroid(geom);

    REGION_PATHS[slug] = d;
    REGION_CENTROIDS[slug] = [
      Math.round(cx * 10) / 10,
      Math.round(cy * 10) / 10,
    ];
  }

  const missing = RENDER_ORDER.filter((slug) => !REGION_PATHS[slug]);
  if (missing.length > 0) {
    throw new Error(`RENDER_ORDER에 있지만 생성되지 않은 지역: ${missing}`);
  }

  const out = `// 자동 생성됨: KOSTAT 2018 시도 경계(southkorea/southkorea-maps)를 d3-geo(Mercator)로
// 투영하고 topojson-simplify로 단순화한 뒤, 앱의 12개 지역으로 병합한 좌표.
// 재생성: node scripts/generate-region-map.mjs
export const MAP_WIDTH = ${MAP_WIDTH};
export const MAP_HEIGHT = ${MAP_HEIGHT};

export const REGION_PATHS: Record<string, string> = {
${Object.entries(REGION_PATHS)
  .map(([slug, d]) => `  ${slug}: ${JSON.stringify(d)},`)
  .join("\n")}
};

export const REGION_CENTROIDS: Record<string, [number, number]> = {
${Object.entries(REGION_CENTROIDS)
  .map(([slug, [cx, cy]]) => `  ${slug}: [${cx}, ${cy}],`)
  .join("\n")}
};

export const REGION_RENDER_ORDER = ${JSON.stringify(RENDER_ORDER)} as const;
`;

  await writeFile(
    new URL("../lib/region-map-data.ts", import.meta.url),
    out,
    "utf8",
  );

  console.log("lib/region-map-data.ts 재생성 완료");
  for (const slug of RENDER_ORDER) {
    const d = REGION_PATHS[slug];
    const nums = d.match(/-?\d+\.?\d*/g).map(Number);
    const xs = nums.filter((_, i) => i % 2 === 0);
    const ys = nums.filter((_, i) => i % 2 === 1);
    console.log(
      `  ${slug}: bbox x[${Math.min(...xs).toFixed(0)},${Math.max(...xs).toFixed(0)}] y[${Math.min(...ys).toFixed(0)},${Math.max(...ys).toFixed(0)}]`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
