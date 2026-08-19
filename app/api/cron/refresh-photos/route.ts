import { NextRequest, NextResponse } from "next/server";
import { roasteries } from "@/data/roasteries";
import { getStalePhotoSlugs, isDbConfigured } from "@/lib/db";
import { refreshRoasteryPhoto } from "@/lib/google-photos";

// Vercel Cron이 매일 호출해 가장 오래 전에 받아온 사진부터 순서대로
// 다시 받아온다. 하루 BATCH_SIZE개씩만 처리해서 전체 목록이 자연스럽게
// 30일 이내로 순환하며, 구글 Places API 이용약관의 "30일 이상 캐시 금지"
// 요건을 지킨다.
export const maxDuration = 60;

const BATCH_SIZE = 15;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_URL이 설정되지 않았습니다." },
      { status: 503 },
    );
  }

  const allSlugs = roasteries.map((r) => r.slug);
  const targetSlugs = await getStalePhotoSlugs(allSlugs, BATCH_SIZE);
  const bySlug = new Map(roasteries.map((r) => [r.slug, r]));

  const results = [];
  for (const slug of targetSlugs) {
    const roastery = bySlug.get(slug);
    if (!roastery) continue;
    const result = await refreshRoasteryPhoto(roastery);
    results.push({ slug, ...result });
  }

  const ok = results.filter((r) => r.ok).length;
  return NextResponse.json({ processed: results.length, ok, results });
}
