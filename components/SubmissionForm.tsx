"use client";

import { useState, useRef } from "react";
import StarRatingInput from "./StarRatingInput";

export default function SubmissionForm({
  roasterySlug,
}: {
  roasterySlug: string;
}) {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "done" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasPhoto, setHasPhoto] = useState(false);
  const [consentOwnership, setConsentOwnership] = useState(false);
  const [consentUsage, setConsentUsage] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    if (hasPhoto && (!consentOwnership || !consentUsage)) {
      setStatus("error");
      setErrorMessage("사진 저작권 동의 항목을 모두 체크해주세요.");
      return;
    }

    setStatus("submitting");

    const formData = new FormData(e.currentTarget);
    formData.set("photoConsent", String(hasPhoto && consentOwnership && consentUsage));

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
      setHasPhoto(false);
      setConsentOwnership(false);
      setConsentUsage(false);
    } catch {
      setStatus("error");
      setErrorMessage("제출 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
    }
  }

  if (status === "done") {
    return (
      <div
        id="submit-form"
        className="rounded-xl border border-black/10 p-5 text-sm text-foreground/70 dark:border-white/10"
      >
        제보 감사합니다! 검토 후 게시됩니다.
      </div>
    );
  }

  return (
    <form
      id="submit-form"
      ref={formRef}
      onSubmit={handleSubmit}
      className="scroll-mt-6 rounded-xl border border-black/10 p-5 dark:border-white/10"
    >
      <input type="hidden" name="roasterySlug" value={roasterySlug} />

      <p className="text-sm font-medium">📸 방문 사진 &amp; 후기 제보</p>
      <p className="mt-1 text-xs text-foreground/50">
        직접 방문한 카페의 사진과 후기를 남겨주세요.
        <br />
        선정된 사진은 요새여기 로스터리 소개 페이지에 게시됩니다.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <p className="mb-1.5 text-xs text-foreground/50">별점 (선택)</p>
          <StarRatingInput />
        </div>
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
          onChange={(e) => setHasPhoto(e.currentTarget.files !== null && e.currentTarget.files.length > 0)}
          className="w-full text-sm text-foreground/70 file:mr-3 file:rounded-full file:border-0 file:bg-black/5 file:px-3 file:py-1.5 file:text-xs file:text-foreground/70 dark:file:bg-white/10"
        />

        {hasPhoto && (
          <div className="space-y-2 rounded-lg bg-black/[.03] p-3 dark:bg-white/[.05]">
            <label className="flex items-start gap-2 text-xs text-foreground/70">
              <input
                type="checkbox"
                checked={consentOwnership}
                onChange={(e) => setConsentOwnership(e.currentTarget.checked)}
                className="mt-0.5"
              />
              본인이 직접 촬영했거나 사용 권한을 보유한 사진입니다.
            </label>
            <label className="flex items-start gap-2 text-xs text-foreground/70">
              <input
                type="checkbox"
                checked={consentUsage}
                onChange={(e) => setConsentUsage(e.currentTarget.checked)}
                className="mt-0.5"
              />
              제출한 사진을 요새여기가 웹사이트 및 공식 SNS의 로스터리
              소개·후기 목적으로 사용하는 것에 동의합니다.
            </label>
          </div>
        )}
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
