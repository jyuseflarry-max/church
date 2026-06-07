"use server";

import { redirect } from "next/navigation";
import {
  clearTeachingAdminSession,
  createTeachingAdminSession,
  validateTeachingAdminPassword,
} from "../auth";

export async function loginTeachingAdminAction(formData: FormData) {
  const password = formData.get("password");
  if (typeof password !== "string" || !(await validateTeachingAdminPassword(password))) {
    redirect("/admin/login?error=1");
  }

  await createTeachingAdminSession();
  redirect("/admin/teaching-library");
}

export async function logoutTeachingAdminAction() {
  await clearTeachingAdminSession();
  redirect("/admin/login");
}
