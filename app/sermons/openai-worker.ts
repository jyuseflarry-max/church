import { buildLessonBreakdownPrompt } from "./ai-prompts";
import type { TeachingAdminLesson } from "./database";

export type LessonBreakdownResult = {
  clipStartSeconds: number | null;
  clipEndSeconds: number | null;
  title: string;
  speaker: string;
  scripture: string[];
  summary: string;
  topics: string[];
  series: string | null;
  serviceType: string;
  lessonType: string;
  artworkPrompt: string;
  confidence: {
    clip: "low" | "medium" | "high";
    metadata: "low" | "medium" | "high";
  };
  reviewNotes: string[];
};

const OPENAI_API_URL = "https://api.openai.com/v1";

export function isOpenAiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function transcribeLessonAudio(lesson: TeachingAdminLesson): Promise<string> {
  const apiKey = requireOpenAiKey();
  if (!lesson.audioUrl) {
    throw new Error("Lesson does not have an audio URL to transcribe.");
  }

  const audioRes = await fetch(lesson.audioUrl, {
    signal: AbortSignal.timeout(60000),
  });
  if (!audioRes.ok) {
    throw new Error(`Could not fetch lesson audio: ${audioRes.status}`);
  }

  const audioBlob = await audioRes.blob();
  const primaryModel = process.env.OPENAI_TRANSCRIPTION_MODEL ?? "gpt-4o-transcribe";
  const fallbackModel = process.env.OPENAI_LONG_TRANSCRIPTION_MODEL ?? "whisper-1";

  try {
    return await transcribeAudioBlob({
      apiKey,
      audioBlob,
      audioUrl: lesson.audioUrl,
      model: primaryModel,
    });
  } catch (error) {
    if (primaryModel === fallbackModel || !isDurationLimitError(error)) {
      throw error;
    }

    return transcribeAudioBlob({
      apiKey,
      audioBlob,
      audioUrl: lesson.audioUrl,
      model: fallbackModel,
    });
  }
}

async function transcribeAudioBlob({
  apiKey,
  audioBlob,
  audioUrl,
  model,
}: {
  apiKey: string;
  audioBlob: Blob;
  audioUrl: string;
  model: string;
}): Promise<string> {
  const form = new FormData();
  form.append("model", model);
  form.append("response_format", "json");
  form.append(
    "prompt",
    [
      "This is a sermon or Bible class from Fulshear Church of Christ.",
      "Preserve Scripture references, speaker names, and theological terms.",
      "Do not summarize; transcribe the spoken content accurately.",
    ].join(" "),
  );
  form.append("file", audioBlob, filenameForAudioUrl(audioUrl));

  const res = await fetch(`${OPENAI_API_URL}/audio/transcriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
    signal: AbortSignal.timeout(120000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI transcription failed: ${res.status} ${body}`);
  }

  const json = (await res.json()) as { text?: string };
  if (!json.text) throw new Error("OpenAI transcription returned no text.");
  return json.text;
}

function isDurationLimitError(error: unknown) {
  return error instanceof Error && /longer than \d+ seconds|maximum for this model/i.test(error.message);
}

export async function createLessonBreakdown(
  lesson: TeachingAdminLesson,
  transcript: string,
): Promise<LessonBreakdownResult> {
  const apiKey = requireOpenAiKey();
  const prompt = buildLessonBreakdownPrompt({
    sourceTitle: lesson.title,
    sourceDate: lesson.date,
    sourceSpeaker: lesson.speaker,
    sourceService: lesson.service,
    existingSeries: lesson.series,
    transcript: transcript.slice(0, 90000),
  });

  const res = await fetch(`${OPENAI_API_URL}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_LESSON_BREAKDOWN_MODEL ?? "gpt-4o",
      input: [
        {
          role: "system",
          content:
            "You prepare sermon records for a Churches of Christ teaching library. Return faithful, non-hype, visitor-friendly metadata.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "lesson_breakdown",
          strict: true,
          schema: lessonBreakdownSchema,
        },
      },
    }),
    signal: AbortSignal.timeout(120000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI lesson breakdown failed: ${res.status} ${body}`);
  }

  const json = await res.json();
  const outputText = extractOutputText(json);
  if (!outputText) throw new Error("OpenAI lesson breakdown returned no text.");

  return normalizeBreakdown(JSON.parse(outputText));
}

function requireOpenAiKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");
  return apiKey;
}

function filenameForAudioUrl(url: string) {
  const pathname = new URL(url).pathname;
  const name = pathname.split("/").filter(Boolean).pop();
  return name && /\.[a-z0-9]+$/i.test(name) ? name : "lesson-audio.mp3";
}

function extractOutputText(response: unknown): string | null {
  if (
    typeof response === "object" &&
    response !== null &&
    "output_text" in response &&
    typeof response.output_text === "string"
  ) {
    return response.output_text;
  }

  const output = (response as { output?: unknown[] }).output;
  if (!Array.isArray(output)) return null;

  for (const item of output) {
    const content = (item as { content?: unknown[] }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (
        typeof part === "object" &&
        part !== null &&
        "text" in part &&
        typeof part.text === "string"
      ) {
        return part.text;
      }
    }
  }
  return null;
}

function normalizeBreakdown(value: LessonBreakdownResult): LessonBreakdownResult {
  return {
    clipStartSeconds: nullableNumber(value.clipStartSeconds),
    clipEndSeconds: nullableNumber(value.clipEndSeconds),
    title: value.title || "Untitled Lesson",
    speaker: value.speaker || "Guest Speaker",
    scripture: Array.isArray(value.scripture) ? value.scripture.filter(Boolean) : [],
    summary: value.summary || "",
    topics: Array.isArray(value.topics) ? value.topics.filter(Boolean) : [],
    series: value.series || null,
    serviceType: value.serviceType || "Lesson",
    lessonType: value.lessonType || "Lesson",
    artworkPrompt: value.artworkPrompt || "",
    confidence: {
      clip: normalizeConfidence(value.confidence?.clip),
      metadata: normalizeConfidence(value.confidence?.metadata),
    },
    reviewNotes: Array.isArray(value.reviewNotes) ? value.reviewNotes.filter(Boolean) : [],
  };
}

function nullableNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeConfidence(value: unknown): "low" | "medium" | "high" {
  if (value === "low" || value === "high") return value;
  return "medium";
}

const lessonBreakdownSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "clipStartSeconds",
    "clipEndSeconds",
    "title",
    "speaker",
    "scripture",
    "summary",
    "topics",
    "series",
    "serviceType",
    "lessonType",
    "artworkPrompt",
    "confidence",
    "reviewNotes",
  ],
  properties: {
    clipStartSeconds: { anyOf: [{ type: "integer" }, { type: "null" }] },
    clipEndSeconds: { anyOf: [{ type: "integer" }, { type: "null" }] },
    title: { type: "string" },
    speaker: { type: "string" },
    scripture: { type: "array", items: { type: "string" } },
    summary: { type: "string" },
    topics: { type: "array", items: { type: "string" } },
    series: { anyOf: [{ type: "string" }, { type: "null" }] },
    serviceType: { type: "string" },
    lessonType: { type: "string" },
    artworkPrompt: { type: "string" },
    confidence: {
      type: "object",
      additionalProperties: false,
      required: ["clip", "metadata"],
      properties: {
        clip: { type: "string", enum: ["low", "medium", "high"] },
        metadata: { type: "string", enum: ["low", "medium", "high"] },
      },
    },
    reviewNotes: { type: "array", items: { type: "string" } },
  },
};
