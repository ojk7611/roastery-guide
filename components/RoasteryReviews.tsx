import Image from "next/image";
import type { Submission } from "@/lib/db";
import StarRating from "./StarRating";

export default function RoasteryReviews({
  submissions,
}: {
  submissions: Submission[];
}) {
  if (submissions.length === 0) return null;

  const ratings = submissions
    .map((s) => s.rating)
    .filter((r): r is number => r !== null);
  const average =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : null;

  return (
    <div className="mt-8 border-t border-black/10 pt-6 dark:border-white/10">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium">방문객 제보</p>
        {average !== null && (
          <span className="flex items-center gap-1 text-xs text-foreground/50">
            <StarRating value={average} />
            {average.toFixed(1)} ({ratings.length}개 평가)
          </span>
        )}
      </div>

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
              {s.rating !== null && <StarRating value={s.rating} />}
              {s.reviewText && (
                <p className="mt-0.5 text-sm text-foreground/80">
                  {s.reviewText}
                </p>
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
