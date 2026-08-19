import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { insertRoasterySuggestion, isDbConfigured } from "@/lib/db";
import { regions } from "@/lib/regions";

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
  const name = formData.get("name");
  const region = formData.get("region");
  const reviewText = formData.get("reviewText");
  const photo = formData.get("photo");
  const photoConsent = formData.get("photoConsent") === "true";

  const trimmedName = typeof name === "string" ? name.trim().slice(0, 80) : "";
  if (!trimmedName) {
    return NextResponse.json(
      { error: "로스터리 이름을 입력해주세요." },
      { status: 400 },
    );
  }

  const trimmedRegion =
    typeof region === "string" && regions.some((r) => r.slug === region)
      ? region
      : null;

  const trimmedReview =
    typeof reviewText === "string" && reviewText.trim()
      ? reviewText.trim().slice(0, 1000)
      : null;

  const hasPhoto = photo instanceof File && photo.size > 0;
  let photoUrl: string | null = null;

  if (hasPhoto) {
    if (!photoConsent) {
      return NextResponse.json(
        { error: "사진 저작권 동의 항목을 체크해주세요." },
        { status: 400 },
      );
    }

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
      `roastery-suggestions/${Date.now()}.${ext}`,
      file,
      { access: "public" },
    );
    photoUrl = blob.url;
  }

  await insertRoasterySuggestion({
    name: trimmedName,
    region: trimmedRegion,
    reviewText: trimmedReview,
    photoUrl,
    photoConsent: hasPhoto ? photoConsent : false,
  });

  return NextResponse.json({ ok: true });
}
