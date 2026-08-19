import { neon } from "@neondatabase/serverless";

export interface PhotoCacheEntry {
  blobUrl: string;
  authorName: string | null;
  authorUri: string | null;
  fetchedAt: string;
}

export interface Submission {
  id: number;
  roasterySlug: string;
  authorName: string | null;
  reviewText: string | null;
  photoUrl: string | null;
  rating: number | null;
  status: "pending" | "approved" | "rejected";
  isPrimaryPhoto: boolean;
  photoConsent: boolean;
  createdAt: string;
}

export interface RoasterySuggestion {
  id: number;
  name: string;
  region: string | null;
  reviewText: string | null;
  photoUrl: string | null;
  photoConsent: boolean;
  status: "pending" | "done";
  createdAt: string;
}

function getDatabaseUrl() {
  // Neon's Vercel integration provisions POSTGRES_URL; some setups use
  // DATABASE_URL instead. Accept either.
  return process.env.DATABASE_URL || process.env.POSTGRES_URL;
}

function getSql() {
  const url = getDatabaseUrl();
  if (!url) return null;
  return neon(url);
}

let schemaReady: Promise<void> | null = null;

async function ensureSchema(sql: NonNullable<ReturnType<typeof getSql>>) {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS submissions (
          id SERIAL PRIMARY KEY,
          roastery_slug TEXT NOT NULL,
          author_name TEXT,
          review_text TEXT,
          photo_url TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      // 기존 테이블에는 rating 컬럼이 없을 수 있으므로 별도 마이그레이션.
      await sql`
        ALTER TABLE submissions ADD COLUMN IF NOT EXISTS rating SMALLINT
      `;
      await sql`
        ALTER TABLE submissions ADD COLUMN IF NOT EXISTS is_primary_photo BOOLEAN NOT NULL DEFAULT false
      `;
      // 사진이 첨부된 제보는 촬영자 본인 확인 + 사용 동의 체크박스를
      // 통과해야만 서버에서도 저장되도록, 동의 여부를 함께 기록한다.
      await sql`
        ALTER TABLE submissions ADD COLUMN IF NOT EXISTS photo_consent BOOLEAN NOT NULL DEFAULT false
      `;
      // 구글 Places API 사진 캐시. 저작자 표시 의무 + 30일 이상 캐시 금지
      // 약관을 지키기 위해, 사진은 Vercel Blob에 두고 이 표에는 URL과
      // 저작자 정보, 마지막으로 새로 받아온 시각만 저장한다.
      await sql`
        CREATE TABLE IF NOT EXISTS photo_cache (
          roastery_slug TEXT PRIMARY KEY,
          blob_url TEXT NOT NULL,
          author_name TEXT,
          author_uri TEXT,
          fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      // 아직 사이트에 없는 로스터리를 알려주는 "숨은 로스터리 제보".
      // 기존 submissions(등록된 카페의 사진/후기)와는 별개 표다 — 여기
      // 들어온 항목은 검토 후 사람이 직접 조사해서 data/roasteries.ts에
      // 추가해야 하므로 자동 게시 흐름이 없다.
      await sql`
        CREATE TABLE IF NOT EXISTS roastery_suggestions (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          region TEXT,
          review_text TEXT,
          photo_url TEXT,
          photo_consent BOOLEAN NOT NULL DEFAULT false,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
    })();
  }
  await schemaReady;
}

function mapSuggestionRow(row: Record<string, unknown>): RoasterySuggestion {
  return {
    id: row.id as number,
    name: row.name as string,
    region: row.region as string | null,
    reviewText: row.review_text as string | null,
    photoUrl: row.photo_url as string | null,
    photoConsent: row.photo_consent as boolean,
    status: row.status as RoasterySuggestion["status"],
    createdAt: row.created_at as string,
  };
}

export async function insertRoasterySuggestion(input: {
  name: string;
  region: string | null;
  reviewText: string | null;
  photoUrl: string | null;
  photoConsent: boolean;
}) {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL이 설정되지 않았습니다.");
  await ensureSchema(sql);

  await sql`
    INSERT INTO roastery_suggestions (name, region, review_text, photo_url, photo_consent, status)
    VALUES (${input.name}, ${input.region}, ${input.reviewText}, ${input.photoUrl}, ${input.photoConsent}, 'pending')
  `;
}

export async function getPendingRoasterySuggestions(): Promise<
  RoasterySuggestion[]
> {
  const sql = getSql();
  if (!sql) return [];
  await ensureSchema(sql);

  const rows = await sql`
    SELECT * FROM roastery_suggestions
    WHERE status = 'pending'
    ORDER BY created_at ASC
  `;
  return rows.map(mapSuggestionRow);
}

export async function setRoasterySuggestionDone(id: number) {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL이 설정되지 않았습니다.");
  await ensureSchema(sql);

  await sql`UPDATE roastery_suggestions SET status = 'done' WHERE id = ${id}`;
}

function mapPhotoCacheRow(row: Record<string, unknown>): PhotoCacheEntry {
  return {
    blobUrl: row.blob_url as string,
    authorName: row.author_name as string | null,
    authorUri: row.author_uri as string | null,
    fetchedAt: row.fetched_at as string,
  };
}

export async function upsertPhotoCache(
  roasterySlug: string,
  input: { blobUrl: string; authorName: string | null; authorUri: string | null },
) {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL이 설정되지 않았습니다.");
  await ensureSchema(sql);

  await sql`
    INSERT INTO photo_cache (roastery_slug, blob_url, author_name, author_uri, fetched_at)
    VALUES (${roasterySlug}, ${input.blobUrl}, ${input.authorName}, ${input.authorUri}, now())
    ON CONFLICT (roastery_slug) DO UPDATE SET
      blob_url = EXCLUDED.blob_url,
      author_name = EXCLUDED.author_name,
      author_uri = EXCLUDED.author_uri,
      fetched_at = now()
  `;
}

export async function getPhotoCacheMap(): Promise<
  Record<string, PhotoCacheEntry>
> {
  const sql = getSql();
  if (!sql) return {};
  await ensureSchema(sql);

  const rows = await sql`SELECT * FROM photo_cache`;
  const map: Record<string, PhotoCacheEntry> = {};
  for (const row of rows) {
    map[row.roastery_slug as string] = mapPhotoCacheRow(row);
  }
  return map;
}

export async function getPhotoCacheEntry(
  roasterySlug: string,
): Promise<PhotoCacheEntry | null> {
  const sql = getSql();
  if (!sql) return null;
  await ensureSchema(sql);

  const rows = await sql`
    SELECT * FROM photo_cache WHERE roastery_slug = ${roasterySlug} LIMIT 1
  `;
  return rows.length > 0 ? mapPhotoCacheRow(rows[0]) : null;
}

// 전체 로스터리 슬러그 중 사진을 새로 받아온 지 가장 오래된(또는 아직
// 한 번도 못 받아온) 순서로 limit개를 골라 반환한다. 매일 이 함수로 고른
// 만큼만 갱신하면, 전체 목록을 자연스럽게 30일 주기로 순환하며 새로고침하게 된다.
export async function getStalePhotoSlugs(
  allSlugs: string[],
  limit: number,
): Promise<string[]> {
  const sql = getSql();
  if (!sql) return [];
  await ensureSchema(sql);

  const rows = await sql`SELECT roastery_slug, fetched_at FROM photo_cache`;
  const fetchedAt = new Map<string, number>();
  for (const row of rows) {
    fetchedAt.set(
      row.roastery_slug as string,
      new Date(row.fetched_at as string).getTime(),
    );
  }

  return [...allSlugs]
    .sort((a, b) => (fetchedAt.get(a) ?? 0) - (fetchedAt.get(b) ?? 0))
    .slice(0, limit);
}

function mapRow(row: Record<string, unknown>): Submission {
  return {
    id: row.id as number,
    roasterySlug: row.roastery_slug as string,
    authorName: row.author_name as string | null,
    reviewText: row.review_text as string | null,
    photoUrl: row.photo_url as string | null,
    rating: row.rating as number | null,
    status: row.status as Submission["status"],
    isPrimaryPhoto: row.is_primary_photo as boolean,
    photoConsent: row.photo_consent as boolean,
    createdAt: row.created_at as string,
  };
}

export async function insertSubmission(input: {
  roasterySlug: string;
  authorName: string | null;
  reviewText: string | null;
  photoUrl: string | null;
  rating: number | null;
  photoConsent: boolean;
}) {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL이 설정되지 않았습니다.");
  await ensureSchema(sql);

  await sql`
    INSERT INTO submissions (roastery_slug, author_name, review_text, photo_url, rating, photo_consent, status)
    VALUES (${input.roasterySlug}, ${input.authorName}, ${input.reviewText}, ${input.photoUrl}, ${input.rating}, ${input.photoConsent}, 'pending')
  `;
}

export async function getApprovedSubmissions(
  roasterySlug: string,
): Promise<Submission[]> {
  const sql = getSql();
  if (!sql) return [];
  await ensureSchema(sql);

  const rows = await sql`
    SELECT * FROM submissions
    WHERE roastery_slug = ${roasterySlug} AND status = 'approved'
    ORDER BY created_at DESC
  `;
  return rows.map(mapRow);
}

export async function getPendingSubmissions(): Promise<Submission[]> {
  const sql = getSql();
  if (!sql) return [];
  await ensureSchema(sql);

  const rows = await sql`
    SELECT * FROM submissions
    WHERE status = 'pending'
    ORDER BY created_at ASC
  `;
  return rows.map(mapRow);
}

export async function setSubmissionStatus(
  id: number,
  status: "approved" | "rejected",
) {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL이 설정되지 않았습니다.");
  await ensureSchema(sql);

  await sql`UPDATE submissions SET status = ${status} WHERE id = ${id}`;
}

export async function setPrimaryPhoto(id: number, roasterySlug: string) {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL이 설정되지 않았습니다.");
  await ensureSchema(sql);

  await sql`
    UPDATE submissions SET is_primary_photo = false
    WHERE roastery_slug = ${roasterySlug} AND is_primary_photo = true
  `;
  await sql`
    UPDATE submissions SET is_primary_photo = true, status = 'approved'
    WHERE id = ${id}
  `;
}

export async function getPrimaryPhotoMap(): Promise<Record<string, string>> {
  const sql = getSql();
  if (!sql) return {};
  await ensureSchema(sql);

  const rows = await sql`
    SELECT roastery_slug, photo_url FROM submissions
    WHERE is_primary_photo = true AND status = 'approved' AND photo_url IS NOT NULL
  `;
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.roastery_slug as string] = row.photo_url as string;
  }
  return map;
}

export async function getPrimaryPhotoUrl(
  roasterySlug: string,
): Promise<string | null> {
  const sql = getSql();
  if (!sql) return null;
  await ensureSchema(sql);

  const rows = await sql`
    SELECT photo_url FROM submissions
    WHERE roastery_slug = ${roasterySlug} AND is_primary_photo = true AND status = 'approved' AND photo_url IS NOT NULL
    LIMIT 1
  `;
  return rows.length > 0 ? (rows[0].photo_url as string) : null;
}

export function isDbConfigured() {
  return !!getDatabaseUrl();
}
