# uniVERSE — Supabase SQL run order

Run these in the SQL Editor in this exact order. Each is safe to
re-run if you're ever unsure whether it already ran.

1. `supabase_schema.sql` — core tables (profiles, materials, connections, posts, etc.), RLS, storage bucket for materials.
2. `supabase_phone_lookup.sql` — lets forgot-password resolve a phone number to an email (still used there, even though login itself now uses email directly).
3. `supabase_avatars_bucket.sql` — public storage bucket for profile photos.
4. `supabase_interests_groups_fixed.sql` — categorized interests, groups, auto-join trigger, group post feed.
   **Do NOT run `supabase_interests_groups.sql` (without "_fixed") — that one is superseded and can throw "already exists" errors. Keep it around only for reference, or delete it.**
5. `supabase_typed_groups.sql` — university/faculty/department group types, auto-join on registration, backfill for existing users.

If you ever add a new SQL file, add it to this list in the order you ran it, so future-you (or future me) can tell at a glance what's been applied.
