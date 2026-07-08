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

Next.js (App Router, TypeScript), Tailwind CSS, Prisma ORM, Supabase Postgres, Recharts,
React-Leaflet.

## Local development

The app uses Supabase Postgres (provisioned via the Vercel integration) as its datastore, since
Vercel's serverless filesystem is read-only and can't host a SQLite file in production.

1. Link this repo to your Vercel project, then pull its environment variables (this fetches the
   `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING` values Vercel's Supabase integration set up):
   ```bash
   npx vercel link
   npx vercel env pull .env
   ```
   Alternatively, copy them manually from Vercel → your project → **Storage** → your Supabase
   database → the ".env.local" tab, into `.env` (see `.env.example`).
2. Install dependencies and set up the database:
   ```bash
   npm install
   npm run db:push     # applies prisma/schema.prisma to your Supabase database
   npm run db:seed     # loads a sample constituency (5 wards + 25 real-world-style submissions)
   npm run dev
   ```

Open http://localhost:3000 for the citizen portal and http://localhost:3000/dashboard for the MP
dashboard.

### Optional: enable LLM-powered analysis

Set `GROQ_API_KEY` in `.env` (get a free key at [console.groq.com](https://console.groq.com)) and
optionally `GROQ_MODEL` (defaults to `qwen/qwen3-32b`). `OPENAI_API_KEY` is supported as a
secondary fallback. Without either key, the app uses its built-in rule-based multilingual NLP
fallback (see `lib/nlp.ts`) — fully functional, no cost.

## Deploying to Vercel

1. Push this repo to GitHub and import it in [vercel.com/new](https://vercel.com/new), or use the
   project you already linked above.
2. In the Vercel project, confirm the Supabase integration's environment variables
   (`POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`) are set for the Production/Preview
   environments — the integration does this automatically when you attach the database.
3. Add `GROQ_API_KEY` (and `GROQ_MODEL`) or `OPENAI_API_KEY` as Vercel environment variables for
   higher-accuracy analysis (optional but recommended).
4. Push the schema and seed data against the same database Vercel will use (run once, from your
   machine with `.env` pointing at the Supabase instance):
   ```bash
   npm run db:push
   npm run db:seed
   ```
5. Deploy — `npm run build` already runs `prisma generate` for you, no other configuration needed.

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
