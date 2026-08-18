import Image from "next/image";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { getPendingSubmissions } from "@/lib/db";
import { roasteries } from "@/data/roasteries";
import { approve, reject, logout } from "@/app/admin/actions";
import StarRating from "@/components/StarRating";

export default async function AdminPage() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const submissions = await getPendingSubmissions();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">제보 검토 ({submissions.length})</h1>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-foreground/50 underline decoration-foreground/30 underline-offset-2 hover:text-foreground/80"
          >
            로그아웃
          </button>
        </form>
      </div>

      {submissions.length === 0 && (
        <p className="mt-10 text-sm text-foreground/60">
          대기 중인 제보가 없어요.
        </p>
      )}

      <div className="mt-8 space-y-4">
        {submissions.map((s) => {
          const roastery = roasteries.find((r) => r.slug === s.roasterySlug);
          return (
            <div
              key={s.id}
              className="rounded-xl border border-black/10 p-4 dark:border-white/10"
            >
              <p className="text-sm font-medium">
                {roastery?.name ?? s.roasterySlug}{" "}
                <span className="font-normal text-foreground/40">
                  · {s.authorName ?? "익명"}
                </span>
              </p>

              {s.rating !== null && (
                <div className="mt-2">
                  <StarRating value={s.rating} size="md" />
                </div>
              )}

              {s.reviewText && (
                <p className="mt-2 text-sm text-foreground/80">
                  {s.reviewText}
                </p>
              )}

              {s.photoUrl && (
                <div className="relative mt-3 h-40 w-full overflow-hidden rounded-lg">
                  <Image
                    src={s.photoUrl}
                    alt=""
                    fill
                    sizes="600px"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <form action={approve.bind(null, s.id)}>
                  <button
                    type="submit"
                    className="rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background"
                  >
                    승인
                  </button>
                </form>
                <form action={reject.bind(null, s.id)}>
                  <button
                    type="submit"
                    className="rounded-full bg-black/5 px-3 py-1.5 text-xs text-foreground/70 dark:bg-white/10"
                  >
                    거절
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
