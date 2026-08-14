import { login } from "@/app/admin/actions";

export default async function AdminLoginPage(
  props: PageProps<"/admin/login">,
) {
  const { error } = await props.searchParams;

  return (
    <div className="mx-auto max-w-sm px-6 py-24">
      <h1 className="text-xl font-semibold">관리자 로그인</h1>
      <form action={login} className="mt-6 space-y-3">
        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          autoFocus
          className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/40 dark:border-white/10"
        />
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">
            비밀번호가 올바르지 않아요.
          </p>
        )}
        <button
          type="submit"
          className="w-full rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          로그인
        </button>
      </form>
    </div>
  );
}
