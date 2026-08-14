import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "admin_session";

export async function isAdmin() {
  const store = await cookies();
  const expected = process.env.ADMIN_PASSWORD;
  return !!expected && store.get(ADMIN_COOKIE_NAME)?.value === expected;
}
