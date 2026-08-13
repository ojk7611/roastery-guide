import { notFound } from "next/navigation";
import { getRegion } from "@/lib/regions";
import { getRoastery } from "@/data/roasteries";
import KakaoMap from "@/components/KakaoMap";

export default async function RoasteryPage(
  props: PageProps<"/[region]/[slug]">,
) {
  const { region: regionSlug, slug } = await props.params;
  const region = getRegion(regionSlug);
  const roastery = region && getRoastery(region.slug, slug);

  if (!region || !roastery) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm text-foreground/50">
        {region.label} · {roastery.neighborhood}
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">
        {roastery.name}
      </h1>

      <ul className="mt-4 flex flex-wrap gap-1.5">
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
          <dt className="w-20 shrink-0 text-foreground/50">주소</dt>
          <dd>{roastery.address}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-20 shrink-0 text-foreground/50">영업시간</dt>
          <dd>{roastery.hours}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-20 shrink-0 text-foreground/50">시그니처</dt>
          <dd>{roastery.signature.join(", ")}</dd>
        </div>
      </dl>

      <KakaoMap
        className="mt-6 h-64 w-full"
        markers={[{ lat: roastery.lat, lng: roastery.lng, name: roastery.name }]}
      />
    </div>
  );
}
