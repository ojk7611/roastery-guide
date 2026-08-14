import Image from "next/image";
import { getApprovedSubmissions } from "@/lib/db";

export default async function RoasteryReviews({
  roasterySlug,
}: {
  roasterySlug: string;
}) {
  const submissions = await getApprovedSubmissions(roasterySlug);

  if (submissions.length === 0) return null;

  return (
    <div className="mt-8 border-t border-black/10 pt-6 dark:border-white/10">
      <p className="text-sm font-medium">방문객 제보</p>

      <div className="mt-4 space-y-4">
        {submissions.map((s) => (
          <div key={s.id} className="flex gap-3">
            {s.photoUrl && (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={s.photoUrl}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="min-w-0">
              {s.reviewText && (
                <p className="text-sm text-foreground/80">{s.reviewText}</p>
              )}
              <p className="mt-1 text-xs text-foreground/40">
                {s.authorName ?? "익명"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
