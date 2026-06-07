# Teaching Library AI Workflow

This document describes the sermon publishing workflow we are building toward.

## Goal

The public website should show approved sermon and lesson clips, not full services.

The member site can keep the full Congregate recordings. The public site should present a cleaned-up Teaching Library with:

- Clipped audio
- Clipped video
- AI-generated transcript
- Title, speaker, date, Scripture, service type, and collection
- AI-generated artwork that matches the series style
- Human approval before publishing

## Workflow

1. Import the full media item from Congregate.
2. Transcribe the full recording.
3. Ask AI to identify the public lesson segment.
4. Ask AI to suggest title, summary, Scripture, topics, speaker, service type, and collection.
5. Ask AI to create an artwork prompt.
6. Generate artwork.
7. Review everything in the admin workflow.
8. After approval, clip audio/video with `ffmpeg`.
9. Generate the final transcript from the clipped media.
10. Publish the individual lesson page and add it to the right collection.

## Approval Rule

Nothing should publish automatically until approved.

After approval, publishing can be automatic.

## Series Artwork Rule

The first lesson in a series establishes the series visual direction:

- Color palette
- Mood
- Symbolic approach
- Photo/illustration style
- Framing

Each later lesson in that same series should use the same visual family while changing the specific imagery to match the lesson topic.

Do not put sermon titles inside generated images. The website should render titles as HTML text for accessibility, consistency, and easy editing.

## Suggested Data Fields

Each imported lesson should eventually store:

- `sourceId`
- `sourceUrl`
- `sourceAudioUrl`
- `sourceVideoUrl`
- `title`
- `speaker`
- `date`
- `service`
- `type`
- `series`
- `scripture`
- `summary`
- `topics`
- `clipStartSeconds`
- `clipEndSeconds`
- `clippedAudioUrl`
- `clippedVideoUrl`
- `transcript`
- `artworkUrl`
- `artworkPrompt`
- `status`
- `approvedBy`
- `approvedAt`

## AI Prompt Shape

The AI breakdown prompt should ask for structured JSON:

```json
{
  "clipStartSeconds": 0,
  "clipEndSeconds": 0,
  "title": "",
  "speaker": "",
  "scripture": [],
  "summary": "",
  "topics": [],
  "series": "",
  "serviceType": "",
  "lessonType": "",
  "artworkPrompt": "",
  "confidence": {
    "clip": "low | medium | high",
    "metadata": "low | medium | high"
  },
  "reviewNotes": []
}
```

## Clipping Command Shape

After approval:

```bash
ffmpeg -ss <start> -to <end> -i <source-media> -c copy <output-file>
```

If `-c copy` creates rough cuts, use re-encoding for cleaner boundaries:

```bash
ffmpeg -ss <start> -to <end> -i <source-media> -c:v libx264 -c:a aac <output-file>
```

## Current Implementation

The site now includes:

- `/sermons` Teaching Library page
- `/sermons/[slug]` individual lesson pages
- `/sermons/collections` collection index
- `/sermons/collections/[slug]` collection detail pages
- `/admin/teaching-library` review workflow scaffold
- AI-ready lesson metadata fields in `app/sermons/data.ts`
- Temporary generated artwork in `public/sermons/artwork`

The next implementation step is to add persistent storage and the background jobs that call transcription, analysis, image generation, and `ffmpeg`.
