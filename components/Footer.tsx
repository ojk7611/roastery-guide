export default function Footer() {
  return (
    <footer className="border-t border-black/10 py-8 text-sm text-foreground/60 dark:border-white/10">
      <div className="mx-auto max-w-5xl px-6">
        <p>
          이 페이지에는 제휴 링크가 포함될 수 있으며, 이를 통해 발생한 수익의
          일부가 사이트 운영에 사용됩니다.
        </p>
        <p className="mt-2">
          © {new Date().getFullYear()} 요새여기 - 로스터리 카페 가이드
        </p>
      </div>
    </footer>
  );
}
