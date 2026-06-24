# NammaFix AI — Project Description

## Problem Statement Selected

**Community Hero — Hyperlocal Problem Solver**

## Solution Overview

NammaFix AI is a functional hackathon MVP that demonstrates a better way to structure local civic reports. A citizen can add a photo, description, landmark and optional area. Gemini (or a clearly labelled local fallback) turns that input into a category, urgency score, suggested department, concise complaint summary and next action. The browser then supports a transparent demo workflow for verification and triage.

## Prototype Boundaries

NammaFix AI does **not** currently submit reports to municipal bodies or connect to official systems. Data is stored in browser `localStorage`; Demo Seed reports provide a populated first-run experience; status and Authority Console changes are local demo actions. These boundaries are visible in the product UI.

## Key Features

- Photo, location, ward/area and description-based issue reporting
- Google Gemini structured analysis with a transparent Demo AI fallback
- Local duplicate matching using category, title and location/area keywords
- Community verification actions persisted in the browser
- Source labels for **User Report** and **Demo Seed**
- Authority Console Prototype for locally updating status, notes and duplicates
- Impact metrics and a Demo Community Scoreboard calculated from current browser data
- Presentation-ready Demo Flow

## Technologies Used

- React + Vite
- Tailwind CSS
- React Router
- Lucide React
- localStorage

## Google Technologies Utilized

Google Gemini API through a Google AI Studio API key. Gemini receives the citizen report text and optional photo and returns strict structured JSON. When the API key is missing or the request fails, NammaFix AI uses a deterministic fallback and labels the result **Demo AI Analysis** rather than claiming Gemini was used.

## Impact

The MVP shows how small, unstructured local complaints can become useful, comparable civic reports. It also demonstrates the value of transparent prioritisation and community confirmation without overstating official deployment or city-wide data coverage.

## Innovation

NammaFix AI treats AI as a report-preparation and workflow-assistance layer, not a generic chatbot. The model creates useful structure, an urgency signal, a likely department suggestion and next steps; the human user remains able to inspect, verify and manage every local demo action.

## Agentic AI Depth

The AI workflow reads available evidence, suggests a category, estimates urgency, proposes a likely department, drafts a resolution checklist and surfaces duplicate keywords. The local duplicate check makes this visible and practical in the MVP without claiming unavailable backend intelligence.

## Future Scope

Official integrations, authenticated roles, server-side media storage, map clustering, multilingual voice reports, embedding-based duplicate matching and human-verified resolution photos are explicit future work.
