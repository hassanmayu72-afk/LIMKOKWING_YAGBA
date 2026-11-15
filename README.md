# LIMKOKWING YAGBA 5.1

## Repair release
- Removed the old device-local group chat UI, hidden controls, local message renderer and legacy chat data from future backups.
- The authenticated Supabase Live Group Workspace is now the only group-chat interface.
- Workspace message history loads from `public.messages`; new messages arrive through Supabase Realtime.
- Profile details, avatar image, colour theme, notification sound and reminder tone/volume are stored in `public.student_data.payload` and restored on sign-in.
- Preference changes queue cloud saves while signed in.
- Added a PWA service worker, manifest and app icon. The worker displays push notifications and handles notification clicks.
- Push subscriptions upsert by the unique endpoint column.

## Supabase checks
- `public.messages` exists, has member-only SELECT and INSERT policies, and is included in the Realtime publication.
- `public.push_subscriptions` exists with an authenticated-user ownership policy and a unique endpoint index.
- `send-push` Edge Function is active.
- An active five-minute `pg_cron` job invokes `send-push`.
- Vault contains a secret named `lks_push_cron_secret`; its value was not read.
- Private VAPID and Supabase service-role secrets were not accessed or changed.

## Deployment and testing notes
- This ZIP is a downloadable app package; it does not publish to the hosted website.
- Service workers and web push require HTTPS (or localhost for development). Keep the HTML, `sw.js`, manifest and icon in the same app directory/scope.
- The current `send-push` function expects Edge Function secret `PUSH_CRON_SECRET` to match the `lks_push_cron_secret` value used by the cron job. Secret values were deliberately not accessed; verify they are aligned in Supabase.
- The push function sends assignment reminders due within the next 15 minutes. Assignments must sync to Supabase and each user must register a device subscription.
- End-to-end realtime and push delivery still require testing with two signed-in accounts/devices. Static checks do not prove browser delivery.
- Cloud profile/preferences sync uses the existing `student backup own` RLS policy on `public.student_data`.
- The package includes no private VAPID or service-role keys.
