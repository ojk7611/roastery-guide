import Link from "next/link";
import { searchRoasteries } from "@/data/roasteries";
import { getRegion } from "@/lib/regions";
import RoasteryCard from "@/components/RoasteryCard";

export default async function SearchPage(props: PageProps<"/search">) {
  const { q } = await props.searchParams;
  const query = typeof q === "string" ? q : "";
  const results = searchRoasteries(query);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {query ? `“${query}” 검색 결과` : "검색"}
      </h1>
      <p className="mt-2 text-foreground/70">
        {query
          ? `로스터리 ${results.length}곳을 찾았어요.`
          : "카페 이름, 동네, 태그로 검색해보세요."}
      </p>

      {query && results.length === 0 && (
        <p className="mt-10 text-sm text-foreground/60">
          일치하는 로스터리가 없어요. 다른 검색어로 시도해보세요.
        </p>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {results.map((roastery) => (
          <div key={roastery.id}>
            <p className="mb-1 text-xs text-foreground/40">
              {getRegion(roastery.region)?.label}
            </p>
            <RoasteryCard roastery={roastery} />
          </div>
        ))}
      </div>

      {!query && (
        <Link
          href="/"
          className="mt-10 inline-block text-sm text-foreground/60 underline decoration-foreground/30 underline-offset-2 hover:text-foreground"
        >
          ← 홈으로 돌아가기
        </Link>
      )}
    </div>
  );
}
