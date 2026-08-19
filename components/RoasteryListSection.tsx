import RoasteryCard from "@/components/RoasteryCard";
import RegionExplorer from "@/components/RegionExplorer";
import { getPrimaryPhotoMap, getPhotoCacheMap } from "@/lib/db";
import type { Roastery } from "@/types/roastery";

export default async function RoasteryListSection({
  roasteries,
}: {
  roasteries: Roastery[];
}) {
  const [primaryPhotoMap, photoCacheMap] = await Promise.all([
    getPrimaryPhotoMap(),
    getPhotoCacheMap(),
  ]);

  return (
    <>
      <RegionExplorer roasteries={roasteries} />

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {roasteries.map((roastery) => {
          const cached = photoCacheMap[roastery.slug];
          return (
            <RoasteryCard
              key={roastery.id}
              roastery={roastery}
              photoOverrideUrl={primaryPhotoMap[roastery.slug] ?? null}
              googlePhoto={
                cached
                  ? {
                      url: cached.blobUrl,
                      authorName: cached.authorName,
                      authorUri: cached.authorUri,
                    }
                  : null
              }
            />
          );
        })}
      </div>
    </>
  );
}
