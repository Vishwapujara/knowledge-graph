# PtP Knowledge Graph — Ecosystem Stakeholder Mapping + Provider Matching Agent

**Vishwa Pujara | MS Computer Science, Northeastern University**  
**Assignment: Options 6 + 3 | Partners to Parenthood (PtP)**

---

## Live Demo

| Link | Description |
|---|---|
| **Next.js App** | Run locally — see setup instructions below |
| **[Demo Video / Streamlit](#)** | _Add your Streamlit or demo link here_ |
| **[GitHub Repo](#)** | _Add your GitHub repo link here_ |

> Replace the `#` placeholders above with your actual links before submission.

---

## What This Is

An interactive Next.js 14 application that bridges two disconnected systems in PtP:

| Existing system | Problem |
|---|---|
| Ecosystem map (pathwaystoparenthood.lovable.app) | Shows 500+ providers as dots — no connection to patient journeys |
| Journey engine (california-surrogacy-path-engine) | Shows step-by-step journeys — no connection to which providers to contact |

**This app connects them** via a knowledge graph that maps ecosystem providers to each step of a patient's personalized fertility journey, ranked by a weighted scoring model with AI-generated explanations.

---

## Assignment Coverage

| Assignment option | What we built |
|---|---|
| **Option 6** — Knowledge graph connecting ecosystem to journeys | Screen 3 — interactive SVG knowledge graph, all providers visible by default, toggle by step |
| **Option 3A** — Matching logic | Hard filter (budget, goal, state) + weighted scoring (5 dimensions) + condition boost |
| **Option 3B** — Inputs | Patient profile → `providerMatching.ts` scoring engine |
| **Option 3C** — Ranking model | Weighted score: specialty 30%, insurance 25%, budget 20%, location 15%, SART 10% |
| **Option 3D** — Output | Ranked list + score breakdown bars + Claude API explanation |

---

## How to Run

```bash
cd ptp-knowledge-graph
npm install
npm run dev
```

Open `http://localhost:3000`

No API keys required for the knowledge graph and scoring. The Claude API explanation button requires an Anthropic API key (set in environment or the button will show an error gracefully).

---

## The 3 Screens

### Screen 1 — Patient Intake
Dynamic form collecting: fertility goal, age, relationship status, US state, insurance, budget, health condition.

- Real-time form validation
- 21-state insurance mandate detection
- Budget feedback logic
- Live journey preview (steps + costs update as you type)

**In production PtP:** replaced by NextAuth session + MongoDB patient profile. Screen 1 demonstrates what data PtP already has.

### Screen 2 — Enhanced Journey Map
Animated journey road with all steps. Click any step → provider panel slides in.

Provider panel shows:
- Providers organized by type (medical / financial / emotional / legal)
- **Provider Matching Agent** — providers ranked for THIS patient with match % and score breakdown
- "Explain with AI" → Claude API generates personalized explanation

### Screen 3 — Knowledge Graph
Interactive SVG graph (no D3, no Cytoscape — pure trigonometric layout).

- Patient node at center → Journey → Steps (circle) → Provider nodes (fanned from each step)
- All providers visible by default — click a step to collapse its providers
- Filter bar: show only medical / financial / emotional / legal providers
- Click any node → detail panel with Provider Matching Agent for step nodes

---

## Where Data Comes From

| Data | Demo source | Production source |
|---|---|---|
| Patient profile | Screen 1 form input | MongoDB Atlas + NextAuth session |
| Journey steps | Hardcoded in `knowledgeGraph.ts` | Agent 4 (Journey Generator) via Google Genkit |
| Provider categories | Generic nodes in `knowledgeGraph.ts` | SART.com, NPI Registry, PtP ecosystem database |
| Matching scores | `providerMatching.ts` weighted scoring | See AI roadmap below |
| AI explanations | Claude Sonnet API | Gemini 1.5 Flash via Google Genkit (PtP's existing stack) |

---

## Provider Matching — AI Roadmap

The demo uses Stage 1. Each stage replaces only the scoring layer.

```
Stage 1 (now)      Weighted scoring — no data needed, fully explainable
Stage 2 (6 months) RAG + MongoDB Vector Search — semantic matching, needs provider embeddings
Stage 3 (12 months) Collaborative filtering — learns from patient behavior, needs 1000+ interactions
Stage 4 (18 months) XGBoost / neural net — outcome prediction, needs labeled treatment result data
```

Stage 2 is the natural next step because MongoDB Vector Search is already in PtP's tech stack.

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Entry point
│   └── globals.css         # PtP color scheme + animations
├── components/
│   ├── MainApp.tsx         # Screen router + nav header
│   ├── ProfileSelector.tsx # Screen 1 — dynamic intake form
│   ├── JourneyMap.tsx      # Screen 2 — journey map + provider panel
│   ├── KnowledgeGraph.tsx  # Screen 3 — SVG knowledge graph
│   └── ProviderMatcher.tsx # Provider matching agent UI + Claude API
├── context/
│   └── AppContext.tsx      # Global state
├── data/
│   └── knowledgeGraph.ts   # All data: patients, journeys, steps, providers
└── lib/
    ├── providerConfig.ts   # Provider type colors and icons
    └── providerMatching.ts # Scoring engine: hard filter + weighted score + Claude prompt
```

---

## Tech Stack — Matches PtP Production Exactly

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS with PtP color tokens |
| Animations | Framer Motion |
| State | React Context API (same pattern as PtP's AuthContext) |
| Icons | Lucide React |
| AI | Claude Sonnet API (production: Google Genkit + Gemini 1.5 Flash) |
| Fonts | DM Sans + Playfair Display (matches PtP brand) |

---

## Key Technical Decisions

**Pure SVG knowledge graph (no D3)** — avoids React/D3 DOM conflicts, demonstrates trigonometric layout computation, keeps the dependency tree clean.

**Weighted scoring over RAG** — cold-start problem: no provider embeddings exist yet. Weighted scoring is functional with zero infrastructure.

**4 journey types (not surrogacy/adoption as journeys)** — PtP is a navigation platform, not an agency. Surrogacy and adoption appear as provider referrals within the Exploring journey, accurately reflecting PtP's service boundaries.

**React Context over Redux** — matches PtP's existing AuthContext/VoiceContext pattern for easy integration.

---

## Integration Path

| Demo | Production PtP |
|---|---|
| Screen 1 form | NextAuth + MongoDB patient document |
| Mock JSON data | MongoDB Atlas + FHIR records from IRIS |
| Weighted scoring | MongoDB Vector Search → collaborative filter → ML model |
| Claude API | Google Genkit + Gemini 1.5 Flash |
| Local state | Persisted journey progress in MongoDB |

---

*Technical memo and architecture diagram included in submission.*