# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cellora AI is an AI-powered treatment recommendation system for dermatology/aesthetic clinics. It integrates with 3D Meta-Vu skin analysis machines to generate personalized treatment proposals using Gemini AI.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Styling**: Tailwind CSS v4 + CSS Variables
- **UI Components**: Custom components inspired by Aceternity UI
- **Animation**: Framer Motion (`motion/react`)
- **Icons**: Phosphor Icons React (`@phosphor-icons/react`)
- **Font**: Geist Mono
- **AI**: Google Gemini 3 Pro (`@google/genai`)
- **Charts**: Recharts (for radar charts)
- **Language**: Korean UI with English device/procedure names

## Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── page.tsx              # Dashboard
│   ├── patients/page.tsx     # Patient list
│   ├── analysis/
│   │   ├── page.tsx          # Analysis overview
│   │   └── [patientId]/page.tsx  # Individual analysis
│   ├── treatments/page.tsx   # Treatment catalog
│   └── analytics/page.tsx    # Statistics dashboard
├── components/
│   ├── ui/                   # Base UI components
│   ├── layout/               # Sidebar, header, mobile nav
│   ├── dashboard/            # Dashboard-specific components
│   └── analysis/             # Analysis page components
└── lib/
    ├── types.ts              # TypeScript interfaces
    ├── utils.ts              # Helper functions (cn, formatDate, etc.)
    ├── gemini.ts             # Gemini AI integration
    └── mock-data/            # Mock Korean patient/treatment data
```

## Design System

### Color Palette
- Primary Mint: `#D0EBBA` - Highlights, CTAs, success states
- Dark Green: `#172C23` - Text on light backgrounds, dark accents
- Warm Gray: `#827263` - Secondary text, borders
- Black: `#000000` - Backgrounds, strong emphasis

### CSS Variables
All colors are available as CSS variables in `globals.css`:
- `--cellora-mint`, `--cellora-dark-green`, `--cellora-warm-gray`
- Semantic: `--background`, `--foreground`, `--card`, `--muted`, `--accent`, `--border`

## Key Files

### Mock Data (`src/lib/mock-data/`)
- `patients.ts` - 15 Korean patients with names, concerns, medical history
- `treatments.ts` - 20 treatments (Pico Toning, Ultherapy, Rejuran, etc.)
- `analyses.ts` - Skin analysis results with scores
- `recommendations.ts` - AI recommendations with confidence scores

### Gemini Integration (`src/lib/gemini.ts`)
- `generateTreatmentRecommendation()` - Generates structured JSON recommendations
- `streamRecommendation()` - Streaming response for real-time UI
- Uses `gemini-3-pro-preview` model

## Environment Variables

```bash
GEMINI_API_KEY=your_api_key  # Required for AI recommendations
```

## Restrictions

- Do NOT run `npm run dev` or `npm run build` without explicit user permission
- Do NOT create README or markdown files unless explicitly told to
- Do NOT commit or push to git without asking
