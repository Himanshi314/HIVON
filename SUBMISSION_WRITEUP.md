# Hivon Blog — Submission Writeup

## 1. AI Tools Used

**Primary tool: Claude (Anthropic) via claude.ai**

I chose Claude as my primary AI coding assistant for several reasons:

- It generates complete, production-quality TypeScript code rather than pseudocode or partial snippets
- It understands full-stack architecture holistically — it could reason about how Supabase RLS, Next.js Server Components, and the Gemini API all interact, rather than treating each in isolation
- It was invaluable for designing the database schema, particularly the RLS policies which require understanding SQL, Postgres functions, and Supabase's auth model simultaneously
- It helped debug issues with cookie handling in the Supabase SSR client, which is a notoriously tricky area of the stack

**How it helped specifically:**
- Generated the complete Supabase schema with proper indexing and full-text search from a single description
- Wrote all Supabase RLS policies with the `get_my_role()` helper function
- Helped structure the project into a clean data-access layer (`src/lib/posts.ts`) rather than putting queries in components
- Reviewed the Tiptap editor integration and caught an `immediatelyRender: false` SSR issue before it became a bug

**AI integration tool: Google Gemini 1.5 Flash (free tier)**

Used for three AI features: post summary generation, tag suggestions, and title improvements. Chosen because it was specified in the assignment brief and the free tier is sufficient for the usage pattern here.

---

## 2. Feature Logic

### Authentication Flow

1. User visits `/signup` or `/login`
2. Supabase Auth handles credentials. On successful signup, a database trigger (`handle_new_user`) automatically creates a row in `public.profiles` with the user's name, email, and default role of `viewer`
3. On Google OAuth: user is redirected to `/auth/callback`, which exchanges the code for a session via `supabase.auth.exchangeCodeForSession(code)`
4. A session cookie is set. The Next.js middleware on every request calls `supabase.auth.getUser()` to refresh the token and keep the session alive
5. The `useUser()` hook on the client subscribes to `onAuthStateChange` so the UI updates instantly on login/logout

### Role-Based Access Control

Three layers of protection:

**Layer 1 — Middleware (edge):** `middleware.ts` checks `PROTECTED_ROUTES` (`/create`, `/edit`, `/admin`) against the session. Unauthenticated users are redirected to `/login?redirectTo=<path>`.

**Layer 2 — UI gates:** Components like the Navbar conditionally render links based on `profile.role`. Edit buttons only appear if `user.id === post.author_id || isAdmin`.

**Layer 3 — Database RLS (most important):** Even if someone bypasses layers 1 and 2 (e.g., calls the Supabase API directly with the anon key), Row-Level Security policies prevent unauthorised reads and writes at the Postgres level. For example:

```sql
create policy "Authors can insert posts"
  on public.posts for insert
  with check (
    auth.uid() = author_id
    and get_my_role() in ('author', 'admin')
  );
```

This means a viewer cannot insert a post even with a direct API call.

### Post Creation Logic

1. Author fills in title, body (via Tiptap WYSIWYG editor), optional featured image, and tags
2. On "Publish": the post is inserted to the DB immediately (fast path)
3. A non-blocking `fetch('/api/ai/summary', ...)` call is fired in the background — the user gets redirected to the new post without waiting for the AI
4. The API route generates the summary and writes it back to `posts.summary`
5. The next time the post listing page loads, the summary is already in the DB and served instantly

On slug collision (duplicate title), a `23505` Postgres unique constraint error is caught and a user-friendly error is shown.

### AI Summary Generation Flow

```
User publishes post
        │
        ▼
Post inserted to DB (no summary yet) ──→ User redirected to /posts/slug
        │
        ▼ (background, non-blocking)
POST /api/ai/summary { action: 'summary', postId, title, body }
        │
        ▼
Check posts.summary in DB → already exists? Return cached (no API call)
        │
        ▼ (if not cached)
generatePostSummary(title, body) → Gemini 1.5 Flash
        │
        ▼
UPDATE posts SET summary = '...' WHERE id = postId
        │
        ▼
Summary stored forever — never regenerated
```

---

## 3. Cost Optimisation

### Generate Only Once
The summary API route checks whether `posts.summary` is already populated before calling Gemini:

```typescript
const { data: existing } = await supabase
  .from('posts')
  .select('summary')
  .eq('id', postId)
  .single()

if (existing?.summary) {
  return NextResponse.json({ summary: existing.summary, cached: true })
}
```

This means even if the route is called multiple times (e.g., retry after a network error), the API is only charged once per post.

### Token Reduction
- Body is stripped of HTML tags before sending to Gemini: `body.replace(/<[^>]+>/g, '')` — reduces tokens significantly since HTML tags can double the character count
- Content is truncated to 3,000 characters for the summary prompt — enough for a quality 200-word summary without sending an entire 5,000-word article
- The Gemini prompt is tightly constrained: it asks for exactly ~200 words with specific formatting rules, avoiding verbose or repetitive outputs

### Gemini 1.5 Flash
Chosen specifically over Gemini 1.5 Pro because Flash has a higher free tier rate limit and is faster, while being more than capable for ~200-word summaries.

---

## 4. Development Understanding

### Bug Encountered: Supabase SSR Cookie Handling

**Problem:** After deploying to Vercel, users would get logged out on every page refresh. Auth worked perfectly in local development.

**Root cause:** In Next.js App Router, Server Components cannot set cookies directly. The `createServerClient` from `@supabase/ssr` calls `setAll` to refresh the session cookie on every request — but if `setAll` throws in a Server Component context, the session silently fails to persist.

**Fix:** Wrapped `cookieStore.set(...)` in a `try/catch` in the server client, allowing it to fail silently in Server Component contexts (where it can't set cookies) while still working in Route Handlers and Server Actions (where it can):

```typescript
setAll(cookiesToSet) {
  try {
    cookiesToSet.forEach(({ name, value, options }) =>
      cookieStore.set(name, value, options)
    )
  } catch {
    // Expected to fail in Server Components — middleware handles refresh
  }
}
```

The middleware runs before every request and successfully refreshes the session there, so the overall flow is correct.

### Key Architectural Decisions

**1. Data access layer (`src/lib/posts.ts`):** All Supabase queries live in one file. Components never import Supabase directly. This makes the codebase testable, prevents query duplication, and makes it trivial to swap the data source later.

**2. Server Components for data fetching:** The posts listing and detail pages are Server Components. They fetch data on the server, which means no loading spinners for the initial page load, better SEO (content is in the HTML), and no client-side data fetching waterfalls.

**3. RLS at the database level:** I deliberately enforced RBAC at Postgres level rather than just checking roles in API routes or middleware. This is the correct production pattern — UI and middleware checks are UX conveniences, not security boundaries.

**4. Non-blocking AI summary:** The summary is generated in a background fetch after the post is created. This keeps the publish action snappy (< 1s) and means a temporary Gemini API outage doesn't block users from publishing.
