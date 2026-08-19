import { put } from "@vercel/blob";
import { upsertPhotoCache } from "@/lib/db";
import type { Roastery } from "@/types/roastery";

interface PlacePhoto {
  name: string;
  authorAttributions?: {
    displayName?: string;
    uri?: string;
  }[];
}

async function findPhoto(query: string): Promise<PlacePhoto | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.photos",
    },
    body: JSON.stringify({ textQuery: query, languageCode: "ko" }),
  });
  if (!res.ok) return null;

  const data = await res.json();
  return data.places?.[0]?.photos?.[0] ?? null;
}

async function downloadPhoto(photoName: string): Promise<Buffer | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=1000&key=${apiKey}`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) return null;

  return Buffer.from(await res.arrayBuffer());
}

// 구글 Places에서 로스터리 사진을 (다시) 받아와 Vercel Blob에 올리고,
// 저작자 정보와 함께 photo_cache에 기록한다. 구글 이용약관이 요구하는
// 저작자 표시와 30일 이내 재요청을 만족시키기 위한 유일한 경로이므로,
// public/photos 같은 정적 파일로 영구 저장하지 않는다.
export async function refreshRoasteryPhoto(
  roastery: Roastery,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const photo = await findPhoto(`${roastery.name} ${roastery.address}`);
  if (!photo) return { ok: false, reason: "no_photo_found" };

  const buffer = await downloadPhoto(photo.name);
  if (!buffer) return { ok: false, reason: "download_failed" };

  const attribution = photo.authorAttributions?.[0];
  const blob = await put(`google-photos/${roastery.slug}.jpg`, buffer, {
    access: "public",
    contentType: "image/jpeg",
    allowOverwrite: true,
  });

  await upsertPhotoCache(roastery.slug, {
    blobUrl: blob.url,
    authorName: attribution?.displayName ?? null,
    authorUri: attribution?.uri ?? null,
  });

  return { ok: true };
}
