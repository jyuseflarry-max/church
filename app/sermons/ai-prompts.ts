export type LessonBreakdownInput = {
  sourceTitle: string;
  sourceDate: string;
  sourceSpeaker?: string | null;
  sourceService?: string | null;
  transcript: string;
  existingSeries?: string | null;
};

export function buildLessonBreakdownPrompt(input: LessonBreakdownInput): string {
  return [
    "You are helping Fulshear Church of Christ prepare a public Teaching Library item.",
    "The public site should publish only the sermon or lesson portion, not announcements, prayers, songs, communion, or full-service material.",
    "Analyze the transcript and return structured JSON only.",
    "",
    "Find:",
    "- Sermon or lesson start and end times in seconds.",
    "- Clean public title.",
    "- Speaker.",
    "- Scripture references.",
    "- Short summary in warm, plain language.",
    "- Topics/tags.",
    "- Series or collection.",
    "- Service type such as Sunday AM, Sunday PM, Wednesday, Bible Class, Summer Series.",
    "- Artwork prompt with no text inside the image.",
    "- Confidence and review notes.",
    "",
    "Artwork should be restrained, Scripture-centered, warm, simple, and consistent with the series visual family when a series exists.",
    "Do not create hype language. Do not be defensive. Keep the tone sincere, biblical, and visitor-friendly.",
    "",
    `Source title: ${input.sourceTitle}`,
    `Source date: ${input.sourceDate}`,
    `Source speaker: ${input.sourceSpeaker ?? "Unknown"}`,
    `Source service: ${input.sourceService ?? "Unknown"}`,
    `Existing series: ${input.existingSeries ?? "None"}`,
    "",
    "Transcript:",
    input.transcript,
  ].join("\n");
}

export const lessonBreakdownJsonShape = {
  clipStartSeconds: 0,
  clipEndSeconds: 0,
  title: "",
  speaker: "",
  scripture: [""],
  summary: "",
  topics: [""],
  series: "",
  serviceType: "",
  lessonType: "",
  artworkPrompt: "",
  confidence: {
    clip: "low | medium | high",
    metadata: "low | medium | high",
  },
  reviewNotes: [""],
};
