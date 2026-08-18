"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { setSubmissionStatus, setPrimaryPhoto } from "@/lib/db";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-auth";
import { roasteries } from "@/data/roasteries";

export async function login(formData: FormData) {
  const password = formData.get("password");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || password !== expected) {
    redirect("/admin/login?error=1");
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, expected, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}

export async function approve(id: number) {
  await setSubmissionStatus(id, "approved");
  revalidatePath("/admin");
}

export async function reject(id: number) {
  await setSubmissionStatus(id, "rejected");
  revalidatePath("/admin");
}

export async function makePrimaryPhoto(id: number, roasterySlug: string) {
  await setPrimaryPhoto(id, roasterySlug);

  const roastery = roasteries.find((r) => r.slug === roasterySlug);
  revalidatePath("/admin");
  revalidatePath("/search");
  if (roastery) {
    revalidatePath(`/${roastery.region}`);
    revalidatePath(`/${roastery.region}/${roastery.slug}`);
  }
}
