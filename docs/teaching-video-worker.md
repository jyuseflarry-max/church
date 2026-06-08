# Teaching Video Worker

The Teaching Library uses the Congregate All Lessons table as the master list,
matches podcast audio when available, and queues approved sermon clips for a
GitHub Actions worker.

## GitHub Actions Secrets

Add these in GitHub under **Settings -> Secrets and variables -> Actions**:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VIMEO_ACCESS_TOKEN`
- `OPENAI_API_KEY`
- `YOUTUBE_CLIENT_ID`
- `YOUTUBE_CLIENT_SECRET`
- `YOUTUBE_REFRESH_TOKEN`
- `SUPABASE_TEACHING_MEDIA_BUCKET`

The media bucket is required. The worker uploads the clipped cleaned MP3 to this
Supabase Storage bucket and saves the permanent public URL on the lesson record.

The Vimeo token must be able to read video file links for the Fulshear Vimeo
account. The worker cannot trim a Vimeo player URL unless Vimeo returns a
downloadable or progressive MP4 file link.

## Optional Vercel Variables

Add these in Vercel only if the admin button should immediately wake the GitHub
Action after queueing a video:

- `GITHUB_ACTIONS_DISPATCH_TOKEN`
- `GITHUB_ACTIONS_REPO`, for example `jyuseflarry-max/church`
- `GITHUB_ACTIONS_TEACHING_WORKFLOW`, optional, defaults to
  `teaching-video-upload.yml`

Without those optional Vercel variables, the GitHub Action still checks for
queued videos every 15 minutes.

## Workflow

1. Import lessons from Congregate.
2. If podcast audio exists, prepare AI review from that audio.
3. If no podcast audio exists, queue the video-first workflow.
4. GitHub Actions downloads the Vimeo source video, extracts a cleaned MP3 from
   the full video, transcribes that audio, asks AI for sermon boundaries and
   metadata, trims the sermon video, cleans the audio track, extracts the final
   cleaned sermon MP3, uploads the clipped MP4 to YouTube as private, and saves
   the YouTube ID.
5. Review the generated transcript, clip boundaries, private YouTube upload, and
   saved MP3.
6. Publish the public lesson page.

## Podcast Feed

Published lessons with saved MP3 audio appear in the website RSS feed:

`/podcast.xml`

Submit the full production URL, for example
`https://fulshearcoc.org/podcast.xml`, to Spotify for Creators and other podcast
directories. After the feed is approved, future published lesson MP3s should be
picked up from the feed automatically.
