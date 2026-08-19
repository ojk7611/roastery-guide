import type { MetadataRoute } from "next";
import { regions } from "@/lib/regions";
import { roasteries } from "@/data/roasteries";
import { REGION_AREAS } from "@/lib/region-areas";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/search`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.3,
    },
  ];

  const regionEntries: MetadataRoute.Sitemap = regions.map((region) => ({
    url: `${SITE_URL}/${region.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const roasteryEntries: MetadataRoute.Sitemap = roasteries.map((roastery) => ({
    url: `${SITE_URL}/${roastery.region}/${roastery.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const areaEntries: MetadataRoute.Sitemap = Object.entries(REGION_AREAS).flatMap(
    ([region, areas]) =>
      (areas ?? []).map((area) => ({
        url: `${SITE_URL}/${region}/${area.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
  );

  return [...staticEntries, ...regionEntries, ...areaEntries, ...roasteryEntries];
}
