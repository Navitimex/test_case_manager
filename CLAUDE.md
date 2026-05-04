# TestCase Manager — Claude Agent Context

## Project Overview

Web application for QA test case management. Supports up to 10 users with role-based access control.
Organized hierarchically: Projects → Modules → Test Cases.

**The Next.js app lives inside the `testcase-manager/` subdirectory.** All `npm` commands and file edits are relative to that folder.

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js App Router | 14.2.35 |
| Language | JavaScript | ES2022 |
| Styling | Tailwind CSS | 3 |
| Components | shadcn/ui | latest (only `button.jsx` installed so far) |
| Auth | NextAuth.js | v4.24 |
| Database | MongoDB Atlas (Free Tier M0) | - |
| ODM | Mongoose | 9.5 |
| State | React Query (TanStack Query) | 5.100 |
| Testing E2E | Playwright | 1.59 |
| CI/CD | GitHub Actions + Vercel | - |

**No TypeScript. Plain JavaScript (.js / .jsx) throughout the entire project.**

## Project Structure

```
testcase-manager/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.jsx          # credential login form
│   │   │   └── layout.jsx            # centers the login card
│   │   ├── (dashboard)/
│   │   │   ├── layout.jsx            # SessionProvider + QueryClientProvider + Sidebar
│   │   │   ├── page.jsx              # redirects to /projects
│   │   │   ├── projects/
│   │   │   │   ├── page.jsx          # project grid
│   │   │   │   └── [projectId]/
│   │   │   │       ├── page.jsx      # project detail + module list
│   │   │   │       └── modules/
│   │   │   │           └── [moduleId]/
│   │   │   │               └── page.jsx  # module detail + test case table + filters
│   │   │   └── test-cases/
│   │   │       └── [testCaseId]/
│   │   │           └── page.jsx      # test case detail / inline edit
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.js      # NextAuth handler
│   │   │   ├── projects/
│   │   │   │   ├── route.js          # GET (list), POST (create)
│   │   │   │   └── [projectId]/
│   │   │   │       └── route.js      # GET, PATCH, DELETE
│   │   │   ├── modules/
│   │   │   │   ├── route.js          # GET (?projectId=), POST (create)
│   │   │   │   └── [moduleId]/
│   │   │   │       └── route.js      # GET, PATCH, DELETE
│   │   │   ├── test-cases/
│   │   │   │   ├── route.js          # GET (list + filters + pagination), POST (create)
│   │   │   │   └── [testCaseId]/
│   │   │   │       └── route.js      # GET, PATCH, DELETE
│   │   │   └── users/
│   │   │       ├── route.js          # GET (list), POST (invite) — Admin only
│   │   │       └── [userId]/
│   │   │           └── route.js      # PATCH (role/isActive), DELETE — Admin only
│   │   ├── layout.js                 # root layout (Inter font not yet wired — uses Geist)
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   │   └── button.jsx            # shadcn/ui Button (do not modify)
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx           # nav + user footer + sign out
│   │   │   ├── Navbar.jsx            # exists but NOT wired into dashboard layout yet
│   │   │   └── PageHeader.jsx        # title + description + optional action button
│   │   ├── projects/
│   │   │   ├── ProjectCard.jsx       # card with admin-only edit/delete menu
│   │   │   └── ProjectForm.jsx       # name + description fields
│   │   ├── modules/
│   │   │   ├── ModuleList.jsx        # list rows with role-gated edit/delete buttons
│   │   │   └── ModuleForm.jsx        # name + description fields
│   │   └── test-cases/
│   │       ├── TestCaseTable.jsx     # data table with status/priority badges
│   │       ├── TestCaseForm.jsx      # full form incl. per-step expected/actual result
│   │       ├── TestCaseFilters.jsx   # status, priority, tags dropdowns/input
│   │       └── TestCaseDetail.jsx    # 2/3 + 1/3 layout: steps + metadata panel
│   ├── lib/
│   │   ├── db.js                     # Mongoose connection singleton (global cache)
│   │   ├── auth.js                   # NextAuth CredentialsProvider + JWT callbacks
│   │   ├── api-response.js           # ok / created / badRequest / unauthorized / forbidden / notFound / serverError
│   │   └── utils.js                  # cn() helper (clsx + tailwind-merge)
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Module.js
│   │   └── TestCase.js
│   ├── hooks/
│   │   ├── useProjects.js            # useProjects, useProject, useCreateProject, useUpdateProject, useDeleteProject
│   │   ├── useModules.js             # useModules, useModule, useCreateModule, useUpdateModule, useDeleteModule
│   │   └── useTestCases.js           # useTestCases (with filters), useTestCase, useCreate/Update/DeleteTestCase
│   ├── instrumentation.js            # Next.js instrumentation hook (DB warmup)
│   └── middleware.js                 # next-auth/middleware — protects all routes except /login and /api/auth
├── tests/
│   └── e2e/
│       ├── auth.spec.js
│       ├── projects.spec.js
│       ├── test-cases.spec.js
│       └── roles.spec.js
├── dns-fix.cjs                       # required by dev/start scripts for local DNS resolution
├── .env.local                        # never commit this file
├── .gitignore
├── playwright.config.js
├── tailwind.config.js
└── jsconfig.json                     # path alias @/ → src/
```

## Environment Variables

### .env.local (local development)
```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/testcase-manager
MONGODB_URI_TEST=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/testcase-manager-test
NEXTAUTH_SECRET=<random-string-min-32-chars>
NEXTAUTH_URL=http://localhost:3000
```

### Production (Vercel dashboard)
Same variables without NEXTAUTH_URL — Vercel sets the URL automatically.

### GitHub Secrets (CI)
```
MONGODB_URI_TEST
NEXTAUTH_SECRET
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

## Database Models

### User
```js
{
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, bcrypt-hashed),
  role: String (enum: ['admin', 'editor', 'viewer'], default: 'viewer'),
  isActive: Boolean (default: true),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Project
```js
{
  name: String (required),
  description: String,
  createdBy: ObjectId (ref: 'User', required),
  members: [{ userId: ObjectId (ref: 'User'), role: String (enum: ['admin','editor','viewer']), _id: false }],
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```
Creator is automatically added to `members` with role `'admin'` on POST.

### Module
```js
{
  name: String (required),
  description: String,
  projectId: ObjectId (ref: 'Project', required),
  createdBy: ObjectId (ref: 'User', required),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### TestCase
```js
{
  title: String (required),
  description: String,
  moduleId: ObjectId (ref: 'Module', required),
  projectId: ObjectId (ref: 'Project', required),   // denormalized for fast queries
  steps: [{
    order: Number (required),
    description: String (required),
    expectedResult: String,     // per-step — NOT at the test case root level
    actualResult: String,       // per-step — NOT at the test case root level
    _id: false
  }],
  priority: String (enum: ['critical', 'high', 'medium', 'low'], default: 'medium'),
  severity: String (enum: ['blocker', 'major', 'minor', 'trivial'], default: 'minor'),
  status: String (enum: ['pending', 'pass', 'fail', 'skipped'], default: 'pending'),
  assignedTo: ObjectId (ref: 'User'),
  tags: [String],
  createdBy: ObjectId (ref: 'User', required),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```
Indexes: `{ projectId: 1, status: 1 }` and `{ moduleId: 1 }`.

**Important:** `expectedResult` and `actualResult` belong to individual steps, not to the test case itself. Do not add them at the root level.

## Roles and Permissions

| Action | Admin | Editor | Viewer |
|---|---|---|---|
| Create / Edit / Delete test cases | ✓ | ✓ | ✗ |
| View test cases | ✓ | ✓ | ✓ |
| Create / Edit / Delete projects | ✓ | ✗ | ✗ |
| Create / Edit modules | ✓ | ✓ | ✗ |
| Delete modules | ✓ | ✗ | ✗ |
| Manage users (invite, change role, deactivate) | ✓ | ✗ | ✗ |
| Change test status (Pass/Fail) | ✓ | ✓ | ✗ |

**Important:** roles exist both globally (`user.role`) and per project (`project.members[].role`).
The per-project role takes precedence when the user is a member of that project.

In components, use:
```js
const role = session?.user?.role
const canEdit = role === 'admin' || role === 'editor'
const canDelete = role === 'admin'
```

## API Conventions

### Response format — always use helpers from `lib/api-response.js`
```js
import { ok, created, unauthorized, forbidden, badRequest, notFound, serverError } from '@/lib/api-response'

return ok(data)          // 200
return created(data)     // 201
return badRequest('msg') // 400
return unauthorized()    // 401
return forbidden()       // 403
return notFound('msg')   // 404
return serverError()     // 500
```

### Standard HTTP status codes
- `200` — success
- `201` — resource created
- `400` — bad request / validation error
- `401` — not authenticated
- `403` — authenticated but not authorized (wrong role)
- `404` — resource not found
- `500` — internal server error

### Every protected API route follows this pattern
```js
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return unauthorized()
  // role check if needed, then:
  await connectDB()
  // ... handler logic
}
```

### Query params for test case list
```
GET /api/test-cases?projectId=x&moduleId=x&status=pending&priority=high&assignedTo=x&tags=login,auth&page=1&limit=20
```
Response: `{ data: { testCases: [...], total, page, limit } }` — note the nested shape.

## Auth Details

- Provider: `CredentialsProvider` only (email + password)
- Passwords: hashed with `bcryptjs` (10 rounds) — no NextAuth MongoDB adapter, no magic links
- Session strategy: `JWT`
- JWT/session carries: `id`, `name`, `email`, `role`
- Login redirects to `/projects` on success; error shows `"Invalid email or password."`
- Demo credentials (password `Demo1234!`): admin@company.com / editor@company.com / viewer@company.com

## React Query Setup

QueryClient is created per-layout render (stable ref via `useState`) with `staleTime: 30_000`.
All hooks follow the pattern: fetch function → `useQuery` or `useMutation` + `invalidateQueries` on success.
Query keys: `['projects']`, `['projects', projectId]`, `['modules', projectId]`, `['modules', 'detail', moduleId]`, `['test-cases', filters]`, `['test-cases', testCaseId]`.

## Code Conventions

- **Language:** English only — variable names, function names, comments, error messages, git commits
- **Components:** PascalCase — `TestCaseForm.jsx`
- **Hooks / utilities:** camelCase — `useTestCases.js`, `api-response.js`
- **No default exports on API route handlers** — use named exports (`export async function GET`)
- **Always connect to DB before any Mongoose call** — `await connectDB()` from `lib/db.js`
- **No inline styles** — Tailwind classes only
- **shadcn/ui components** live in `src/components/ui/` — never modify them directly
- **React Query** handles all data fetching on the client — no `useEffect` + `fetch` patterns
- Path alias `@/` maps to `src/` (configured in `jsconfig.json`)

## Commands

Run from inside `testcase-manager/`:

```bash
# Development
npm run dev          # starts Next.js on localhost:3000 (via dns-fix.cjs wrapper)

# Testing
npm run test         # run Playwright e2e tests
npm run test:ui      # run Playwright with interactive UI

# Build
npm run build        # production build
npm run lint         # ESLint check
```

## CI/CD Flow

```
Push to any branch   → nothing happens
Open PR to main      → GitHub Actions runs: lint → build → playwright e2e
Merge PR to main     → GitHub Actions deploys to Vercel automatically
```

## Key Technical Decisions

- **No TypeScript** — plain JavaScript with JSDoc comments where needed for clarity
- **No separate Express server** — everything runs inside Next.js API Routes
- **No file uploads / attachments** — out of scope for this version
- **MongoDB Atlas M0 free tier** — single database, four collections, no GridFS
- **NextAuth v4 with JWT** — CredentialsProvider + bcryptjs; no MongoDB adapter, no email magic links
- **expectedResult / actualResult are per-step** — captured at the step level, not at the test case root
- **Roles per project** — a user can be editor in Project A and viewer in Project B
- **React Query over Zustand** — server state only, no complex client state needed for MVP
- **dns-fix.cjs** — custom Node DNS resolution fix required for local dev on this machine

## What Is Not Yet Implemented

- `/users` page (admin user management UI) — API routes exist, page not built
- Navbar component not wired into dashboard layout (file exists but unused)
- No toast notification system — errors surface via `confirm()` dialogs
- No pagination UI — API supports `page`/`limit` but UI does not
