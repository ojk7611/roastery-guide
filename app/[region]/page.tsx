import { notFound } from "next/navigation";
import { getRegion } from "@/lib/regions";
import { getRoasteriesByRegion } from "@/data/roasteries";
import RoasteryCard from "@/components/RoasteryCard";
import KakaoMap from "@/components/KakaoMap";

export default async function RegionPage(props: PageProps<"/[region]">) {
  const { region: regionSlug } = await props.params;
  const region = getRegion(regionSlug);

  if (!region) {
    notFound();
  }

  const roasteries = getRoasteriesByRegion(region.slug);

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
          <RoasteryCard key={roastery.id} roastery={roastery} />
        ))}
      </div>
    </div>
  );
}
