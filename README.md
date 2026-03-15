# LiveStack

Livestock management & chain-of-custody platform for Jamaican farmers.

**From tag to table — every animal is accountable.**

---

## Setup in 5 steps

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Create a free project at [supabase.com](https://supabase.com)
2. Go to SQL Editor → paste and run `supabase-schema.sql`
3. Go to Project Settings → API → copy your keys

### 3. Set up environment variables
Copy `.env.local.example` to `.env.local` and fill in your keys:
```bash
cp .env.local.example .env.local
```

You need:
- **Supabase URL + keys** — from supabase.com → Project Settings → API
- **Anthropic API key** — from console.anthropic.com → API Keys (free tier works)
- **Mapbox token** — from account.mapbox.com → Tokens (free tier works)

### 4. Run locally
```bash
npm run dev
```
Open [localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel
```bash
git init && git add . && git commit -m "LiveStack initial build"
```
Then go to [vercel.com](https://vercel.com) → Import repo → Add your 5 env vars → Deploy.

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/dashboard` | Farmer dashboard — live herd, theft reporting, AI alerts |
| `/verify?tagId=JM-005` | Butcher verification — CLEAR / BLOCKED / UNREGISTERED |
| `/api/chat` | Claude-powered RADA compliance chatbot API |

---

## Demo

- Go to `/dashboard` — see 8 animals with live Supabase realtime
- Click **Report theft** on any animal — it turns red instantly
- Go to `/verify?tagId=JM-005` — see full-screen BLOCKED screen
- Use the demo toggle at the bottom of `/verify` to cycle all 3 states
- JM-005 (Duchess) is pre-seeded as blocked

---

## Tech stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL + Realtime)
- **Anthropic Claude API** (claude-sonnet-4-6)
- **Vercel** deployment
