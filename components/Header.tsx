import Image from "next/image";
import Link from "next/link";
import { regions } from "@/lib/regions";
import flowerMark from "@/public/brand/flower-mark.png";

export default function Header() {
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <Image
            src={flowerMark}
            alt=""
            className="h-7 w-7 dark:invert"
            priority
          />
          요새여기 <span className="text-foreground/50">·</span> 로스터리 카페 가이드
        </Link>

        <div className="flex flex-wrap items-center gap-4">
          <form action="/search" className="relative">
            <input
              type="search"
              name="q"
              placeholder="카페 이름, 동네, 태그 검색"
              className="w-40 rounded-full border border-black/10 bg-transparent px-3 py-1.5 text-sm outline-none placeholder:text-foreground/40 focus:border-foreground/40 sm:w-56 dark:border-white/10"
            />
          </form>

          <nav className="flex flex-wrap gap-4 text-sm">
            {regions.map((region) => (
              <Link
                key={region.slug}
                href={`/${region.slug}`}
                className="text-foreground/70 transition-colors hover:text-foreground"
              >
                {region.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
