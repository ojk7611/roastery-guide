import Link from "next/link";
import { roasteries } from "@/data/roasteries";
import { getRegion } from "@/lib/regions";
import { getReviewStatsMap } from "@/lib/db";
import { pickHotRoasteries, getHotBadges } from "@/lib/hot";

export default async function HotSection() {
  const reviewStats = await getReviewStatsMap();
  const hot = pickHotRoasteries(roasteries, reviewStats, 6);

  if (hot.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
        🔥 요새 HOT
      </h2>
      <p className="mt-1 text-sm text-foreground/60">
        최근 사람들이 많이 찾는 로스터리
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {hot.map((roastery) => {
          const region = getRegion(roastery.region);
          const badges = getHotBadges(roastery);
          return (
            <Link
              key={roastery.id}
              href={`/${roastery.region}/${roastery.slug}`}
              className="rounded-xl border border-black/10 p-4 transition-colors hover:border-black/30 dark:border-white/10 dark:hover:border-white/30"
            >
              <h3 className="font-semibold">{roastery.name}</h3>
              <p className="mt-0.5 text-xs text-foreground/50">
                {region?.label} · {roastery.neighborhood}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium tracking-wide text-foreground/60 dark:bg-white/10"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
