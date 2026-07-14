# AI Directives & Project Architecture

## 1. Project Overview
TestFlow is a modern, modular Test Case Management System designed to serve as a foundational platform for QA Automation (Playwright, Cypress, Selenium). It uses a Monorepo structure.
- **Frontend:** Next.js (App Router), Tailwind CSS, Zustand (client/UI state), TanStack Query (server state & data fetching).
- **Backend:** Node.js, Express, Prisma ORM, MySQL, Zod (request validation).
- **Shared:** A `@testflow/shared` package holds the domain types imported by both apps (consumed type-only) to avoid duplication.

## 2. Core Architectural Rules (STRICT)
- **Separation of Concerns:** The frontend strictly handles UI rendering and API fetching. The backend strictly handles data validation, business logic, DB queries, and authentication.
- **No Page Reloads (Fluid UI):** Navigation between "Elements" must be handled via Next.js client-side routing and Zustand state. Fetching new test cases should update the UI dynamically without refreshing the browser.
- **Explicit Types:** All TypeScript interfaces and Prisma models must be strictly typed. Avoid `any`.

## 3. Data Hierarchy & Encapsulation
Test Cases do NOT exist independently. They follow a strict hierarchy:
`Elements (Modules) -> Test Cases -> Steps`
- **Elements:** Represent physical or logical parts of the application (e.g., "Header Nav", "Hero Section", "Checkout Flow").
- **Test Cases:** Belong to an Element. For example, the Element "Header Nav" encapsulates the test cases "Verify Left Logo", "Verify Sign In button".
- **Steps:** Stored as a text field on each Test Case (the `steps` column), not as a separate database entity.

## 4. Authentication & RBAC (Role-Based Access Control)
- **Mechanism:** JWT signed server-side and delivered in an **httpOnly cookie** (not readable by JavaScript, mitigating XSS token theft); bcrypt for password hashing. The frontend sends requests with `credentials: 'include'`; CORS runs with `credentials: true` and an origin allowlist. The cookie is `sameSite: 'lax'` and `secure` in production. `POST /api/auth/logout` clears it.
- **Roles:**
  - `ADMIN`: Can manage Users, Elements, and all Test Cases.
  - `QA`: Can create/edit/delete Elements and Test Cases, but cannot manage users.
  - `USER`: Read-only access to view Elements and Test Case execution statuses.
- **Registration is locked to `USER`.** The role is never read from the request body; promotions go through the admin-only endpoint `PATCH /api/users/:id/role` (`verifyToken` + `isAdmin`).
- **Implementation:**
  - `verifyToken` reads the JWT from the cookie (falling back to a `Bearer` header); `isAdminOrQA` / `isAdmin` guard privileged actions. Auth and AI routes are rate-limited (`express-rate-limit`).
  - All request bodies are validated by **Zod** middleware (`validate(schema)`) before reaching controllers; schemas live in `src/schemas.ts`.
  - Frontend conditionally renders UI by role; a `401` response clears the persisted user and redirects to `/login`.

## 5. State Management
- **Client/UI state — Zustand (`useAppStore`):** `user` (authenticated user + role — the auth token itself lives only in the httpOnly cookie, never in the store), `selectedElementId` (active Element in the sidebar), and `searchQuery`. Only `user` and `selectedElementId` are persisted; never persist secrets.
- **Server state — TanStack Query:** all API reads/writes go through hooks in `lib/queries.ts` (`useElements`, `useTestCases`, and create/update/delete/bulk mutations). Mutations invalidate the relevant query keys so the UI refreshes automatically — no manual refetching or local list mutation.

## 6. Backend Error Handling Patterns
Controllers must distinguish the following Prisma error codes and return appropriate HTTP status codes:
- **P2025 (record not found):** `isRecordNotFound(error)` helper → `404 Not Found`
- **P2002 (unique constraint violation):** `isUniqueConstraint(error)` helper → `409 Conflict` with a human-readable message (e.g. "Element name already in use")
- **Unhandled errors:** → `500 Internal Server Error`

Both helpers live in `src/lib/prisma.ts`. Always handle P2002 wherever a model has a `@unique` field that the user controls (e.g. `Element.name`, `User.email`).

## 7. Development Workflow for AI
When asked to build a new feature, follow these steps sequentially:
1. Update Prisma Schema (`schema.prisma`) if needed and generate the client.
2. Build/Update Backend Express Controllers and Routes. Test logic.
3. Build/Update the frontend data layer: Zustand store, `lib/api.ts`, and TanStack Query hooks in `lib/queries.ts`.
4. Build/Update Next.js UI Components following the `DESIGN.md` guidelines.

## 8. Language Convention (STRICT)
The entire codebase and all project artifacts MUST be written in **English** — no exceptions. This applies to:
- **Code:** variable, function, class, and file names; TypeScript types and interfaces.
- **Comments & docstrings:** all inline and block comments.
- **Documentation:** every `.md` file (README, design docs, plans, etc.).
- **Frontend / UI text:** all user-facing labels, buttons, placeholders, headings, and messages.
- **Database & API:** Prisma model and field names, API routes, JSON payload keys, and enum values.
- **Git:** commit messages and branch names.

This rule governs the project's content only; it is independent of the spoken language used when chatting with the user. Any new or edited file must comply, and any existing non-English content must be translated to English whenever that file is touched.
