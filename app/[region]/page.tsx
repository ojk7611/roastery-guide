import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRegion } from "@/lib/regions";
import { getRoasteriesByRegion } from "@/data/roasteries";
import RoasteryCard from "@/components/RoasteryCard";
import KakaoMap from "@/components/KakaoMap";
import { getPrimaryPhotoMap } from "@/lib/db";

export async function generateMetadata(
  props: PageProps<"/[region]">,
): Promise<Metadata> {
  const { region: regionSlug } = await props.params;
  const region = getRegion(regionSlug);
  if (!region) return {};

  const count = getRoasteriesByRegion(region.slug).length;
  const title = `${region.label} 로스터리 카페 ${count}곳`;
  const description = `${region.description} ${region.label} 지역 핸드드립·필터커피 로스터리 카페 ${count}곳을 위치, 영업시간, 시그니처 메뉴와 함께 모았습니다.`;

  return {
    title,
    description,
    alternates: { canonical: `/${region.slug}` },
    openGraph: { title, description, url: `/${region.slug}` },
    twitter: { title, description },
  };
}

export default async function RegionPage(props: PageProps<"/[region]">) {
  const { region: regionSlug } = await props.params;
  const region = getRegion(regionSlug);

  if (!region) {
    notFound();
  }

  const roasteries = getRoasteriesByRegion(region.slug);
  const primaryPhotoMap = await getPrimaryPhotoMap();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {region.label} 로스터리
      </h1>
      <p className="mt-2 text-foreground/70">{region.description}</p>

      <KakaoMap
        className="mt-8 h-80 w-full"
        markers={roasteries.map((r) => ({
          lat: r.lat,
          lng: r.lng,
          name: r.name,
          href: `/${r.region}/${r.slug}`,
        }))}
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {roasteries.map((roastery) => (
          <RoasteryCard
            key={roastery.id}
            roastery={roastery}
            photoOverrideUrl={primaryPhotoMap[roastery.slug] ?? null}
          />
        ))}
      </div>
    </div>
  );
}
