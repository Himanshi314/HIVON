# Deployment Checklist

Follow every step in order. Don't skip.

---

## Pre-deployment

- [ ] All env vars are in `.env.local` and tested locally (`npm run dev`)
- [ ] `npm run build` passes with zero errors locally
- [ ] Supabase schema SQL has been run (all 3 tables + RLS + storage bucket)
- [ ] At least one post exists to verify the AI summary flow
- [ ] Google OAuth redirect URLs configured in Supabase (if using OAuth)

---

## Step 1 — Push to GitHub

```bash
git add .
git commit -m "feat: complete hivon blog platform"
git push origin main
```

---

## Step 2 — Create Vercel project

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**
2. Import your GitHub repo
3. Framework preset: **Next.js** (auto-detected)
4. Root directory: `.` (default)
5. **Do not deploy yet** — add env vars first

---

## Step 3 — Add environment variables in Vercel

Go to **Project → Settings → Environment Variables** and add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `GEMINI_API_KEY` | Your Google AI Studio key |
| `NEXT_PUBLIC_SITE_URL` | `https://your-project.vercel.app` |

Apply to **Production**, **Preview**, and **Development**.

---

## Step 4 — Deploy

Click **Deploy**. First build takes ~2 minutes.

---

## Step 5 — Configure Supabase for production

In Supabase → **Authentication → URL Configuration**:

- **Site URL:** `https://your-project.vercel.app`
- **Redirect URLs:** `https://your-project.vercel.app/auth/callback`

Without this, Google OAuth and email confirmation links will break in production.

---

## Step 6 — Verify everything works

- [ ] Homepage loads with posts
- [ ] Signup creates a user + profile row in Supabase
- [ ] Login works (email + Google OAuth)
- [ ] Creating a post generates an AI summary (check Supabase → posts table)
- [ ] Admin dashboard shows at `/admin` for admin users
- [ ] Comments can be posted and deleted
- [ ] Search returns results
- [ ] Pagination works
- [ ] Dark mode toggles correctly

---

## Making yourself admin

After signing up, run this in Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your@email.com';
```

---

## Troubleshooting

**Build fails with Tiptap SSR error:**
Ensure `immediatelyRender: false` is set in the `useEditor` call.

**Images not loading in production:**
Verify `next.config.ts` has `*.supabase.co` in `remotePatterns`.

**Auth not persisting after deploy:**
Check that `NEXT_PUBLIC_SITE_URL` is set to the production URL, not localhost.

**Summary not generating:**
Check Vercel function logs → `/api/ai/summary`. Verify `GEMINI_API_KEY` is set.

**RLS blocking inserts:**
Run the schema SQL again, specifically the `get_my_role()` function and the posts insert policy.
