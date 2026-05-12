# LifeOS (Arjun's LifeOS)

AI-generated UI/UX prototype of a personal operating system that unifies execution, learning, planning, and personal growth into one workspace.

---

## 1. 🚀 Project Overview

LifeOS is a productivity and self-management platform concept designed to help users run their life through one integrated interface instead of switching between separate task apps, note apps, habit trackers, and learning tools.

This repository currently represents a **design-rich frontend prototype** created using AI (Codex) and refined in React. It already demonstrates navigation, interaction patterns, and conceptual workflows across all major modules, but it is **not yet a fully built product system**.

Current implementation reality:
- Rich UI and route-level interactions exist.
- Local prototype logic exists for many modules.
- Persistence is partial and split across local stores.
- No production backend/API/auth database exists yet.

Target users:
- Students and professionals managing goals across multiple life domains.
- Founders/creators balancing deep work, learning, and personal systems.
- Anyone wanting one "Life Command Center" with area-based scoring and guided execution.

---

## 2. 🧠 Vision & Goal

The final product vision is to become a true **Life Operating System** where:

- Every activity (task, habit, calendar session, note, learning resource) maps to a Life Area.
- Users can move from capture -> organize -> execute -> reflect without context switching.
- The platform continuously computes momentum and recommends next best actions.
- Knowledge and action stay connected (example: convert learning notes/resources directly into tasks).

Long-term goal:
- Build a secure, multi-tenant, cloud-backed product with intelligent automation, unified analytics, and reliable cross-device sync.

---

## 3. 🎨 Current Status (Design Phase)

### Built via Codex + React Prototype

This UI architecture was initially generated using AI (Codex) and then implemented as a high-fidelity frontend reference app.

Status classification:
- Stage: Design/prototype + interaction reference.
- Backend: Not implemented.
- Data model: Conceptual and partially simulated in local state/localStorage.
- Auth: Mock localStorage gating.

### Screens/Pages Currently Present

1. `/login` - Auth screen (login/register mode)
2. `/onboarding` - Area selection and setup simulation
3. `/dashboard` - Main command center with Overview and Insights
4. `/tasks` - Task lanes and execution controls
5. `/habits` - Habit tracker with streak mechanics
6. `/calendar` - Time blocking and focus session timeline
7. `/learn` - Learning graph workspace (topics/courses/notebooks/notes/resources)
8. `/learn/:entityType/:entityId` - Learning entity detail pages
9. `/areas` - Life area analytics and trends
10. `/areas/:areaKey` - Per-area detail workbench
11. `/vault` - Personal memory/support repository
12. `/dump` - Unstructured thought capture + heuristic classification
13. `/settings` - Profile, preferences, and controls
14. `/design` - Internal visual design system reference

### Global Layout and Navigation Components

Visible app shell elements:
- Sidebar with grouped nav: Execution, Growth, Support.
- Top bar with page title, vibe selector, focus mode toggle.
- Search trigger for Command Palette (`Cmd/Ctrl + K`).
- Toast/notification overlay system.

### What Each Major UI Element Is Intended to Do

| UI Element | Current Prototype Behavior | Intended Final Behavior |
|---|---|---|
| Login/Register form | Writes local auth flags | Secure auth with hashed credentials or OAuth + session/JWT |
| Onboarding area picker | Collects preferred life areas visually | Creates initial user profile, areas, default goals/habits |
| Dashboard "Next Action" card | Simulated recommendation | Rule + AI-driven action engine based on area deficits |
| Task lanes (Today/Backlog/Missed) | Local store operations | Server-backed task engine with scheduling and recurring rules |
| Habit cards | Local interaction tracking | Persistent habits, reminders, streak integrity, analytics |
| Calendar blocks/sessions | LocalStorage timeline | Syncable calendar + planned vs actual performance metrics |
| Learn tabs | Persistent local graph store | Knowledge graph service with backlinks and semantic search |
| Learn -> Task conversion | Appends to local task store | Transactional API conversion with provenance tracking |
| Areas trend chart | Local charting from local store | Computed score service from unified events/tasks/habits/sessions |
| Vault cards and filters | In-memory data | Persistent secure repository with tagging, retrieval, and recommendations |
| Dump auto-process simulation | Heuristic UI simulation | Real AI classification + extraction + multi-entity creation |
| Settings data controls | Placeholder actions | Real export/import/backup and policy-managed account controls |

---

## 4. 🧩 Features (Planned)

This section translates visible UI to intended product functionality.

### Authentication and User Identity

- Email/password and OAuth support.
- Access and refresh token flows.
- Device/session management.
- User profile bootstrap on first login.

### Area-Centric Life Modeling

- Custom life areas (Career, Health, Finance, Mind, Relationships, Creative, etc.).
- Weighted scoring per area.
- Area-level trends from completed work and behavioral consistency.

### Task Execution Engine

- Task types: boolean, count, timer, manual.
- Priority levels and effort estimates.
- Scheduling, due dates, missed-task carry-forward.
- Deep links from learning and area modules.

### Habit Intelligence

- Habit creation with cadence targets.
- Boolean/count/timer style tracking.
- Streak and adherence analytics.
- Trigger conditions and reminder windows.

### Calendar and Focus Sessions

- Time block planning.
- Session tracking (planned vs actual).
- Area allocation analysis (where time is really spent).
- Future calendar integrations (Google/Outlook sync).

### Learning Graph

- Entities: domains, topics, courses, notebooks, notes, resources.
- Link entities by IDs for relationship traversal.
- Convert notes/resources to actionable tasks.
- Route-based detail pages for sharable deep links.

### Vault (Second Brain + Emotional Support)

- Store motivational and reflective content types.
- Filter by area, tags, emotional state context.
- Recommendation layer for low-energy periods.

### Dump Capture + AI Processing

- Rapid brain dump intake.
- AI-assisted extraction into tasks, habits, notes, resources, vault items.
- Queue-based processing and review before commit.

### Command Palette and Global Search

- Universal action/search layer.
- Jump to entities quickly.
- Run quick commands (create task, start timer, open area, etc.).

---

## 5. 🔄 User Flow

### Primary Journey (Planned End-to-End)

1. User signs up or logs in.
2. User completes onboarding (select areas + goals).
3. System generates starter workspace.
4. User lands on dashboard and sees next best action.
5. User executes tasks/habits and tracks focus time.
6. User captures learning and links it to life areas.
7. User converts learning outputs into executable tasks.
8. User checks area trends and adjusts priorities.
9. User stores key insights in Vault.
10. User dumps raw thoughts; AI structures into actionable items.
11. User reviews weekly insights and plans next cycle.

### Existing Prototype Flow Highlights

- Auth gating through localStorage keys.
- Onboarding route enters dashboard after completion.
- Learn module can push generated tasks into task store.
- Area Detail can deep-link into Learn with tab and area scope.
- Command Palette offers cross-module navigation and lookup.

---

## 6. 🏗️ Planned Architecture

### Frontend Architecture (Recommended)

Stack recommendation:
- React + TypeScript (existing direction, keep).
- React Router (existing).
- TanStack Query for API state.
- Zod for schema validation at boundary.
- Design system layer based on current tokens and reusable primitives.

Frontend architectural approach:
- Feature-based modules (`auth`, `dashboard`, `tasks`, `habits`, `calendar`, `learn`, `areas`, `vault`, `dump`, `settings`).
- Shared core layers:
	- `app` (routing/layout/providers)
	- `entities` (types/domain models)
	- `features` (business interactions)
	- `shared` (ui/api/utils)
- Replace mixed local state with API-backed domain hooks.
- Keep local optimistic interactions for speed, sync with server truth.

### Backend Architecture (Recommended)

Stack recommendation:
- Node.js + TypeScript.
- Framework: NestJS or Fastify (modular, scalable APIs).
- ORM: Prisma.
- Queue: BullMQ (for async AI processing and background jobs).
- Cache: Redis (session/cache/rate-limits).

Service boundaries:
- Auth Service.
- User/Profile Service.
- Areas Service.
- Tasks Service.
- Habits Service.
- Calendar Service.
- Learning Graph Service.
- Vault Service.
- Dump/AI Processing Service.
- Insights/Scoring Service.

### Database Architecture (Recommended)

Database:
- PostgreSQL (primary relational source of truth).

Storage strategy:
- Normalized core entities.
- Event/audit tables for historical calculations.
- Soft-delete where user data recovery matters.

---

## 7. 📁 Suggested Project Structure

### Frontend (Suggested)

```txt
src/
	app/
		providers/
		router/
		layout/
	entities/
		user/
		area/
		task/
		habit/
		calendar/
		learn/
		vault/
	features/
		auth/
		onboarding/
		dashboard/
		tasks/
		habits/
		calendar/
		learn/
		areas/
		vault/
		dump/
		settings/
		command-palette/
	shared/
		api/
		ui/
		lib/
		hooks/
		types/
	styles/
```

### Backend (Suggested)

```txt
server/
	src/
		main.ts
		config/
		common/
			middleware/
			guards/
			interceptors/
			errors/
		modules/
			auth/
			users/
			areas/
			tasks/
			habits/
			calendar/
			learning/
			vault/
			dump/
			insights/
		jobs/
			queues/
			processors/
		db/
			prisma/
			migrations/
	tests/
```

---

## 8. 🗄️ Data Model (Planned)

### Core Entities

| Entity | Key Fields |
|---|---|
| User | id, email, passwordHash, name, timezone, createdAt, updatedAt |
| Session | id, userId, refreshTokenHash, deviceInfo, expiresAt |
| Area | id, userId, key, label, color, weight, isActive |
| Task | id, userId, areaId, title, description, priority, type, status, lane, dueAt, estimateMinutes |
| TaskProgress | id, taskId, date, progressValue, timerSeconds |
| Habit | id, userId, areaId, title, type, cadence, targetValue, status |
| HabitLog | id, habitId, date, value, durationSeconds |
| CalendarBlock | id, userId, areaId, title, startAt, endAt, status, source |
| FocusSession | id, userId, areaId, startedAt, endedAt, sourceTaskId |
| Domain | id, userId, name, areaId |
| Topic | id, userId, domainId, title, skillLevel, status |
| Course | id, userId, topicId, title, progressPercent, status |
| Notebook | id, userId, topicId, title |
| Note | id, userId, notebookId, topicId, courseId, title, content |
| Resource | id, userId, topicId, url, title, status, tags |
| VaultItem | id, userId, areaId, type, title, content, tags, purposeTag, intensity |
| DumpEntry | id, userId, rawText, detectedType, confidence, processingStatus |
| ScoreSnapshot | id, userId, areaId, score, date |

### Relationship Summary

- One user has many areas, tasks, habits, sessions, learning entities, vault items.
- Tasks and habits belong to one area.
- Domains/topics/courses/notebooks/notes/resources form the learning graph.
- Area scoring is derived from aggregated events and snapshots.
- Dump entries can generate one or many domain entities through processing jobs.

---

## 9. 🔌 API Design (Planned)

Base: `/api/v1`

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

### Areas

- `GET /areas`
- `POST /areas`
- `PATCH /areas/:id`
- `DELETE /areas/:id`
- `GET /areas/:id/insights`

### Tasks

- `GET /tasks?lane=today&areaId=...`
- `POST /tasks`
- `PATCH /tasks/:id`
- `PATCH /tasks/:id/status`
- `POST /tasks/:id/progress`
- `POST /tasks/:id/timer/start`
- `POST /tasks/:id/timer/stop`

### Habits

- `GET /habits`
- `POST /habits`
- `PATCH /habits/:id`
- `POST /habits/:id/logs`
- `GET /habits/:id/streak`

### Calendar

- `GET /calendar/blocks?start=...&end=...`
- `POST /calendar/blocks`
- `PATCH /calendar/blocks/:id`
- `DELETE /calendar/blocks/:id`
- `POST /calendar/sessions/start`
- `POST /calendar/sessions/stop`

### Learning

- `GET /learning/domains`
- `POST /learning/topics`
- `PATCH /learning/topics/:id`
- `POST /learning/courses`
- `PATCH /learning/courses/:id`
- `POST /learning/notebooks`
- `POST /learning/notes`
- `PATCH /learning/notes/:id`
- `POST /learning/resources`
- `PATCH /learning/resources/:id`
- `POST /learning/convert/note-to-task`
- `POST /learning/convert/resource-to-task`

### Vault

- `GET /vault/items`
- `POST /vault/items`
- `PATCH /vault/items/:id`
- `DELETE /vault/items/:id`

### Dump and AI

- `POST /dump/entries`
- `GET /dump/entries`
- `POST /dump/entries/:id/analyze`
- `POST /dump/entries/:id/convert`
- `POST /dump/auto-process`

### Insights

- `GET /insights/dashboard`
- `GET /insights/areas/:id/trend`
- `GET /insights/momentum`

---

## 10. ⚙️ Future Development Plan

### Phase 1: Stabilize Prototype -> Production Frontend Base

1. Convert all remaining JSX modules to strict TypeScript.
2. Introduce typed domain models shared with backend contracts.
3. Replace mixed local store usage with API layer + React Query.
4. Preserve current UI behavior while moving state ownership to services.

### Phase 2: Build Core Backend

1. Create backend project with auth + user + area + task modules.
2. Design and migrate PostgreSQL schema.
3. Implement JWT + refresh token lifecycle.
4. Add rate limits, validation, and structured error handling.

### Phase 3: Integrate Feature Modules

1. Connect Tasks/Habits/Calendar to backend.
2. Connect Learn graph entities and conversion actions.
3. Connect Vault and Dump persistence.
4. Build scoring/insights computation service.

### Phase 4: Intelligence and Automation

1. Implement Dump AI extraction service.
2. Implement Next Action recommendation engine.
3. Add personalized reminders and nudges.

### Phase 5: Hardening and Release

1. Add full test coverage (unit/integration/e2e).
2. Add observability (logs/metrics/traces).
3. Security review and data policy hardening.
4. Staging rollout -> production launch.

---

## 11. 🧪 Testing Strategy (Planned)

### Frontend

- Unit tests with Vitest + Testing Library.
- Component tests for forms, tabs, list interactions, modals.
- Router tests for auth gating and deep links.
- Visual regression snapshots for major screens.

### Backend

- Unit tests for services and validators.
- Integration tests for each module with test DB.
- Contract tests for request/response schemas.
- Queue/worker tests for AI processing jobs.

### End-to-End

- Playwright journeys:
	- login -> onboarding -> dashboard
	- create task and complete flow
	- note/resource -> convert to task
	- area detail -> learn scoped navigation
	- dump -> AI conversion -> entity creation

Quality gates:
- PR requires passing lint + tests.
- API contract checks in CI.
- Release branch requires e2e smoke suite.

---

## 12. 🚀 Deployment Plan (Future)

### Environments

- Local (developer).
- Staging (pre-release validation).
- Production.

### Infrastructure (Recommended)

- Frontend: Vercel/Netlify.
- Backend: Render/Fly.io/AWS ECS.
- Database: Managed PostgreSQL (Neon/Supabase/RDS).
- Cache/Queue: Redis (Upstash/Elasticache).
- Storage: S3-compatible for attachments/exports.

### CI/CD

- GitHub Actions pipeline:
	- install -> lint -> test -> build
	- migrate DB on deploy
	- run smoke tests post-deploy

### Operations

- Structured logging + dashboards.
- Error tracking (Sentry).
- Backup and restore plan for database and critical exports.

---

## 13. ⚠️ Limitations (Current)

- No backend exists yet.
- Current auth is mock/local only.
- Static/prototype behavior in several modules.
- Persistence is inconsistent across modules.
- Some cross-module interactions are simulated, not canonical.
- Command palette and dump flows are partially disconnected from real persistent entities.

---

## 14. 📌 Notes for Developers

If you are starting development from this design, use this sequence:

1. Treat current UI as interaction contract, not final data architecture.
2. Define canonical domain schema first (users, areas, tasks, habits, learning graph, vault, dump, insights).
3. Build backend modules and API contracts before deep frontend refactors.
4. Migrate one module at a time from local state to API-backed state.
5. Keep route structure and UX flows stable to preserve product intent.
6. Add telemetry early to validate real usage patterns.

### Local Prototype Commands (Current)

```bash
npm install
npm run dev
npm run test
npm run build
```

### Build Priority Recommendation

1. Auth + Users + Areas.
2. Tasks + Habits + Calendar.
3. Learn graph + conversions.
4. Vault + Dump processing.
5. Insights and recommendation engine.

---

## Appendix: Current Prototype Persistence Keys

- `lifeos_auth`
- `lifeos_onboarded`
- `lifeos.tasks.v1`
- `lifeos.areas.v1`
- `lifeos.learning-graph.v1`
- `lifeos.calendar.v1`

This README intentionally separates what is already implemented in the prototype from what is planned for production so engineering can execute from a clear, realistic baseline.
