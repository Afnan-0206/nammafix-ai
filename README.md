# NammaFix AI

> **Report local issues. Help your area get fixed faster.**

NammaFix AI is a functional browser-based hackathon MVP for **Community Hero — Hyperlocal Problem Solver** at Vibe2Ship. It demonstrates a practical civic reporting workflow: a citizen creates a structured report, AI prepares a triage summary, the community can verify it, and a prototype authority panel can prioritise it.

## Important prototype note

This is **not connected to BBMP, BWSSB, or any official municipal system**. Reports, verification counts, notes, status updates and scores are stored in the current browser using `localStorage`. Seed reports are clearly labelled **Demo Seed**. The Authority Console is a simulation of how a ward team could work with structured reports.

## What works

- Create reports with title, description, photo, landmark, optional ward/area and optional category.
- Use browser geolocation when permission is granted.
- Analyse reports with Google Gemini when `VITE_GEMINI_API_KEY` is set.
- Fall back to deterministic **Demo AI Analysis** when a key is absent or Gemini is unavailable.
- Save reports locally and display their source: **User Report** or **Demo Seed**.
- Identify possible duplicates locally using category, title and area/location word overlap.
- Verify issues, update local demo statuses, add notes and flag duplicates.
- Recalculate impact metrics and the Demo Community Scoreboard from browser data.
- Follow a presentation-ready [Demo Flow](./src/pages/DemoFlow.jsx).

## Google technology

The optional AI layer uses the **Google Gemini API / Google AI Studio**. `src/services/geminiService.js` sends the citizen text and optional image to Gemini and requests a strict JSON result containing category, severity, urgency, suggested department, summary and action plan.

When Gemini is not available, the same interface returns a transparent local fallback. The UI labels successful model output **Gemini Analysis** and fallback output **Demo AI Analysis**.

## Tech stack

- React + Vite
- Tailwind CSS
- React Router
- Lucide React
- Browser localStorage
- Google Gemini API (optional)

## Run locally

```bash
npm install
npm run dev
```

To enable Gemini, create `.env` from `.env.example`:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Build a production bundle:

```bash
npm run build
```

## Suggested demo flow

1. Open **Home** and explain that this is a local, functional hackathon MVP.
2. Open **Report Issue** and submit a photo/landmark-based issue.
3. Point out the clearly labelled Gemini or Demo AI result and any possible duplicate.
4. Open **Dashboard** to show the locally saved user report alongside Demo Seed reports.
5. Verify an issue, then use **Authority Console Prototype** to add a note, change status or flag a duplicate.
6. Open **Impact** and **Demo Community Scoreboard** to show metrics recalculated from the current browser.

## Project structure

```text
src/
  components/       Shared navigation, report cards and AI explanation
  data/             Clearly labelled Bengaluru demo seed reports
  pages/            Citizen, dashboard, prototype admin and demo screens
  services/         Gemini request and honest local fallback
  utils/            Local persistence, display helpers and duplicate matching
```

## Future scope

- Authenticated citizen and ward-officer accounts
- Server-side storage, media upload and audit trails
- Official municipal system integrations (subject to approval)
- Map-based report clustering and multilingual reporting
- Embedding-based duplicate detection and human resolution verification

---

Built as a serious, honest MVP: useful now in a browser, with official integrations intentionally left as future work.
# nammafix-ai
