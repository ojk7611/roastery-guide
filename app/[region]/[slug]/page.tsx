import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRegion } from "@/lib/regions";
import { getRoastery, getRoasteriesByRegion } from "@/data/roasteries";
import { SITE_URL } from "@/lib/site";
import { getPrimaryPhotoUrl, getPhotoCacheEntry } from "@/lib/db";
import { extractClosedDay } from "@/lib/hours";
import { REGION_AREAS, ETC_LABEL, getAreaSlug } from "@/lib/region-areas";
import KakaoMap from "@/components/KakaoMap";
import RoasteryPhoto from "@/components/RoasteryPhoto";
import RoasteryReviews from "@/components/RoasteryReviews";
import RoasteryListSection from "@/components/RoasteryListSection";
import SubmissionForm from "@/components/SubmissionForm";
import type { Region } from "@/types/roastery";

function findArea(region: Region, slug: string) {
  if (slug === "etc") return { slug: "etc", label: null as string | null };
  const area = REGION_AREAS[region]?.find((a) => a.slug === slug);
  return area ? { slug: area.slug, label: area.label } : null;
}

async function photoUrl(slug: string) {
  const primary = await getPrimaryPhotoUrl(slug);
  if (primary) return primary;
  const cached = await getPhotoCacheEntry(slug);
  return cached?.blobUrl ?? `${SITE_URL}/brand/flower-mark.png`;
}

export async function generateMetadata(
  props: PageProps<"/[region]/[slug]">,
): Promise<Metadata> {
  const { region: regionSlug, slug } = await props.params;
  const region = getRegion(regionSlug);
  if (!region) return {};

  const area = findArea(region.slug, slug);
  if (area) {
    const label = area.label ?? ETC_LABEL[region.slug] ?? "기타";
    const count = getRoasteriesByRegion(region.slug).filter(
      (r) => getAreaSlug(region.slug, r) === area.slug,
    ).length;
    const title = `${label} 로스터리·드립커피 카페 ${count}곳`;
    const description = `${region.label} ${label} 지역의 핸드드립·필터커피 로스터리 카페 ${count}곳을 위치, 영업시간, 시그니처 메뉴와 함께 모았습니다.`;
    const url = `/${region.slug}/${slug}`;

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: { title, description, url },
      twitter: { title, description },
    };
  }

  const roastery = getRoastery(region.slug, slug);
  if (!roastery) return {};

  const title = `${roastery.name} - ${region.label} ${roastery.neighborhood}`;
  const description = `${roastery.description} 주소: ${roastery.address}. 영업시간: ${roastery.hours}.`;
  const url = `/${region.slug}/${roastery.slug}`;
  const image = await photoUrl(roastery.slug);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, images: [image] },
    twitter: { title, description, images: [image] },
  };
}

export default async function RegionSlugPage(
  props: PageProps<"/[region]/[slug]">,
) {
  const { region: regionSlug, slug } = await props.params;
  const region = getRegion(regionSlug);
  if (!region) notFound();

  const area = findArea(region.slug, slug);
  if (area) {
    const label = area.label ?? ETC_LABEL[region.slug] ?? "기타";
    const allAreas = REGION_AREAS[region.slug] ?? [];
    const roasteries = getRoasteriesByRegion(region.slug).filter(
      (r) => getAreaSlug(region.slug, r) === area.slug,
    );

    return (
      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm text-foreground/50">{region.label}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {label} 로스터리·드립커피 카페
        </h1>
        <p className="mt-2 text-foreground/70">
          {region.label} {label} 지역의 핸드드립·필터커피 로스터리 카페 {roasteries.length}곳
        </p>

        <nav
          aria-label={`${region.label} 세부 지역`}
          className="mt-6 flex flex-wrap gap-2 text-sm"
        >
          <Link
            href={`/${region.slug}`}
            className="rounded-full bg-black/5 px-3 py-1.5 text-foreground/70 transition-colors hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
          >
            전체
          </Link>
          {allAreas.map((a) => (
            <Link
              key={a.slug}
              href={`/${region.slug}/${a.slug}`}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                a.slug === area.slug
                  ? "bg-foreground text-background"
                  : "bg-black/5 text-foreground/70 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
              }`}
            >
              {a.label}
            </Link>
          ))}
          <Link
            href={`/${region.slug}/etc`}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              area.slug === "etc"
                ? "bg-foreground text-background"
                : "bg-black/5 text-foreground/70 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
            }`}
          >
            {ETC_LABEL[region.slug] ?? "기타"}
          </Link>
        </nav>

        <RoasteryListSection roasteries={roasteries} />
      </div>
    );
  }

  const roastery = getRoastery(region.slug, slug);
  if (!roastery) notFound();

  const [primaryPhotoUrl, photoCacheEntry] = await Promise.all([
    getPrimaryPhotoUrl(roastery.slug),
    getPhotoCacheEntry(roastery.slug),
  ]);
  const image =
    primaryPhotoUrl ?? photoCacheEntry?.blobUrl ?? `${SITE_URL}/brand/flower-mark.png`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: roastery.name,
    description: roastery.description,
    image,
    url: `${SITE_URL}/${region.slug}/${roastery.slug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: roastery.address,
      addressCountry: "KR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: roastery.lat,
      longitude: roastery.lng,
    },
    servesCuisine: "Coffee",
    menu: roastery.signature.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm text-foreground/50">
          {region.label} · {roastery.neighborhood}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {roastery.name}
        </h1>

        <RoasteryPhoto
          slug={roastery.slug}
          name={roastery.name}
          className="relative mt-6 h-64 w-full"
          overrideUrl={primaryPhotoUrl}
          googlePhoto={
            photoCacheEntry
              ? {
                  url: photoCacheEntry.blobUrl,
                  authorName: photoCacheEntry.authorName,
                  authorUri: photoCacheEntry.authorUri,
                }
              : null
          }
        />

        {(() => {
          const link = roastery.officialLink ?? roastery.kakaoUrl;
          if (!link) return null;
          const label = roastery.officialLink
            ? link.includes("instagram.com")
              ? "인스타그램에서 실제 사진 보기"
              : "공식 페이지에서 실제 사진 보기"
            : "카카오맵에서 실제 사진 보기";
          return (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs text-foreground/50 underline decoration-foreground/30 underline-offset-2 hover:text-foreground/80"
            >
              {label} →
            </a>
          );
        })()}

        <ul className="mt-6 flex flex-wrap gap-1.5">
          {roastery.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-black/5 px-2.5 py-1 text-xs text-foreground/70 dark:bg-white/10"
            >
              #{tag}
            </li>
          ))}
        </ul>

        <p className="mt-6 leading-relaxed text-foreground/80">
          {roastery.description}
        </p>

        <dl className="mt-8 space-y-3 border-t border-black/10 pt-6 text-sm dark:border-white/10">
          <div className="flex gap-3">
            <dt className="w-28 shrink-0 text-foreground/50">주소</dt>
            <dd>{roastery.address}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-28 shrink-0 text-foreground/50">영업시간</dt>
            <dd>{roastery.hours}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-28 shrink-0 text-foreground/50">휴무일</dt>
            <dd>{extractClosedDay(roastery.hours)}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-28 shrink-0 text-foreground/50">주차</dt>
            <dd>확인 필요</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-28 shrink-0 text-foreground/50">대표메뉴 & 시그니처</dt>
            <dd>{roastery.signature.join(", ")}</dd>
          </div>
        </dl>

        <KakaoMap
          className="mt-6 h-64 w-full"
          markers={[{ lat: roastery.lat, lng: roastery.lng, name: roastery.name }]}
        />

        <RoasteryReviews roasterySlug={roastery.slug} />

        <div className="mt-8">
          <SubmissionForm roasterySlug={roastery.slug} />
        </div>
      </div>
    </>
  );
}
