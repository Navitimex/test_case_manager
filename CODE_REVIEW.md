# TestFlow — Code Review & Audit

> Pre-run audit of the existing system and the new AI generator feature. Findings are grouped by severity with concrete fixes. Date: 2026-06-16.

## Resolution status (updated 2026-06-16)
All Critical, High, Medium, and Low items below have been addressed in code, except:
- **M7 (JWT in localStorage):** kept as a deliberate trade-off (documented here), not changed.
- **H1 schema change** requires running the Prisma migration once: `npx prisma migrate dev --name testcase_text_fields`.

A new admin-only role-management endpoint was also added (`GET /api/users`, `PATCH /api/users/:id/role`) so admins can promote users, now that self-registration is locked to USER.

## Critical

### C1. Privilege escalation on registration
`backend-api/src/controllers/authController.ts` (`register`) takes the role straight from the request body:
```ts
data: { name, email, password: hashedPassword, role: role ?? 'USER' }
```
The `POST /api/auth/register` route is public (no `verifyToken`). Anyone can self-register as `ADMIN` by sending `{ "role": "ADMIN" }`, gaining full control over users, elements, and test cases. The frontend `authApi.register` even forwards a `role` argument.

**Fix:** Never trust a client-supplied role. Force new users to `USER` and remove `role` from the public payload. Role changes should only happen through an admin-protected endpoint (`verifyToken` + `isAdmin`).
```ts
// register(): ignore req.body.role
data: { name, email, password: hashedPassword, role: 'USER' }
```

## High

### H1. AI bulk-save can fail on long fields (new feature)
In `schema.prisma`, `title`, `description`, `preconditions`, and `priority` are plain `String` → MySQL `VARCHAR(191)`. Only `steps` and `expectedResult` are `@db.Text`. AI-generated `description`/`preconditions` can easily exceed 191 characters, which makes `prisma.testCase.create` throw. Because `bulkCreateTestCases` wraps all inserts in a single `$transaction`, one long field rolls back the entire batch and returns 500 — the user loses every reviewed case.

**Fix:** Make `description` and `preconditions` `@db.Text` (add a migration), and/or truncate/validate field lengths before saving. Optionally guard `title` length in the controller.

### H2. AI endpoint has no cost / abuse controls (new feature)
`POST /:elementId/testcases/generate` accepts an unbounded `requirements` string and has no rate limiting. A logged-in QA/ADMIN could trigger large or repeated model calls, driving up Anthropic costs. (`count` is already capped at 20 — good.)

**Fix:** Cap `requirements` length (e.g. 8,000 chars) with a 400 on overflow, and add per-user rate limiting on the generate route (e.g. `express-rate-limit`).

### H3. Multiple PrismaClient instances
Each controller instantiates its own client — `authController`, `elementController`, `testCaseController`, `aiController` all call `new PrismaClient()`. Under `nodemon` hot-reload and concurrent requests this leaks DB connections and can exhaust the pool.

**Fix:** Create a single shared client and import it everywhere:
```ts
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
```

## Medium

### M1. No startup validation of JWT_SECRET
`jwt.verify/sign(..., process.env.JWT_SECRET as string)` casts away the possibility of `undefined`. If the env var is missing, auth fails at runtime with a 500 instead of a clear boot error. **Fix:** validate required env vars at startup and exit if absent.

### M2. Not-found returns 500 instead of 404
`updateTestCase`, `deleteTestCase`, and `deleteElement` call Prisma `update`/`delete` without checking existence first. A missing record throws `P2025`, caught by the generic 500 handler. **Fix:** catch `P2025` (or pre-check) and return 404.

### M3. CORS is fully open
`app.use(cors())` allows every origin. **Fix:** restrict to known frontend origins via an env allowlist for non-local environments.

### M4. No rate limiting on login/register
Brute-force and credential-stuffing are unmitigated. **Fix:** add `express-rate-limit` to the auth routes.

### M5. Weak input validation
No password length/strength check, no explicit email-format validation, and `status`/`priority` are accepted as free strings. An invalid `status` value reaches Prisma and 500s; `priority` accepts anything. **Fix:** validate inputs (consider `zod`), validate the `Status` enum, and constrain `priority`.

### M6. Destructive actions have no confirmation (UI)
`page.tsx` `handleDelete` deletes a test case immediately on click — no confirm dialog → easy accidental data loss. **Fix:** add a confirmation step (modal or inline).

### M7. JWT stored in localStorage
The Zustand `persist` store keeps the token in localStorage, which is readable by any injected script (XSS → token theft). This is a common trade-off; if the threat model warrants it, move to an httpOnly cookie. At minimum, keep dependencies patched and sanitize any rendered user content.

## Low / polish

- **L1.** `TopNav` search box is decorative — no `onChange`/handler. Wire it up or hide it until implemented.
- **L2.** `selectedElementId` is not persisted (`partialize` excludes it); it resets on reload. The Sidebar re-selects the first element, so impact is minor.
- **L3.** `Sidebar` `useEffect` depends only on `[token]` but reads `selectedElementId` — missing exhaustive deps; works today but is a latent stale-closure bug.
- **L4.** Swallowed errors: `Sidebar.handleAddElement` and `page.fetchTestCases` only `console.error` — the user gets no feedback on failure. Add lightweight error UI.
- **L5.** No `.env.example`. Add one documenting `DATABASE_URL`, `JWT_SECRET`, `PORT`, and `ANTHROPIC_API_KEY` for onboarding.
- **L6.** Docs vs schema mismatch: `CLAUDE.md` describes `Elements → Test Cases → Steps`, but `steps` is a `Text` field, not an entity. Align the docs or model.
- **L7.** AI controller returns the raw error message to the client (`error.message`) — minor info disclosure. Log details server-side; return a generic message.
- **L8.** `priority` has no enum at the DB/validation level — values can drift (e.g. "high" vs "High").

## What already looks good
- `.env` is correctly gitignored and not tracked; the README-style comments are helpful.
- Passwords hashed with bcrypt; JWT has an 8h expiry.
- RBAC middleware (`verifyToken`, `isAdminOrQA`, `isAdmin`) is clean and the new AI routes reuse it correctly.
- TypeScript `strict` is on in both apps; both typecheck clean.
- Consistent design system and component structure; the new feature follows existing conventions.

## Suggested order of fixes
1. **C1** (privilege escalation) — before any real use.
2. **H1 / H3** — before running the AI feature end-to-end (correctness + stability).
3. **H2, M1–M5** — hardening pass.
4. Low items as polish.
