# CLAUDE.md — FixIt AI Project Context

## What This Project Is
FixIt AI is a smart campus maintenance reporting and automation platform for University of Delaware, built for the HenHacks 2026 hackathon (Automation Systems & Public Infrastructure category, sponsored by Bentley).

**The Problem:** UDel students report maintenance issues by emailing fixit@udel.edu. A human dispatcher manually reads emails, classifies the trade type, assesses priority, creates a work order in IBM Maximo, and routes to the correct team.

**Our Solution:** AI-powered automation that eliminates the dispatcher bottleneck:
1. Student snaps photo of issue + selects building/location
2. OpenAI Vision API analyzes image - auto-classifies trade, severity, priority
3. System auto-generates structured work order
4. Auto-sends email to correct department via Gmail SMTP
5. Live campus dashboard shows all reports on interactive map
6. Smart deduplication: multiple reports of same issue = 1 work order with upvotes
7. Pattern detection: repeated issues trigger preventive maintenance alerts

## Tech Stack
- Framework: Next.js 14 (App Router) with TypeScript
- Styling: Tailwind CSS + shadcn/ui components
- Database: Supabase (PostgreSQL)
- AI: OpenAI Vision API (GPT-4o) for image analysis
- Email: Nodemailer with Gmail SMTP for auto-dispatch
- Maps: React-Leaflet for campus map visualization
- PWA: Installable mobile app with GPS + camera access
- Deployment: Vercel (auto-deploys from main branch)

## Environment Variables
All secrets are in .env.local (not committed to git). Required keys:
- OPENAI_API_KEY
- GMAIL_USER
- GMAIL_APP_PASSWORD
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

## Database Schema (Supabase PostgreSQL)
Table: reports
- id UUID PRIMARY KEY
- created_at, updated_at TIMESTAMPTZ
- building TEXT, room TEXT, floor TEXT
- latitude DOUBLE PRECISION, longitude DOUBLE PRECISION
- description TEXT, photo_url TEXT, photo_base64 TEXT
- trade TEXT (plumbing|electrical|hvac|structural|custodial|landscaping|safety_hazard)
- priority TEXT (critical|high|medium|low)
- ai_description TEXT, suggested_action TEXT
- safety_concern BOOLEAN, estimated_cost TEXT, estimated_time TEXT, confidence_score DOUBLE PRECISION
- status TEXT (submitted|analyzing|dispatched|in_progress|resolved)
- duplicate_of UUID, upvote_count INTEGER, urgency_score DOUBLE PRECISION
- dispatched_to TEXT, dispatched_at TIMESTAMPTZ, email_sent BOOLEAN
- reporter_email TEXT, reporter_name TEXT

## Project Structure
app/
  layout.tsx - Root layout
  page.tsx - Main report submission page (mobile-first PWA)
  dashboard/page.tsx - Admin dashboard with campus map
  api/
    analyze/route.ts - POST: Send image to OpenAI Vision
    report/route.ts - POST: Save report to Supabase + send email
    reports/route.ts - GET: Fetch all reports for dashboard
components/
  report-form.tsx - Photo upload, building select, description
  camera-capture.tsx - Camera/file upload
  location-picker.tsx - Building dropdown with GPS
  campus-map.tsx - Leaflet map showing reports
  report-card.tsx - Individual report card
  ai-analysis-display.tsx - AI results with animations
lib/
  supabase.ts - Supabase client
  openai.ts - OpenAI client + analysis prompt
  email.ts - Nodemailer Gmail SMTP
  types.ts - TypeScript interfaces
  constants.ts - UDel buildings, departments, map center
  utils.ts - cn() helper

## OpenAI Vision Prompt
Analyze this campus maintenance image and return ONLY valid JSON:
{
  "trade": "plumbing|electrical|hvac|structural|custodial|landscaping|safety_hazard",
  "priority": "critical|high|medium|low",
  "description": "Brief description",
  "suggested_action": "What team should do",
  "safety_concern": true/false,
  "estimated_cost": "$X-Y range",
  "estimated_time": "repair time estimate",
  "confidence_score": 0.0-1.0
}

## Department Routing
plumbing -> plumbing-team@facilities.udel.edu
electrical -> electrical-team@facilities.udel.edu
hvac -> hvac-team@facilities.udel.edu
structural -> structural-team@facilities.udel.edu
custodial -> custodial-team@facilities.udel.edu
landscaping -> grounds-team@facilities.udel.edu
safety_hazard -> safety@facilities.udel.edu

## UDel Campus Buildings
Gore Hall: 39.6812, -75.7528
Smith Hall: 39.6800, -75.7520
Memorial Hall: 39.6795, -75.7515
Perkins Student Center: 39.6790, -75.7535
Morris Library: 39.6805, -75.7530
Trabant University Center: 39.6783, -75.7510
ISE Lab: 39.6778, -75.7505
Evans Hall: 39.6815, -75.7540
Brown Lab: 39.6808, -75.7525
Colburn Lab: 39.6803, -75.7518
Spencer Lab: 39.6798, -75.7512
DuPont Hall: 39.6810, -75.7535
Sharp Lab: 39.6807, -75.7522
Purnell Hall: 39.6792, -75.7508
Kirkbride Hall: 39.6788, -75.7502
Mitchell Hall: 39.6785, -75.7530
Willard Hall: 39.6813, -75.7532
STAR Campus: 39.6740, -75.7460
Carpenter Sports Building: 39.6760, -75.7550
Christiana Towers: 39.6710, -75.7490
Campus Center: 39.6780, -75.7506

## Smart Features
1. Deduplication: Same building + same trade within 7 days = increment upvote
2. Urgency Score: base_priority + (upvotes * 1.5) + (safety ? 3 : 0)
3. Pattern Detection: 3+ reports same trade in 90 days = preventive maintenance alert

## Design
- UDel colors: #00539F (blue), #FFD200 (gold)
- Mobile-first PWA (installable on phone)
- shadcn/ui components
- Loading animations for AI analysis

## Commands
npm run dev - Start dev server
npm run build - Production build

## Deployment
Vercel auto-deploys from main branch
Live: https://fixitai-gamma.vercel.app
