# People's Priorities — AI for Constituency Development Planning

Built for **Build with AI: Code for Communities**.

MPs receive development requests through public meetings, letters, social media, grievance
portals, and direct representations, while local development plans list dozens of competing
proposed projects. This app gives citizens a single multilingual channel to submit suggestions
(voice, text, or photo) and gives MPs an AI-analyzed, data-backed, ranked priority list — so
decisions can be defended with evidence, not guesswork.

## What it does

- **Citizen portal** (`/`) — submit a development suggestion in English, Hindi, or Telugu, by
  typing or speaking (Web Speech API, no external service required), with an optional photo and
  locality/ward selection.
- **AI analysis** — every submission is automatically categorized (Education, Health, Roads,
  Water, Electricity, Sanitation, Employment, Safety), assigned a normalized "theme" so
  recurring requests cluster together, scored for urgency, and scored for sentiment. Works fully
  offline with a built-in multilingual rule-based engine; automatically upgrades to an LLM for
  higher accuracy classification/translation if `GROQ_API_KEY` (tried first, e.g. Qwen3-32B) or
  `OPENAI_API_KEY` (`gpt-4o-mini`) is set — no code changes required either way.
- **MP dashboard** (`/dashboard`) — recurring-theme chart, a demand-hotspot map (ward-level,
  OpenStreetMap/Leaflet, no API key needed), and a ranked priority table.
- **Priority ranking engine** (`lib/priority.ts`) — blends four transparent, tunable signals into
  a 0–100 score per theme-per-ward:
  - **Demand** — how many citizens raised it, relative to the largest theme.
  - **Urgency** — average AI-derived urgency of the submissions.
  - **Need gap** — how badly the ward's demographic/infrastructure data supports the request
    (e.g. a school-upgrade request scores higher in a ward with long travel distances and
    overcrowded classrooms than in a well-served ward — directly answering the brief's example
    of weighing school upgrades against enrollment and travel-distance data).
  - **Recency** — recent surges are weighted over old, possibly-resolved chatter.
  
  Weights are adjustable live from the dashboard so an MP's office can align the ranking with
  their own judgment, and every score can be expanded to show its breakdown and a sample citizen
  submission — no black box.

## Tech stack

Next.js 14 (App Router, TypeScript), Tailwind CSS, Prisma ORM, Recharts, React-Leaflet. No paid
services required to run or demo.

## Local development

```bash
npm install
npm run db:push     # creates the local SQLite database from prisma/schema.prisma
npm run db:seed      # loads a sample constituency (5 wards + 25 real-world-style submissions)
npm run dev
```

Open http://localhost:3000 for the citizen portal and http://localhost:3000/dashboard for the MP
dashboard.

By default the app uses SQLite (`prisma/schema.prisma`, `DATABASE_URL="file:./dev.db"`) so it
runs with zero external setup.

### Optional: enable LLM-powered analysis

Copy `.env.example` to `.env` and set `GROQ_API_KEY` (get a free key at
[console.groq.com](https://console.groq.com)) and optionally `GROQ_MODEL` (defaults to
`qwen/qwen3-32b`). `OPENAI_API_KEY` is supported as a secondary fallback. Without either key, the
app uses its built-in rule-based multilingual NLP fallback (see `lib/nlp.ts`) — fully functional,
no cost.

## Deploying to Vercel

Vercel's serverless filesystem is read-only in production, so SQLite won't persist writes across
requests there. Before deploying, switch to a serverless-friendly Postgres database (free tier is
enough for a hackathon demo):

1. Create a free Postgres database — [Neon](https://neon.tech), [Supabase](https://supabase.com),
   or Vercel's own Postgres integration all work.
2. In `prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "postgresql"   // was "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
3. Set `DATABASE_URL` to your Postgres connection string, both locally (`.env`) and in your
   Vercel project's Environment Variables.
4. Push the schema and seed the database:
   ```bash
   npm run db:push
   npm run db:seed
   ```
5. Push this repo to GitHub and import it in [vercel.com/new](https://vercel.com/new) — no other
   configuration needed. `npm run build` already runs `prisma generate` for you.
6. (Optional) Add `GROQ_API_KEY` (and `GROQ_MODEL`) or `OPENAI_API_KEY` as Vercel environment
   variables for higher-accuracy analysis.

## Project structure

```
app/
  page.tsx                 citizen submission portal
  dashboard/page.tsx        MP dashboard
  api/
    submissions/route.ts    create + list submissions (runs AI analysis on POST)
    priorities/route.ts     ranked priority list (weights adjustable via query params)
    hotspots/route.ts       ward-level aggregation for the map
    themes/route.ts         category/theme counts for the chart
    wards/route.ts          ward list for the submission form
components/
  SubmissionForm.tsx        multilingual form + Web Speech API voice input
  HotspotMap.tsx             Leaflet map
  ThemeChart.tsx              Recharts bar chart
  PriorityTable.tsx           ranked table with adjustable weights
lib/
  nlp.ts                    multilingual theme/category/urgency/sentiment analysis
  priority.ts                priority scoring engine
  i18n.ts                     English/Hindi/Telugu UI strings
  db.ts                       Prisma client
prisma/
  schema.prisma              data model (Ward, Submission, DevelopmentProject)
  seed.ts                     sample constituency data
```

## Extending beyond the hackathon demo

- Swap the Web Speech API for a hosted STT service (e.g. Whisper) to support recording on
  browsers/devices without built-in speech recognition, and to support offline voice messages
  forwarded from WhatsApp.
- Add a WhatsApp Business API / Twilio webhook that posts directly into `/api/submissions`, so
  the "messaging apps" channel from the brief is a thin adapter rather than new plumbing.
- Store photos in a blob store (Vercel Blob / S3) instead of inline data URLs once submission
  volume grows.
- Replace the rule-based NLP fallback's theme clustering with embeddings + a vector index for
  semantic (not just keyword) clustering across languages.
