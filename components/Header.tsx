import Image from "next/image";
import Link from "next/link";
import { regions } from "@/lib/regions";
import flowerMark from "@/public/brand/flower-mark.png";

export default function Header() {
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
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
        <nav className="flex gap-5 text-sm">
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
    </header>
  );
}
