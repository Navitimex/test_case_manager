# TestCase Manager — Design System

> Single source of truth for all UI decisions.
> Every component Claude generates must follow these exact classes and patterns.
> Derived from the implemented codebase — reflects what is actually built, not just the prototype.

---

## Typography

- **Font family:** Inter (Google Fonts) — intended but root layout currently uses Geist (Next.js default). Use Inter when adding new pages/layouts.
- **Import:** `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap`
- **Icon library:** Lucide Icons (`lucide-react`)

| Role | Classes |
|---|---|
| Page title (PageHeader) | `text-3xl font-bold text-slate-900` |
| Section heading | `text-2xl font-bold text-slate-900` |
| Card title | `text-lg font-bold` |
| Subsection label | `text-sm uppercase text-slate-400 tracking-wider font-bold` |
| Body text | `text-sm text-slate-600` |
| Muted / secondary | `text-slate-500` |
| Micro label | `text-xs text-slate-400` |
| Tiny uppercase tag | `text-[10px] font-bold uppercase tracking-widest` |

---

## Color Palette

### Base colors
| Token | Tailwind class | Usage |
|---|---|---|
| Page background | `bg-slate-50` | App background, content area |
| Surface / card | `bg-white` | Cards, sidebar, modals |
| Border default | `border-slate-200` | All card and panel borders |
| Border subtle | `border-slate-100` | Table row dividers, inner borders |
| Text primary | `text-slate-900` | Headings, important values |
| Text secondary | `text-slate-600` | Body text, descriptions |
| Text muted | `text-slate-500` | Placeholders, helper text |
| Text disabled | `text-slate-400` | Icons, labels, timestamps |

### Brand / accent
| Token | Tailwind class | Usage |
|---|---|---|
| Primary | `bg-blue-600` | Primary buttons, active sidebar border, logo bg, step numbers |
| Primary hover | `hover:bg-blue-700` | Button hover state |
| Primary light bg | `bg-blue-50` | Icon backgrounds, info boxes |
| Primary text | `text-blue-600` | Links, icon color on light bg |
| Primary text dark | `text-blue-700` | Text on blue-50 backgrounds |
| Focus ring | `focus:ring-2 focus:ring-blue-500 outline-none` | All form inputs |

---

## Status & Priority Badges

### Status badges — `rounded-full` pill shape
```jsx
// pending
<span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
  pending
</span>

// pass
<span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
  pass
</span>

// fail
<span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-700">
  fail
</span>

// skipped
<span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-500">
  skipped
</span>
```

Implemented as a lookup map:
```js
const STATUS_CLASSES = {
  pending: 'bg-slate-100 text-slate-700',
  pass:    'bg-emerald-100 text-emerald-700',
  fail:    'bg-rose-100 text-rose-700',
  skipped: 'bg-slate-100 text-slate-500',
}
// usage:
<span className={cn('px-2 py-1 rounded-full text-[10px] font-bold uppercase', STATUS_CLASSES[tc.status])}>
  {tc.status}
</span>
```

### Priority — inline text color (table), no background
```js
const PRIORITY_CLASSES = {
  critical: 'text-red-600',
  high:     'text-orange-600',
  medium:   'text-slate-600',
  low:      'text-slate-400',
}
// usage:
<span className={cn('text-sm font-semibold', PRIORITY_CLASSES[tc.priority])}>
  {tc.priority}
</span>
```

### Priority badge — with background (metadata panel)
```js
const PRIORITY_BADGE = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-slate-100 text-slate-700',
  low:      'bg-slate-100 text-slate-400',
}
// usage:
<span className={cn('text-sm font-medium px-2 py-1 rounded', PRIORITY_BADGE[tc.priority])}>
  {tc.priority}
</span>
```

### Test case ID tag
```jsx
<span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-blue-100 text-blue-700 rounded inline-block">
  TC-001
</span>
```
Note: IDs are display-only (position index) — there is no persistent numeric ID in the DB.

### Tag chip (metadata panel)
```jsx
<span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
  {tag}
</span>
```

---

## Layout Structure

### App shell
```
h-screen flex overflow-hidden
├── Sidebar (w-64, shrink-0)
└── main (flex-1, flex flex-col, overflow-hidden)
    └── div (flex-1, overflow-y-auto, p-8, bg-slate-50)
        └── {children}
```

No top Navbar is rendered in the current layout. `Navbar.jsx` exists but is not yet wired in.

### Sidebar
```jsx
<aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
  {/* Logo */}
  <div className="p-6 flex items-center gap-3">
    <div className="bg-blue-600 p-1.5 rounded-md text-white">
      <Box className="w-5 h-5" />
    </div>
    <span className="font-bold text-lg tracking-tight">TC Manager</span>
  </div>

  {/* Nav */}
  <nav className="flex-1 p-4 space-y-1">
    {/* nav items */}
  </nav>

  {/* User footer */}
  <div className="p-4 border-t border-slate-100">
    {/* user info */}
  </div>
</aside>
```

### Sidebar nav item
```jsx
// default
<Link className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition text-sm font-medium">
  <Icon className="w-4 h-4" />
  Label
</Link>

// active (detected via usePathname().startsWith(href))
<Link className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 text-slate-900 border-r-4 border-blue-600 transition text-sm font-medium">
```

The "Users" nav item is only rendered when `user?.role === 'admin'`.

### Sidebar user footer
```jsx
<div className="flex items-center gap-3 p-2">
  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
    {initials}  {/* first letter of each word in user.name, max 2 chars */}
  </div>
  <div className="flex-1 overflow-hidden">
    <p className="text-sm font-semibold truncate">{user?.name}</p>
    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{user?.role}</p>
  </div>
  <button
    onClick={() => signOut({ callbackUrl: '/login' })}
    className="text-slate-400 hover:text-red-500 transition"
  >
    <LogOut className="w-4 h-4" />
  </button>
</div>
```

### Navbar component (not in layout yet)
```jsx
<header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
  {/* Breadcrumb left */}
  <div className="flex items-center text-sm text-slate-500 gap-2">
    {breadcrumb ?? <span className="font-medium text-slate-900">{title}</span>}
  </div>
  {/* Actions right */}
  <div className="flex items-center gap-4">
    <button className="relative p-2 text-slate-400 hover:text-slate-600 transition">
      <Bell className="w-5 h-5" />
    </button>
    {action && action}
  </div>
</header>
```

### PageHeader component (used on every page)
```jsx
<div className="flex items-start justify-between mb-6">
  <div>
    <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
    {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
  </div>
  {action && <div>{action}</div>}
</div>
```
Props: `title` (string), `description` (string, optional), `action` (ReactNode, optional).

---

## Components

### Card (Project card)
```jsx
<div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition cursor-pointer group relative">
  <div className="flex justify-between items-start mb-4">
    <div className="bg-blue-50 text-blue-600 p-3 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
      <Folder className="w-6 h-6" />
    </div>
    {/* admin-only MoreVertical dropdown */}
  </div>
  <Link href={`/projects/${project._id}`} className="block">
    <h3 className="text-lg font-bold mb-1">{project.name}</h3>
    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{project.description}</p>
    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
      <span className="text-xs font-medium text-slate-400">
        {project.members?.length ?? 0} member{project.members?.length !== 1 ? 's' : ''}
      </span>
    </div>
  </Link>
</div>
```

### Admin-only dropdown menu (inside ProjectCard)
```jsx
<div className="relative">
  <button
    onClick={(e) => { e.preventDefault(); setMenuOpen(!menuOpen) }}
    className="p-1 text-slate-400 hover:text-slate-600 rounded transition"
  >
    <MoreVertical className="w-4 h-4" />
  </button>
  {menuOpen && (
    <div className="absolute right-0 top-6 bg-white border border-slate-200 rounded-lg shadow-md z-10 py-1 min-w-[120px]">
      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
        <Pencil className="w-3 h-3" /> Edit
      </button>
      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
        <Trash2 className="w-3 h-3" /> Delete
      </button>
    </div>
  )}
</div>
```

### Project grid layout
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {projects?.map((p) => <ProjectCard key={p._id} project={p} ... />)}
</div>
```

### Module list item
```jsx
<div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition">
  <Link href={`/projects/${projectId}/modules/${mod._id}`} className="flex items-center gap-4 flex-1 min-w-0">
    <div className="bg-slate-100 p-2 rounded">
      <Package className="w-5 h-5 text-slate-500" />
    </div>
    <div className="min-w-0">
      <h4 className="font-semibold text-slate-800 truncate">{mod.name}</h4>
      {mod.description && <p className="text-xs text-slate-500 truncate">{mod.description}</p>}
    </div>
  </Link>
  <div className="flex items-center gap-2 ml-4 shrink-0">
    {canEdit && <button ...><Pencil className="w-3.5 h-3.5" /></button>}
    {canDelete && <button ...><Trash2 className="w-3.5 h-3.5" /></button>}
    <ChevronRight className="w-4 h-4 text-slate-300" />
  </div>
</div>
```

### Data table
```jsx
<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
  <table className="w-full text-left border-collapse">
    <thead>
      <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
        <th className="px-6 py-4">ID</th>
        <th className="px-6 py-4">Title</th>
        <th className="px-6 py-4">Priority</th>
        <th className="px-6 py-4">Severity</th>
        <th className="px-6 py-4">Status</th>
        {canEdit && <th className="px-6 py-4">Actions</th>}
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
        {/* cells */}
      </tr>
    </tbody>
  </table>
</div>
```
Empty state:
```jsx
<div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
  <p className="text-slate-500 text-sm">No test cases found.</p>
</div>
```

### Table row action buttons
```jsx
<div className="flex items-center gap-2">
  <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition">
    <Pencil className="w-3.5 h-3.5" />
  </button>
  <button className="p-1.5 text-slate-400 hover:text-red-500 rounded transition">
    <Trash2 className="w-3.5 h-3.5" />
  </button>
</div>
```

### Test case step (detail view)
```jsx
<div className="flex gap-4 p-3 rounded-lg border border-slate-100 bg-slate-50 items-center">
  <span className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full text-xs font-bold shrink-0">
    {step.order}
  </span>
  <p className="text-sm text-slate-700">{step.description}</p>
</div>
```

### Test case step (form — edit mode)
Each step has a numbered bubble, description input, and two sub-inputs for expectedResult / actualResult:
```jsx
<div className="border border-slate-200 rounded-lg p-3 space-y-2">
  <div className="flex items-center gap-2">
    <span className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full text-xs font-bold shrink-0">
      {step.order}
    </span>
    <input className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      placeholder={`Step ${step.order} description`} />
    <button className="p-1 text-slate-400 hover:text-red-500 transition shrink-0">
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  </div>
  <div className="grid grid-cols-2 gap-2 pl-8">
    <div>
      <label className="block text-xs text-slate-500 mb-1">Expected result</label>
      <input className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
    </div>
    <div>
      <label className="block text-xs text-slate-500 mb-1">Actual result</label>
      <input className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
    </div>
  </div>
</div>
```

### Metadata panel (test case detail)
```jsx
<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
  <h3 className="font-bold mb-4 text-sm uppercase text-slate-400 tracking-wider">
    Metadata
  </h3>
  <div className="space-y-4">
    <div>
      <p className="text-xs text-slate-400 mb-1">Status</p>
      <span className={cn('px-2 py-1 rounded-full text-[10px] font-bold uppercase', STATUS_CLASSES[tc.status])}>
        {tc.status}
      </span>
    </div>
    <div>
      <p className="text-xs text-slate-400 mb-1">Priority</p>
      <span className={cn('text-sm font-medium px-2 py-1 rounded', PRIORITY_BADGE[tc.priority])}>
        {tc.priority}
      </span>
    </div>
    <div>
      <p className="text-xs text-slate-400 mb-1">Severity</p>
      <p className="text-sm font-medium">{tc.severity}</p>
    </div>
    {tc.assignedTo && (
      <div>
        <p className="text-xs text-slate-400 mb-1">Assigned to</p>
        <p className="text-sm font-medium">{tc.assignedTo?.name ?? tc.assignedTo}</p>
      </div>
    )}
    {tc.tags?.length > 0 && (
      <div>
        <p className="text-xs text-slate-400 mb-1">Tags</p>
        <div className="flex flex-wrap gap-1">
          {tc.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{tag}</span>
          ))}
        </div>
      </div>
    )}
  </div>
</div>
```

### TestCaseFilters
```jsx
<div className="flex flex-wrap gap-3 mb-4">
  <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none">
    <option value="">All statuses</option>
    {/* pending / pass / fail / skipped */}
  </select>
  <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none">
    <option value="">All priorities</option>
    {/* critical / high / medium / low */}
  </select>
  <input
    type="text"
    placeholder="Tags (comma separated)"
    className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
  />
</div>
```

### User avatar
```jsx
// sidebar / small
<div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
  {initials}
</div>
```

---

## Buttons

```jsx
// Primary
<button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">
  <Plus className="w-4 h-4" /> New Project
</button>

// Primary full width (login)
<button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
  Sign In
</button>

// Success action (Mark Pass)
<button className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition">
  Mark Pass
</button>

// Danger action (Mark Fail)
<button className="px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition">
  Mark Fail
</button>

// Outlined / secondary (Edit in detail page)
<button className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
  Edit
</button>

// Ghost / icon button
<button className="p-2 hover:bg-slate-200 rounded-lg transition text-slate-400 hover:text-slate-600">
  <ArrowLeft className="w-5 h-5" />
</button>

// Cancel inside modal/form
<button className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">
  Cancel
</button>

// Back link button
<button className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition">
  <ArrowLeft className="w-4 h-4" /> Back
</button>
```

---

## Forms

### Login card
```jsx
<div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
  <div className="flex flex-col items-center mb-8">
    <div className="bg-blue-600 p-3 rounded-lg mb-4">
      <ShieldCheck className="text-white w-8 h-8" />
    </div>
    <h1 className="text-2xl font-bold">TestCase Manager</h1>
    <p className="text-slate-500 text-sm mt-1">Sign in to manage your tests</p>
  </div>
  {/* form fields */}
</div>
```

### Password field with show/hide toggle
```jsx
<div className="relative">
  <input
    type={showPassword ? 'text' : 'password'}
    className="w-full px-4 py-2 pr-10 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
    placeholder="••••••••"
  />
  <button
    type="button"
    onClick={() => setShowPassword((v) => !v)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
  >
    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
  </button>
</div>
```

### Form input (standard)
```jsx
<div>
  <label className="block text-sm font-medium mb-1">
    Label <span className="text-red-500">*</span>
  </label>
  <input
    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
    placeholder="..."
  />
</div>
```

### Form textarea
```jsx
<textarea
  rows={3}
  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
/>
```

### Form select
```jsx
<select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
  <option>option</option>
</select>
```

### Demo credentials box (login page)
```jsx
<div className="mt-6 p-4 bg-blue-50 rounded-lg text-xs text-blue-700 space-y-1">
  <p className="font-semibold mb-2">Demo Access — password: <code>Demo1234!</code></p>
  <p><span className="font-medium">Admin:</span> admin@company.com</p>
  <p><span className="font-medium">Editor:</span> editor@company.com</p>
  <p><span className="font-medium">Viewer:</span> viewer@company.com</p>
</div>
```

### Inline error message (form)
```jsx
{error && <p className="text-sm text-red-600">{error}</p>}
```

### Modal overlay
```jsx
<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
  <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
    <h2 className="text-lg font-bold mb-4">Modal Title</h2>
    {/* form */}
  </div>
</div>

{/* For large forms (TestCaseForm): */}
<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
  <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl my-8">
```

---

## Detail Page Layout (Test Case)

```jsx
<div className="max-w-4xl mx-auto space-y-6">
  {/* header */}
  <div className="flex justify-between items-start">
    <div>
      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-blue-100 text-blue-700 rounded inline-block mb-2">
        TC
      </span>
      <h1 className="text-3xl font-bold text-slate-900">{testCase.title}</h1>
      {testCase.description && <p className="text-sm text-slate-500 mt-1">{testCase.description}</p>}
    </div>
    {canEdit && (
      <div className="flex items-center gap-2">
        {/* Mark Pass / Mark Fail / Edit buttons */}
      </div>
    )}
  </div>

  {/* 2/3 + 1/3 grid */}
  <div className="grid grid-cols-3 gap-6">
    <div className="col-span-2 space-y-6">
      {/* steps card */}
      {/* (no top-level expectedResult/actualResult card — those are per-step) */}
    </div>
    <div className="space-y-6">
      {/* metadata panel */}
    </div>
  </div>
</div>
```

---

## Spacing & Shape Tokens

| Token | Value |
|---|---|
| Card border radius | `rounded-xl` |
| Small element radius | `rounded-lg` |
| Micro element radius | `rounded` or `rounded-md` |
| Card shadow | `shadow-sm` |
| Card hover shadow | `hover:shadow-md` |
| Card padding | `p-6` |
| Page content padding | `p-8` (set on the scroll container in layout) |
| Table cell padding | `px-6 py-4` |
| Filter input padding | `px-3 py-1.5` |
| Stack spacing (cards) | `space-y-6` |
| Stack spacing (form fields) | `space-y-4` |
| Stack spacing (steps) | `space-y-2` or `space-y-3` |
| Gap between grid cards | `gap-6` |
| Modal padding | `p-6` |

---

## Icon Sizes

| Context | Size class |
|---|---|
| Sidebar nav icon | `w-4 h-4` |
| Navbar icon | `w-5 h-5` |
| Card feature icon | `w-6 h-6` |
| Login logo icon | `w-8 h-8` |
| Table action icon | `w-3.5 h-3.5` |
| Dropdown menu icon | `w-3 h-3` |
| Back/add inline icon | `w-4 h-4` |

---

## Role-based UI Rules

Enforced in every component that renders actions. Always check `session.user.role` — never hide elements only on the client without also protecting the API route.

```js
const role = session?.user?.role
const canEdit   = role === 'admin' || role === 'editor'
const canDelete = role === 'admin'
```

| Element | Admin | Editor | Viewer |
|---|---|---|---|
| "New Project" button (PageHeader) | visible | hidden | hidden |
| "More options" on project card | visible | hidden | hidden |
| Users nav item (sidebar) | visible | hidden | hidden |
| "New Module" button | visible | visible | hidden |
| "New Test Case" button | visible | visible | hidden |
| Edit button on module list | visible | visible | hidden |
| Delete button on module list | visible | hidden | hidden |
| Edit / Delete on test case table | visible | visible | hidden |
| "Mark Pass / Mark Fail" + Edit (detail page) | visible | visible | hidden |

---

## Breadcrumb Patterns

### Projects → Project detail
```jsx
<Link href="/projects" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition">
  <ArrowLeft className="w-4 h-4" /> Projects
</Link>
```

### Projects → Project → Module detail
```jsx
<div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
  <Link href="/projects" className="hover:text-slate-700 transition">Projects</Link>
  <span>/</span>
  <Link href={`/projects/${projectId}`} className="hover:text-slate-700 transition">Project</Link>
  <span>/</span>
  <span className="text-slate-900 font-medium">{mod?.name}</span>
</div>
```
