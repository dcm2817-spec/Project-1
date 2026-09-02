# uniVERSE

**Learn. Gist. Connect.**

A campus platform for Nigerian university students — search study materials, connect with people who share your interests, and keep up with what's happening on your campus. Built by Marvforge (Marvellous Oghenerukome Udoko).

---

## Features

- **Auth** — register/login with email + password, real password reset via email
- **Onboarding** — pick up to 5 interests right after signing up (skippable, editable later)
- **Materials** — search, upload, and download study PDFs, scoped by school
- **Profile** — real name, photo upload, faculty/department/level, editable anytime
- **Connect** — suggested people from your school, send/accept/decline connection requests
- **Groups** — auto-joined based on your interests, school, faculty, and department; each group has its own post feed
- **Feed** — post to your campus, see recent materials and posts together, real likes

---

## Tech stack

- Plain HTML / CSS / JavaScript — no build step, no framework, flat file structure (phone-first workflow, no subfolders)
- [Supabase](https://supabase.com) — Auth, Postgres database, Storage
- Deployed via GitHub → Vercel

---

## File structure

### Pages
| File | Purpose |
|---|---|
| `index.html` | Landing page |
| `register.html` | Sign-up form |
| `login.html` | Sign-in form |
| `forgot-password.html` | Request a password reset |
| `reset-password.html` | Set a new password (reached via email link) |
| `onboarding.html` | Pick interests right after registering |
| `app.html` | Main app shell — Feed / Materials / Connect / Profile |

### Styles
| File | Purpose |
|---|---|
| `style.css` | Shared styles — landing, auth pages, onboarding |
| `app-shell.css` | Styles specific to the logged-in app shell |

### Logic & data
| File | Purpose |
|---|---|
| `supabase-client.js` | Supabase project connection — **fill in your own URL + anon key here** |
| `universities.js` | 80 Nigerian universities, used by the school picker |
| `school-combobox.js` | Searchable school picker logic |
| `interest-picker.js` | Reusable interest-picker component (onboarding + Profile edit) |
| `register-form.js` | Register form validation + real signup |
| `login-form.js` | Login form validation + real sign-in |
| `forgot-password.js` | Sends a real password reset email |
| `reset-password.js` | Handles setting the new password |
| `onboarding.js` | Saves picked interests after registering |
| `app-shell.js` | The whole logged-in app — Feed, Materials, Connect, Profile, Groups |

### Database (run in order — see `SQL_RUN_ORDER.md`)
| File | Purpose |
|---|---|
| `supabase_schema.sql` | Core tables, RLS policies, materials storage bucket |
| `supabase_phone_lookup.sql` | Phone → email lookup (used by forgot-password) |
| `supabase_avatars_bucket.sql` | Public storage bucket for profile photos |
| `supabase_interests_groups_fixed.sql` | Categorized interests, groups, auto-join trigger |
| `supabase_typed_groups.sql` | University/faculty/department group types |

---

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. **Run the SQL files** in the SQL Editor, in the exact order listed in `SQL_RUN_ORDER.md`.
3. **Turn off email confirmation**: Authentication → Providers → Email → toggle "Confirm email" off.
4. **Add your redirect URL**: Authentication → URL Configuration → Redirect URLs → add `https://your-domain.vercel.app/reset-password.html`.
5. **Fill in `supabase-client.js`** with your project's URL and anon key (Project Settings → API).
6. **Upload all files flat** to your GitHub repo — no subfolders — and deploy via Vercel.

---

## Known limitations

- **AI matching and feed summarization are not built yet.** Connect currently suggests people by shared school only; Feed shows real posts and materials but nothing is AI-curated. Both are planned to run through a Supabase Edge Function so no API key is ever exposed in the browser.
- **"National" vs "interest" groups are the same thing.** Every interest-based group (Developers Hub, etc.) is already global, not school-scoped — there's no separate "national" tier beyond that.
- **Faculty/department/level groups only exist once someone fills those fields in** via Profile edit — nothing is pre-seeded, since no data exists until a real student enters it.
- **No comments on posts** — only likes are wired up (`post_reactions`). A comments feature would need a new table.
- **"Saved materials" and "My connections" links on Profile are still placeholders** — no dedicated saved-materials or connections-list view exists yet.

---

## Roadmap

- AI Edge Function for Connect matching + Feed summarization
- Saved materials view
- Comments on posts
- Faculty/department picker with autocomplete (currently free-text)
