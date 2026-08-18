import Link from "next/link";
import { regions } from "@/lib/regions";
import { getRoasteriesByRegion } from "@/data/roasteries";
import RegionMap from "@/components/RegionMap";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          여행지에서 찾는 스페셜티 로스터리
        </h1>
        <p className="mt-3 max-w-xl text-foreground/70">
          전국 로스터리 카페를 지역별로 모았습니다. 위치, 영업시간, 시그니처
          메뉴를 한눈에 확인하세요.
        </p>
      </section>

      <section className="mx-auto mt-12 max-w-md">
        <RegionMap />
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        {regions.map((region) => {
          const count = getRoasteriesByRegion(region.slug).length;
          return (
            <Link
              key={region.slug}
              href={`/${region.slug}`}
              className="rounded-xl border border-black/10 p-6 transition-colors hover:border-black/30 dark:border-white/10 dark:hover:border-white/30"
            >
              <h2 className="text-xl font-semibold">{region.label}</h2>
              <p className="mt-2 text-sm text-foreground/70">
                {region.description}
              </p>
              <p className="mt-4 text-sm text-foreground/50">
                로스터리 {count}곳
              </p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
