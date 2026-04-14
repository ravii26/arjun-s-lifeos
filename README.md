# LifeOS

LifeOS is a design-first personal operating system for life improvement.
It combines execution (tasks + habits), awareness (weekly review + scores), learning (resources + notes), and emotional recovery (Vault) in one connected interface.

## Product Intent

LifeOS aims to close three gaps at once:

- Clarity gap: What matters right now?
- Execution gap: Why do I know what to do but still not do it?
- Awareness gap: What patterns are driving my good and bad weeks?

The app is currently prototype/design-focused. Most data is seeded in memory for UX iteration speed.

## Current App Flow

1. Dashboard: daily orientation, quick status, score snapshots.
2. Focus: today tasks + habits + backlog management.
3. Vault: emotional support content for difficult days.
4. Learn: courses, notes, and resource triage.
5. Review: weekly reflection and pattern framing.
6. Area Detail: deeper view for one life area.

## Life Areas

- Career & Skills
- Health & Body
- Mind & Learning
- Finance
- Relationships
- Creative

## Tech Stack

- React 18 + TypeScript + Vite
- React Router
- Tailwind CSS + custom CSS variables
- Vitest for unit tests
- Playwright config scaffolded for E2E

## Run Locally

```bash
npm install
npm run dev
```

## Quality Commands

```bash
npm run lint
npm run test
```

## Current Status

- Lint: passing with warnings (no blocking errors)
- Tests: passing (baseline test exists)
- Routing: wildcard 404 route added
- Known limitation: app state is mostly in-memory (except theme)

## Implementation Plan (Step-by-Step)

### Step 1 - Baseline Health (done)

- Fixed blocking lint errors in UI utility components and Tailwind config.
- Added wildcard route fallback to NotFound.
- Fixed area goal state sync when navigating between area pages.

### Step 2 - Product Clarity (in progress)

- Improve documentation and architecture visibility.
- Define AI voice, trigger rules, and safety boundaries in docs.
- Keep design language consistent and reusable.

### Step 3 - Design-System Refactor

- Extract repeated sheet/card sections into shared components.
- Reduce duplicated interaction patterns across pages.
- Standardize spacing, typography scale, and motion tokens.

### Step 4 - Data and Insight Integrity

- Move seeded state to persistent local storage.
- Add explainable score calculations from real events.
- Add confidence labels for AI pattern cards.

### Step 5 - Demo-Ready Narrative

- Add curated states: momentum, slump, recovery.
- Create a 2-minute guided walkthrough flow.
- Add stronger showcase interactions for presentation.

## Notes

This repository is currently optimized for design and interaction development, not backend production readiness.
