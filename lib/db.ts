import { neon } from "@neondatabase/serverless";

export interface Submission {
  id: number;
  roasterySlug: string;
  authorName: string | null;
  reviewText: string | null;
  photoUrl: string | null;
  rating: number | null;
  status: "pending" | "approved" | "rejected";
  isPrimaryPhoto: boolean;
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
    })();
  }
  await schemaReady;
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
    createdAt: row.created_at as string,
  };
}

export async function insertSubmission(input: {
  roasterySlug: string;
  authorName: string | null;
  reviewText: string | null;
  photoUrl: string | null;
  rating: number | null;
}) {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL이 설정되지 않았습니다.");
  await ensureSchema(sql);

  await sql`
    INSERT INTO submissions (roastery_slug, author_name, review_text, photo_url, rating, status)
    VALUES (${input.roasterySlug}, ${input.authorName}, ${input.reviewText}, ${input.photoUrl}, ${input.rating}, 'pending')
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
