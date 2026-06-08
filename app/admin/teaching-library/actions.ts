"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCongregateLessonBatch } from "../../sermons/data";
import {
  importFeedLessonsToDatabase,
  markLessonAudioCleaned,
  markLessonYoutubePublished,
  markLessonYoutubeUploaded,
  prepareLessonAiReview,
  queueLessonAudioCleanup,
  queueLessonYoutubeUpload,
  updateLessonStatus,
  type TeachingApprovalStatus,
} from "../../sermons/database";
import { requireTeachingAdmin } from "../auth";

export async function importCongregateLessonsAction(formData?: FormData) {
  await requireTeachingAdmin();
  const offset = numberField(formData, "offset", 0);
  const limit = numberField(formData, "limit", 50);
  let redirectPath = "/admin/teaching-library";

  try {
    const lessons = await getCongregateLessonBatch(offset, limit);
    const imported = await importFeedLessonsToDatabase(lessons, { limit });
    revalidateTeachingLibrary();
    redirectPath = `/admin/teaching-library?imported=${imported}&offset=${offset}&limit=${limit}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown import error.";
    redirect(`/admin/teaching-library?importError=${encodeURIComponent(message.slice(0, 500))}`);
  }

  redirect(redirectPath);
}

export async function prepareAiReviewAction(formData: FormData) {
  await requireTeachingAdmin();
  const lessonId = requireLessonId(formData);
  await prepareLessonAiReview(lessonId);
  revalidateTeachingLibrary();
}

export async function approveLessonAction(formData: FormData) {
  await updateStatus(formData, "approved");
}

export async function publishLessonAction(formData: FormData) {
  await updateStatus(formData, "published");
}

export async function archiveLessonAction(formData: FormData) {
  await updateStatus(formData, "archived");
}

export async function queueAudioCleanupAction(formData: FormData) {
  await requireTeachingAdmin();
  const lessonId = requireLessonId(formData);
  await queueLessonAudioCleanup(lessonId);
  revalidateTeachingLibrary();
}

export async function markAudioCleanedAction(formData: FormData) {
  await requireTeachingAdmin();
  const lessonId = requireLessonId(formData);
  const cleanedAudioUrl = formData.get("cleanedAudioUrl");
  const target = formData.get("audioTarget") === "source" ? "source" : "clip";
  if (typeof cleanedAudioUrl !== "string" || cleanedAudioUrl.trim().length === 0) {
    throw new Error("Missing cleaned audio URL.");
  }
  await markLessonAudioCleaned(lessonId, cleanedAudioUrl, target);
  revalidateTeachingLibrary();
}

export async function queueYoutubeUploadAction(formData: FormData) {
  await requireTeachingAdmin();
  const lessonId = requireLessonId(formData);
  await queueLessonYoutubeUpload(lessonId);
  await dispatchTeachingVideoWorker();
  revalidateTeachingLibrary();
}

export async function markYoutubeUploadedAction(formData: FormData) {
  await requireTeachingAdmin();
  const lessonId = requireLessonId(formData);
  const videoId = formData.get("youtubeVideoId");
  if (typeof videoId !== "string" || videoId.trim().length === 0) {
    throw new Error("Missing YouTube video id.");
  }
  await markLessonYoutubeUploaded(lessonId, videoId);
  revalidateTeachingLibrary();
}

export async function markYoutubePublishedAction(formData: FormData) {
  await requireTeachingAdmin();
  const lessonId = requireLessonId(formData);
  await markLessonYoutubePublished(lessonId);
  revalidateTeachingLibrary();
}

async function updateStatus(formData: FormData, status: TeachingApprovalStatus) {
  await requireTeachingAdmin();
  const lessonId = requireLessonId(formData);
  await updateLessonStatus(lessonId, status);
  revalidateTeachingLibrary();
}

function requireLessonId(formData: FormData): string {
  const lessonId = formData.get("lessonId");
  if (typeof lessonId !== "string" || lessonId.length === 0) {
    throw new Error("Missing lesson id.");
  }
  return lessonId;
}

function numberField(formData: FormData | undefined, name: string, fallback: number): number {
  const value = formData?.get(name);
  if (typeof value !== "string") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function revalidateTeachingLibrary() {
  revalidatePath("/admin/teaching-library");
  revalidatePath("/sermons");
  revalidatePath("/sermons/collections");
}

async function dispatchTeachingVideoWorker() {
  const token = process.env.GITHUB_ACTIONS_DISPATCH_TOKEN;
  const repo = process.env.GITHUB_ACTIONS_REPO;
  const workflow = process.env.GITHUB_ACTIONS_TEACHING_WORKFLOW ?? "teaching-video-upload.yml";
  if (!token || !repo) return;

  try {
    await fetch(`https://api.github.com/repos/${repo}/actions/workflows/${workflow}/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ ref: "main" }),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    // The queued database state is enough; the scheduled GitHub Action can still pick it up.
  }
}
