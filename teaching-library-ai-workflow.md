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
- Supabase schema for approved public lessons, clips, transcripts, artwork, collections, and review events
- Server-side database reader that uses approved/published lessons when Supabase is configured
- YouTube publishing fields for private upload, public release, and website embeds
- Temporary generated artwork in `public/sermons/artwork`

The next implementation step is to add the background jobs that call transcription, analysis, image generation, and `ffmpeg`.

## Storage Plan

The public site needs persistent storage because each lesson will move through several states before it is visible:

1. Imported from Congregate.
2. Transcribed from the full source media.
3. Broken down by AI into suggested clip times, title, Scripture, summary, topics, series, and artwork prompt.
4. Reviewed by a person.
5. Clipped after approval.
6. Published as a public lesson page.

The database migration is stored at `supabase/migrations/20260607162000_teaching_library.sql`.

It creates tables for:

- Source media imported from Congregate
- Artwork styles for series consistency
- Public teaching collections
- Public teaching lessons
- Collection-to-lesson ordering
- Review events for approval history

## Environment Variables

The site can read from Supabase when these are available:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Server-only workflows that import, update, approve, or publish lessons should use:

```bash
SUPABASE_SERVICE_ROLE_KEY=
```

The service role key should never be exposed to browser code.

## Publishing Rule

Only lessons with `approval_status = 'published'` should appear on the public Teaching Library pages.

Everything else can live in the admin workflow as draft/review material.

## Background Jobs To Build Next

1. Import job: checks Congregate for new lessons and stores source records.
2. Transcription job: creates a full transcript from the source media.
3. AI breakdown job: suggests clip range, metadata, topics, Scripture, transcript cleanup, and artwork prompt.
4. Artwork job: generates lesson artwork and keeps series images visually related.
5. Approval action: lets a reviewer edit and approve the suggested lesson.
6. Clipping job: creates the public audio/video segment after approval.
7. YouTube upload job: uploads the approved clip to YouTube as private and stores the YouTube video ID.
8. Publish action: moves an approved lesson to `published` so it appears on the public site.
9. YouTube release action: marks the YouTube video public after final review.

## YouTube Publishing Plan

YouTube should be the public video host for clipped sermon and lesson versions.

The website remains the organized Teaching Library. YouTube handles video storage, streaming, device playback, and public sharing.

The safest publishing flow is:

1. AI prepares the lesson metadata, transcript, artwork prompt, and suggested clip boundaries.
2. A person approves the lesson.
3. The clipping worker creates the public sermon clip.
4. The YouTube worker uploads that clip as `private`.
5. A reviewer watches the private YouTube upload.
6. The site stores the YouTube video ID.
7. The public lesson page embeds the YouTube clip.
8. A reviewer marks the YouTube video public or unlisted.

AI should prepare the YouTube title, description, tags, chapters, transcript, and thumbnail/artwork, but it should not publish straight to the public channel without approval.

Suggested YouTube metadata:

- Title: lesson title, not clickbait
- Description: short summary, Scripture, speaker, date, church name, website link, and visitor invitation
- Tags: church of Christ, Fulshear, Katy, sermon, Bible, Scripture, topic tags
- Visibility: private on upload, public or unlisted after review
- Audience setting: not made for kids unless the specific lesson is intentionally children's content

Server-only YouTube credentials will be needed later for automatic upload. Do not expose those credentials in browser code.
