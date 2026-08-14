import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { insertSubmission, isDbConfigured } from "@/lib/db";
import { roasteries } from "@/data/roasteries";

const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "제보 기능이 아직 설정되지 않았습니다." },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const roasterySlug = formData.get("roasterySlug");
  const authorName = formData.get("authorName");
  const reviewText = formData.get("reviewText");
  const photo = formData.get("photo");

  if (typeof roasterySlug !== "string" || !roasteries.some((r) => r.slug === roasterySlug)) {
    return NextResponse.json({ error: "잘못된 로스터리입니다." }, { status: 400 });
  }

  const trimmedReview =
    typeof reviewText === "string" && reviewText.trim() ? reviewText.trim().slice(0, 1000) : null;
  const trimmedAuthor =
    typeof authorName === "string" && authorName.trim() ? authorName.trim().slice(0, 40) : null;

  const hasPhoto = photo instanceof File && photo.size > 0;

  if (!trimmedReview && !hasPhoto) {
    return NextResponse.json(
      { error: "후기 또는 사진 중 하나는 입력해주세요." },
      { status: 400 },
    );
  }

  let photoUrl: string | null = null;

  if (hasPhoto) {
    const file = photo as File;

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "JPG, PNG, WEBP 사진만 업로드할 수 있어요." },
        { status: 400 },
      );
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return NextResponse.json(
        { error: "사진 용량은 8MB 이하로 올려주세요." },
        { status: 400 },
      );
    }

    const ext = file.type.split("/")[1];
    const blob = await put(
      `submissions/${roasterySlug}-${Date.now()}.${ext}`,
      file,
      { access: "public" },
    );
    photoUrl = blob.url;
  }

  await insertSubmission({
    roasterySlug,
    authorName: trimmedAuthor,
    reviewText: trimmedReview,
    photoUrl,
  });

  return NextResponse.json({ ok: true });
}
