import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRegion } from "@/lib/regions";
import { getRoasteriesByRegion } from "@/data/roasteries";
import { REGION_AREAS, ETC_LABEL, getAreaSlug } from "@/lib/region-areas";
import RoasteryCard from "@/components/RoasteryCard";
import RegionExplorer from "@/components/RegionExplorer";
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
  const { area: areaParam } = await props.searchParams;
  const region = getRegion(regionSlug);

  if (!region) {
    notFound();
  }

  const allRoasteries = getRoasteriesByRegion(region.slug);
  const areas = REGION_AREAS[region.slug];
  const selectedArea =
    areas && typeof areaParam === "string" ? areaParam : null;

  const roasteries = selectedArea
    ? allRoasteries.filter(
        (r) => getAreaSlug(region.slug, r) === selectedArea,
      )
    : allRoasteries;

  const primaryPhotoMap = await getPrimaryPhotoMap();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {region.label} 로스터리
      </h1>
      <p className="mt-2 text-foreground/70">{region.description}</p>

      {areas && (
        <nav
          aria-label={`${region.label} 세부 지역`}
          className="mt-6 flex flex-wrap gap-2 text-sm"
        >
          <Link
            href={`/${region.slug}`}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              selectedArea === null
                ? "bg-foreground text-background"
                : "bg-black/5 text-foreground/70 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
            }`}
          >
            전체
          </Link>
          {areas.map((area) => (
            <Link
              key={area.slug}
              href={`/${region.slug}?area=${area.slug}`}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                selectedArea === area.slug
                  ? "bg-foreground text-background"
                  : "bg-black/5 text-foreground/70 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
              }`}
            >
              {area.label}
            </Link>
          ))}
          <Link
            href={`/${region.slug}?area=etc`}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              selectedArea === "etc"
                ? "bg-foreground text-background"
                : "bg-black/5 text-foreground/70 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
            }`}
          >
            {ETC_LABEL[region.slug] ?? "기타"}
          </Link>
        </nav>
      )}

      <RegionExplorer roasteries={roasteries} />

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
