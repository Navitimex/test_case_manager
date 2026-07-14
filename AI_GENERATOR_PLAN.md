# Plan: AI Test Case Generator for TestFlow

> Orientation and work plan. Status: **decisions confirmed (2026-06-16)** — ready for Phase 1.
> **Confirmed:** Claude API · save with prior review · MVP with text requirements.

## 1. Objective
Add a feature to TestFlow that **automatically generates test cases with AI**, based on:
- Requirements / user stories (text)
- Source code of the project under test
- An existing web/mobile application (by exploring it)

Generated cases are **reviewed and saved** within the current hierarchy: **Element → Test Case** (with their `steps` and `expectedResult`).

## 2. Starting point (what you already have)
- **Monorepo:** `backend-api` (Express 5 + Prisma + MySQL + JWT) and `frontend-ui` (Next.js 16 + Tailwind + Zustand).
- **Data model:** `User`, `Element`, `TestCase` (fields: `title`, `description`, `preconditions`, `steps` [Text], `expectedResult` [Text], `status`, `priority`).
- **Relevant endpoints:** `POST /api/elements/:elementId/testcases` (create case), `GET .../testcases`, `PUT/DELETE /api/testcases/:id`.
- **Roles:** ADMIN / QA / USER. Creating and editing requires ADMIN or QA (`isAdminOrQA`).

**Conclusion:** your foundation is ideal. **No new project is needed** — the "agent" is added as a module inside this same repo.

## 3. Key concept: "AI feature" or "agent"?
To align expectations, since this is your first project of this kind:
- **Generating cases from text or code = 1 structured LLM call.** It is not an "agent" in the strict sense: it is a call that returns a JSON with the cases. It is the simplest path and the one with the highest immediate value.
- **Exploring a live app = truly agentic:** the system navigates the app with an automated browser, observes the interface, and decides what to test in a loop. More powerful and more complex.

**Recommendation:** start with the first (text) and increase complexity in phases.

## 4. Proposed architecture (fits your stack)
Respecting your separation of concerns (CLAUDE.md):

**Backend (`backend-api`):**
- New service `src/services/aiGenerator.ts`: builds the prompt, calls the LLM with **structured output (tool use / JSON schema)**, and returns an array shaped like `TestCaseFormData`.
- New controller `src/controllers/aiController.ts` + route `POST /api/elements/:elementId/testcases/generate` (protected with `verifyToken` + `isAdminOrQA`). Returns a **preview** (does not save yet).
- Endpoint to persist approved cases: `POST /api/elements/:elementId/testcases/bulk` (creates multiple cases with `authorId = req.user.id`, `status = DRAFT`).
- New environment variable: `ANTHROPIC_API_KEY` in `backend-api/.env`.

**Frontend (`frontend-ui`):**
- **"Generate with AI"** button next to "New Test Case" inside an Element.
- **Side drawer** (Jira style, per DESIGN.md) with: input type (Requirements / Code / URL), textarea, number of cases, and a Generate button.
- **Review list:** proposed cases appear with a checkbox and quick edit → "Save selected".
- `lib/api.ts`: add `testCasesApi.generate(...)` and `testCasesApi.bulkCreate(...)`.

## 5. User flow (human-in-the-loop)
1. The QA opens an Element (e.g., "Checkout Flow").
2. Clicks "Generate with AI", pastes the requirements, and chooses the number of cases.
3. The AI proposes N cases (title, preconditions, steps, expected result, priority) in **DRAFT** status.
4. The QA reviews, edits, or discards, and saves only the good ones.

**Why with review:** it keeps quality and QA ownership, and avoids inserting low-quality cases into the database.

## 6. Phased plan
- **Phase 0 — Setup:** API key, install the SDK, environment variables, and a "hello world" LLM call.
- **Phase 1 — MVP: Requirements → Cases (text).** Service + `generate` endpoint + `bulk` endpoint + drawer + review list. End-to-end working deliverable. **(Recommended starting point.)**
- **Phase 2 — From source code.** Allow pasting/uploading code and adjust the prompt to derive cases from the code's behavior.
- **Phase 3 — App exploration (agentic).** Integrate an automated browser (Playwright) to open the app, capture DOM/screenshots, and generate cases per UI element. This is where your "Elements" concept fits perfectly.

## 7. Key decisions (CONFIRMED)
1. **AI provider:** ✅ **Claude API (Anthropic SDK)**. Requires an API key (pay per use).
2. **Saving:** ✅ **With prior review** (human-in-the-loop).
3. **MVP scope:** ✅ **Text requirements** as the first input.

## 8. Prerequisites for Phase 1
- Anthropic account and API key (console.anthropic.com) → `ANTHROPIC_API_KEY` in `backend-api/.env`.
- `npm install @anthropic-ai/sdk` in `backend-api`.
- MySQL running and Prisma migrations up to date.

## 9. Phase 1 — implementation checklist
**Backend (`backend-api`):**
1. `npm install @anthropic-ai/sdk` and add `ANTHROPIC_API_KEY` to `.env`.
2. `src/services/aiGenerator.ts`: function that receives `(requirements, caseCount)`, calls Claude with structured output, and returns `TestCaseFormData[]`.
3. `src/controllers/aiController.ts`: `generateTestCases` (preview) and `bulkCreateTestCases` (save approved cases).
4. Routes in `routes/elements.ts`: `POST /:elementId/testcases/generate` and `POST /:elementId/testcases/bulk` (with `verifyToken` + `isAdminOrQA`).

**Frontend (`frontend-ui`):**
5. `lib/api.ts`: add `testCasesApi.generate(...)` and `testCasesApi.bulkCreate(...)`.
6. `GenerateWithAIDrawer.tsx` component: requirements textarea + number of cases + Generate button.
7. Review list with checkbox/edit → "Save selected".
8. "Generate with AI" button in the Element view.

**Verification:**
9. Test end-to-end: paste requirements → see preview → edit → save → confirm the cases appear in the Element table.

## 10. The only thing you need to do (prerequisite)
Create an **Anthropic API key** at https://console.anthropic.com → save it as `ANTHROPIC_API_KEY` in `backend-api/.env`. Without it the generator cannot call the model (the rest of the code can still be built and reviewed beforehand).
