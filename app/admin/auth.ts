import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE = "teaching_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function adminPassword() {
  return process.env.TEACHING_ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD ?? "";
}

function sessionSecret() {
  return process.env.TEACHING_ADMIN_SESSION_SECRET ?? process.env.AUTH_SECRET ?? adminPassword();
}

export function isAdminAuthConfigured() {
  return adminPassword().length > 0 && sessionSecret().length > 0;
}

export async function requireTeachingAdmin() {
  if (!(await hasTeachingAdminSession())) {
    redirect("/admin/login");
  }
}

export async function hasTeachingAdminSession() {
  if (!isAdminAuthConfigured()) return false;

  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!value) return false;

  const [issuedAt, signature] = value.split(".");
  const issued = Number(issuedAt);
  if (!issued || !signature) return false;

  const ageSeconds = Math.floor(Date.now() / 1000) - issued;
  if (ageSeconds < 0 || ageSeconds > SESSION_TTL_SECONDS) return false;

  return timingSafeCompare(signature, signSession(issuedAt));
}

export async function createTeachingAdminSession() {
  const cookieStore = await cookies();
  const issuedAt = String(Math.floor(Date.now() / 1000));
  cookieStore.set(ADMIN_COOKIE, `${issuedAt}.${signSession(issuedAt)}`, {
    httpOnly: true,
    maxAge: SESSION_TTL_SECONDS,
    path: "/admin",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearTeachingAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export async function validateTeachingAdminPassword(password: string) {
  const expected = adminPassword();
  if (!expected || !password) return false;
  return timingSafeCompare(password, expected);
}

function signSession(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("hex");
}

function timingSafeCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
