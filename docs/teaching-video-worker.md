# Teaching Video Worker

The Teaching Library uses the Congregate All Lessons table as the master list,
matches podcast audio when available, and queues approved sermon clips for a
GitHub Actions worker.

## GitHub Actions Secrets

Add these in GitHub under **Settings -> Secrets and variables -> Actions**:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VIMEO_ACCESS_TOKEN`
- `YOUTUBE_CLIENT_ID`
- `YOUTUBE_CLIENT_SECRET`
- `YOUTUBE_REFRESH_TOKEN`

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
2. Prepare AI review to create transcript and clip times.
3. Review and approve the suggested clip boundaries.
4. Queue video clip + YouTube.
5. GitHub Actions downloads the Vimeo source video, trims it with `ffmpeg`,
   uploads the clipped MP4 to YouTube as private, and saves the YouTube ID.
6. Review the private YouTube upload, then mark it public.
