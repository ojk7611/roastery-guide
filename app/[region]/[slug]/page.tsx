import { notFound } from "next/navigation";
import { getRegion } from "@/lib/regions";
import { getRoastery } from "@/data/roasteries";
import KakaoMap from "@/components/KakaoMap";
import RoasteryPhoto from "@/components/RoasteryPhoto";
import RoasteryReviews from "@/components/RoasteryReviews";
import SubmissionForm from "@/components/SubmissionForm";

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

      <RoasteryPhoto
        slug={roastery.slug}
        name={roastery.name}
        className="relative mt-6 h-64 w-full"
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

      <RoasteryReviews roasterySlug={roastery.slug} />

      <div className="mt-8">
        <SubmissionForm roasterySlug={roastery.slug} />
      </div>
    </div>
  );
}
