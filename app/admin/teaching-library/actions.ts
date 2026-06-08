"use server";

import { revalidatePath } from "next/cache";
import { getFeedLessons } from "../../sermons/data";
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

export async function importCongregateLessonsAction() {
  await requireTeachingAdmin();
  const lessons = await getFeedLessons();
  await importFeedLessonsToDatabase(lessons);
  revalidateTeachingLibrary();
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

function revalidateTeachingLibrary() {
  revalidatePath("/admin/teaching-library");
  revalidatePath("/sermons");
  revalidatePath("/sermons/collections");
}
