import Link from "next/link";
import type { Roastery } from "@/types/roastery";
import RoasteryPhoto from "@/components/RoasteryPhoto";

export default function RoasteryCard({
  roastery,
  photoOverrideUrl,
}: {
  roastery: Roastery;
  photoOverrideUrl?: string | null;
}) {
  return (
    <Link
      href={`/${roastery.region}/${roastery.slug}`}
      className="block rounded-xl border border-black/10 p-5 transition-colors hover:border-black/30 dark:border-white/10 dark:hover:border-white/30"
    >
      <RoasteryPhoto
        slug={roastery.slug}
        name={roastery.name}
        className="relative -mx-5 -mt-5 mb-4 h-36"
        overrideUrl={photoOverrideUrl}
      />
      <p className="text-xs text-foreground/50">{roastery.neighborhood}</p>
      <h3 className="mt-1 text-lg font-semibold">{roastery.name}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-foreground/70">
        {roastery.description}
      </p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {roastery.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full bg-black/5 px-2.5 py-1 text-xs text-foreground/70 dark:bg-white/10"
          >
            #{tag}
          </li>
        ))}
      </ul>
    </Link>
  );
}
