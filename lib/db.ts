import { neon } from "@neondatabase/serverless";

export interface Submission {
  id: number;
  roasterySlug: string;
  authorName: string | null;
  reviewText: string | null;
  photoUrl: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

let schemaReady: Promise<void> | null = null;

async function ensureSchema(sql: NonNullable<ReturnType<typeof getSql>>) {
  if (!schemaReady) {
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        roastery_slug TEXT NOT NULL,
        author_name TEXT,
        review_text TEXT,
        photo_url TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `.then(() => undefined);
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
    status: row.status as Submission["status"],
    createdAt: row.created_at as string,
  };
}

export async function insertSubmission(input: {
  roasterySlug: string;
  authorName: string | null;
  reviewText: string | null;
  photoUrl: string | null;
}) {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL이 설정되지 않았습니다.");
  await ensureSchema(sql);

  await sql`
    INSERT INTO submissions (roastery_slug, author_name, review_text, photo_url, status)
    VALUES (${input.roasterySlug}, ${input.authorName}, ${input.reviewText}, ${input.photoUrl}, 'pending')
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

export function isDbConfigured() {
  return !!process.env.DATABASE_URL;
}
