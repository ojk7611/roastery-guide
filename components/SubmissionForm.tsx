"use client";

import { useState, useRef } from "react";

export default function SubmissionForm({
  roasterySlug,
}: {
  roasterySlug: string;
}) {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "done" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "제출 중 문제가 발생했어요.");
        return;
      }

      setStatus("done");
      formRef.current?.reset();
    } catch {
      setStatus("error");
      setErrorMessage("제출 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl border border-black/10 p-5 text-sm text-foreground/70 dark:border-white/10">
        제보 감사합니다! 검토 후 게시됩니다.
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-xl border border-black/10 p-5 dark:border-white/10"
    >
      <input type="hidden" name="roasterySlug" value={roasterySlug} />

      <p className="text-sm font-medium">사진이나 후기 제보하기</p>
      <p className="mt-1 text-xs text-foreground/50">
        검토 후 게시돼요. 방문 사진, 시그니처 메뉴 후기 등을 자유롭게 남겨주세요.
      </p>

      <div className="mt-4 space-y-3">
        <input
          type="text"
          name="authorName"
          placeholder="닉네임 (선택)"
          maxLength={40}
          className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-foreground/40 focus:border-foreground/40 dark:border-white/10"
        />
        <textarea
          name="reviewText"
          placeholder="방문 후기를 남겨주세요 (선택)"
          maxLength={1000}
          rows={3}
          className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-foreground/40 focus:border-foreground/40 dark:border-white/10"
        />
        <input
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp"
          className="w-full text-sm text-foreground/70 file:mr-3 file:rounded-full file:border-0 file:bg-black/5 file:px-3 file:py-1.5 file:text-xs file:text-foreground/70 dark:file:bg-white/10"
        />
      </div>

      {status === "error" && (
        <p className="mt-3 text-xs text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-4 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {status === "submitting" ? "제출 중..." : "제보하기"}
      </button>
    </form>
  );
}
