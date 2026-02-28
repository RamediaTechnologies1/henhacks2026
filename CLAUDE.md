# CLAUDE.md — HenHacks 2026

## Project Overview

HenHacks 2026 hackathon project — a **Remote Assistance & Inspection Platform** for the "Automation Systems & Public Infrastructure" category (sponsored by Bentley).

The app enables remote expert assistance: a person on-site uses a phone camera (or smart glasses) to stream video to a remote expert. AI analyzes the live feed in real-time, a map tracks locations, and alerts/emails keep stakeholders informed.

**Hackathon rules: prioritize speed, working demos, and wow-factor over production polish.**

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| UI | React | 19.2.3 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS (CSS-first v4) | 4.x |
| Components | shadcn/ui + Radix UI | latest |
| AI | OpenAI SDK (GPT-4o, GPT-4o Vision) | 6.25.0 |
| Maps | Leaflet + React-Leaflet | 1.9.4 / 5.0.0 |
| Email | Resend | 6.9.3 |
| State | Zustand | 5.0.11 |
| Validation | Zod | 4.3.6 |
| Icons | lucide-react | 0.575.0 |
| Animations | tw-animate-css | 1.4.0 |

## Project Structure

```
henhacks2026/
├── app/                       # Next.js App Router
│   ├── layout.tsx             # Root layout with sidebar nav
│   ├── page.tsx               # Dashboard home
│   ├── globals.css            # Global styles (Tailwind v4)
│   ├── map/page.tsx           # Leaflet map view
│   ├── feed/page.tsx          # Live camera feed + AI analysis
│   ├── assistant/page.tsx     # AI chat assistant
│   ├── alerts/page.tsx        # Alert notifications
│   ├── settings/page.tsx      # Configuration
│   └── api/                   # Server-side API routes
│       ├── analyze/route.ts   # OpenAI Vision frame analysis
│       ├── chat/route.ts      # OpenAI chat completions
│       └── notify/route.ts    # Resend email notifications
├── components/                # Shared components
│   ├── sidebar.tsx            # Navigation sidebar
│   └── ui/                    # shadcn/ui components
├── lib/                       # Utilities
│   ├── stores/                # Zustand stores
│   ├── openai.ts              # OpenAI client singleton
│   └── utils.ts               # Shared helpers (cn, etc.)
├── public/                    # Static assets
├── .env.local                 # Secrets (NEVER commit)
├── env.local.example          # Template for env vars
└── CLAUDE.md                  # This file
```

## Environment Variables

Copy `env.local.example` to `.env.local`:

```
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
```

**NEVER commit `.env.local`. NEVER expose keys in client code.**

## Critical Architecture Rules

### Server vs Client Components
- Default is **Server Component** — no directive needed
- Add `"use client"` ONLY when using: hooks, browser APIs, event handlers, Zustand stores
- Keep `"use client"` at the leaf level — don't put it on layout or page unless necessary
- NEVER import server-only modules (like `openai`, `resend`, `fs`) in client components

### API Route Pattern (MANDATORY)
All external API calls (OpenAI, Resend) MUST go through `app/api/` routes:
```
Client → fetch('/api/analyze') → API route → OpenAI
```
NEVER import `openai` or call external APIs from client components.

### Leaflet in Next.js (CRITICAL)
Leaflet requires dynamic import with SSR disabled:
```tsx
import dynamic from 'next/dynamic'
const MapComponent = dynamic(() => import('@/components/map-view'), { ssr: false })
```
Also import Leaflet CSS in the map component:
```tsx
import 'leaflet/dist/leaflet.css'
```

### Tailwind CSS v4
This project uses Tailwind v4 with CSS-first configuration:
- Use `@import "tailwindcss"` in globals.css (NOT `@tailwind base/components/utilities`)
- Use `@theme { }` in CSS for custom tokens (NOT `tailwind.config.ts`)
- Use `size-*` shorthand for `w-* h-*`
- Do NOT use arbitrary values — extend `@theme` instead
- Do NOT use `@tailwind` directives — use `@import "tailwindcss"`

### shadcn/ui Components
Add new components with: `npx shadcn add <component-name>`
Components install to `components/ui/`. Import with `@/components/ui/...`

## Design System

- **Theme**: Dark mode (zinc-950 background)
- **Primary accent**: Emerald (emerald-400/500/600)
- **Cards**: zinc-900 with zinc-800 borders
- **Text hierarchy**: zinc-100 (headings) → zinc-400 (body) → zinc-500 (muted)
- **Inputs**: zinc-800 bg, zinc-700 borders, emerald-500 focus ring
- **Font**: Geist Sans (variable: `--font-geist-sans`)

## Key Features to Build

### 1. Live Feed (`/feed`)
- `navigator.mediaDevices.getUserMedia()` for camera access
- Capture frames → base64 → POST to `/api/analyze`
- OpenAI Vision (`gpt-4o`) analyzes frames
- Display results in sidebar panel
- Future: WebRTC for multi-device streaming

### 2. Map View (`/map`)
- Leaflet + React-Leaflet (dynamic import, ssr: false)
- Import `leaflet/dist/leaflet.css`
- Pin inspection locations, track user GPS
- Custom markers with status indicators

### 3. AI Assistant (`/assistant`)
- Chat UI with message history
- POST to `/api/chat` → OpenAI streaming response
- Context about current inspection/task
- Use Zustand store for conversation state

### 4. Alerts (`/alerts`)
- Zustand store for alert queue
- Visual + audio notifications for critical findings
- Email alerts via `/api/notify` → Resend

### 5. Settings (`/settings`)
- Notification preferences
- Auto-analysis toggle
- Connection management

## Commands

```bash
npm run dev          # Dev server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npx shadcn add ...   # Add UI components
```

## Git Workflow

```bash
git checkout -b feat/<feature-name>   # Create feature branch
git add -A && git commit -m "..."     # Commit often
git push origin feat/<feature-name>   # Push to remote
```

Both partners push via SSH to `git@github.com:RamediaTechnologies1/henhacks2026.git`

## Common Patterns

### Creating an API route
```ts
// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI() // reads OPENAI_API_KEY from env

export async function POST(req: NextRequest) {
  const { image } = await req.json()
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'Analyze this image for inspection purposes.' },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}` } }
      ]
    }]
  })
  return NextResponse.json({ analysis: response.choices[0].message.content })
}
```

### Creating a Zustand store
```ts
// lib/stores/alerts.ts
import { create } from 'zustand'

interface AlertStore {
  alerts: Alert[]
  addAlert: (alert: Alert) => void
  clearAlerts: () => void
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  addAlert: (alert) => set((s) => ({ alerts: [...s.alerts, alert] })),
  clearAlerts: () => set({ alerts: [] }),
}))
```

## Important Reminders

- This is a HACKATHON — ship fast, demo well
- `"use client"` only where needed (hooks, interactivity, browser APIs)
- All API keys stay server-side in `app/api/` routes
- Leaflet MUST use dynamic import with `{ ssr: false }`
- Tailwind v4 uses CSS `@theme` — no tailwind.config.ts
- When in doubt about a component: check if shadcn has it first
- Test in both desktop and mobile viewports
