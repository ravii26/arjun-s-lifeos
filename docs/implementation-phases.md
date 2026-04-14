# LifeOS Implementation Phases

This file tracks practical build phases for the design-first LifeOS roadmap.

## Phase 1: Baseline Health (completed)

- Remove lint-blocking errors.
- Keep tests green after changes.
- Ensure route fallback behavior for unknown URLs.
- Fix local route-driven UI state desync.

## Phase 2: Product Definition (completed)

- Keep README aligned with actual UX and architecture.
- Define AI communication principles in implementable terms.
- Add clear boundaries for tone, triggers, and user safety.

## Phase 3: Reusable UI Foundation (completed)

- Extract shared `BottomSheet` primitive.
- Extract shared section headers and stat cards.
- Normalize spacing, typography, radius, and interaction styles.

## Phase 4: Data Integrity (completed)

- Introduce persistent local storage for core entities.
- Add baseline storage key structure (full migration versioning is next).
- Replace hardcoded score summaries with computed signals.

## Phase 5: Intelligence Layer UX (completed)

- Add explainability UI: "Why this insight".
- Add confidence tags for pattern cards.
- Add frequency caps for AI messages.

## Phase 6: Demo and Showcase (active)

- Add scenario presets: momentum week, slump week, recovery week. (completed)
- Add a quick guided walkthrough mode. (completed)
- Polish transitions and mobile interactions for presentation. (next)

## Definition of Done for Current Sprint

- `npm run lint` has no errors.
- `npm run test` passes.
- README explains what the project is and where it is headed.
- Next coding phase has a documented, sequenced plan.

## Completed in This Sprint

- Fixed lint-blocking errors and preserved passing tests.
- Added wildcard route fallback and connected NotFound route.
- Synced area goal state with route changes in Area Detail.
- Added reusable `BottomSheet`, `SectionHeader`, `StatCard`, and `Pill` components.
- Added persistence for tasks, habits, notes, resources, vault items, and day rating.
- Replaced static weekly score with computed score from current behavioral data.
- Added AI message frequency capping hooks in app context.
- Added "Why this insight" explainability in Dashboard and Review.
- Added confidence tags and evidence details for weekly pattern cards.
- Added dashboard demo presets and guided walkthrough controls.
