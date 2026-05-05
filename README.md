# Hivon Blog

A modern, full-stack blogging platform built with **Next.js 14**, **Supabase**, and **Google Gemini AI**. Built as part of the Hivon Automations internship assignment.

🚀 **Live Demo:** [https://hivon-blush.vercel.app/](https://hivon-blush.vercel.app/)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend + Backend | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS + DM Sans / DM Serif Display |
| Authentication | Supabase Auth (email/password + Google OAuth) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Storage | Supabase Storage (post images) |
| AI Integration | Google Gemini 1.5 Flash (free tier) |
| Rich Text | Tiptap WYSIWYG editor |
| Deployment | Vercel |
| Version Control | Git + GitHub |

---

## Features

### Core
- 📝 **Three user roles** — Viewer, Author, Admin with full RBAC enforced via Supabase RLS
- 🤖 **AI-generated summaries** — Every post gets a ~200-word Gemini summary on creation (stored once, never re-fetched)
- 🔍 **Search + pagination** — Full-text search across post titles and content
- 🖼️ **Image uploads** — Featured images stored in Supabase Storage
- 💬 **Comments** — Authenticated comments with admin moderation
- ✏️ **Rich text editor** — Tiptap WYSIWYG with headings, links, images, code blocks

### Extras
- 🌙 **Dark mode** — System-aware, toggleable
- 🏷️ **AI tag suggestions** — Gemini suggests relevant tags per post
- 💡 **AI title improver** — Get 3 better title alternatives from Gemini
- ⏱️ **Reading time** — Auto-calculated from word count
- 🔗 **SEO slugs** — Clean URL slugs generated from titles
- 🔑 **Google OAuth** — One-click sign-in with Google
- 🛡️ **Admin dashboard** — User management, post moderation, comment monitoring
- 🍞 **Toast notifications** — Real-time feedback on all actions
- ⏳ **Loading skeletons** — Polished loading states

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/         # Login page
│   ├── (auth)/signup/        # Signup with role selection
│   ├── auth/callback/        # OAuth callback handler
│   ├── posts/                # Blog listing + detail pages
│   ├── create/               # Create post (Author/Admin)
│   ├── edit/[id]/            # Edit post
│   ├── admin/                # Admin dashboard
│   └── api/                  # API routes (AI summary, etc.)
├── components/
│   ├── ui/                   # Button, Input, Badge, etc.
│   ├── layout/               # Navbar, Footer
│   ├── posts/                # PostCard, PostGrid, Editor, etc.
│   └── providers/            # Theme + Toast providers
├── hooks/
│   └── useUser.ts            # Auth state hook
├── lib/
│   ├── supabase/             # Browser + server clients
│   ├── gemini.ts             # AI integration
│   └── utils.ts              # Shared helpers
└── types/
    └── index.ts              # TypeScript interfaces
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free)
- A [Google AI Studio](https://aistudio.google.com) API key (free)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/hivon-blog.git
cd hivon-blog
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Settings → API** and copy your project URL and anon key
4. (Optional) Go to **Authentication → Providers** and enable Google OAuth

### 4. Configure environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_google_gemini_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git add .
git commit -m "feat: complete blogging platform"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Add all environment variables from `.env.local` in Vercel's dashboard
4. Add `NEXT_PUBLIC_SITE_URL=https://your-vercel-url.vercel.app`
5. Click **Deploy**

### 3. Configure Supabase for production

In Supabase → **Authentication → URL Configuration**:
- Site URL: `https://your-vercel-url.vercel.app`
- Redirect URLs: `https://your-vercel-url.vercel.app/auth/callback`

---

## AI Tools Used

**Claude (Anthropic)** via Claude.ai was used as the primary AI coding assistant throughout development. It was chosen because:

- It excels at generating complete, production-quality code with proper TypeScript types
- It understands full-stack architecture holistically (not just isolated snippets)
- It helped design the Supabase RLS policies, Gemini integration, and component architecture
- It generated the complete database schema with proper indexing and full-text search

The AI dramatically accelerated development while I maintained full understanding of every decision made. The AI summary feature uses **Google Gemini 1.5 Flash** (free tier) and is triggered once on post creation — the result is stored in the database to avoid repeated API calls.

---

## Architecture Decisions

### Why Supabase RLS instead of just middleware?
Middleware can be bypassed (e.g. direct API calls). RLS enforces permissions at the database level — even if someone calls the Supabase API directly with the anon key, they cannot read or write data they're not authorized for.

### Why store AI summaries in the DB?
Calling Gemini on every page load would be slow and expensive. We generate the summary once on post creation, store it in `posts.summary`, and serve it from the database forever after. This is the correct production pattern.

### Why Tiptap over a plain textarea?
Authors need formatting. A textarea produces plain text; Tiptap outputs proper HTML that renders correctly in the blog post view. It also supports image embedding, headings, links, and code blocks out of the box.

---

## License

Built for Hivon Automations LLP internship evaluation.
