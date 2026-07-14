# Design System & UI Guidelines: TestFlow

## 1. Core Philosophy
The UI must emulate the clean, professional, and highly readable interface of Atlassian Jira and Zephyr. The design should be minimalist, utilizing a lot of white space, strict alignment, and clear visual hierarchies. 

## 2. Color Palette
- **Brand Primary:** `#0C66E4` (Use for primary buttons, active states, checkboxes, and focused inputs).
- **Brand Hover:** `#0052CC` (For primary button hover states).
- **Background (Main App):** `#FFFFFF` (Pure white for the main content area to ensure crisp text readability).
- **Sidebar & App Background:** `#F4F5F7` (Classic Jira light gray for the left navigation menu and page wrappers).
- **Text Primary:** `#172B4D` (Dark navy/slate for all standard text and headings. NEVER use pure black `#000000`).
- **Text Secondary/Muted:** `#6B778C` (For descriptions, breadcrumbs, and table headers).
- **Borders & Dividers:** `#DFE1E6` (Use for table borders, input borders, and section dividers).

## 3. Status Badges & Colors
Test Case execution statuses must use these specific pill-shaped badges:
- **PASSED:** Background `#E3FCEF`, Text `#006644`
- **FAILED:** Background `#FFEBE6`, Text `#BF2600`
- **SKIPPED:** Background `#FFFAE6`, Text `#FF8B00`
- **DRAFT:** Background `#DFE1E6`, Text `#42526E`

## 4. Priority Badges & Colors
Test Case priorities use pill-shaped badges with these color mappings:
- **Low:** Background `#DFE1E6`, Text `#42526E` (neutral gray — low urgency)
- **Medium:** Background `#E9F2FF`, Text `#0C66E4` (brand blue — normal)
- **High:** Background `#FFFAE6`, Text `#FF8B00` (amber — elevated)
- **Critical:** Background `#FFEBE6`, Text `#BF2600` (red — urgent, same family as FAILED)

## 5. Layout Structure
- **Left Sidebar (Fixed):** 260px width, `#F4F5F7` background. Contains the User Profile, Dashboard link, and a collapsible list of "Elements" (Modules). It must remain visible at all times.
- **Top Navigation Bar:** Height 64px, pure white background, bottom border `#DFE1E6`. Contains breadcrumbs (e.g., `Project / Elements / Header Nav`), global search, and the User Avatar.
- **Main Content Area:** Takes up `calc(100vw - 260px)`. Padded with at least `32px` on all sides.

## 6. UI Components
- **Buttons:** 
  - *Primary:* Solid blue `#0C66E4` background, white text, slightly rounded corners (`rounded-md`), no heavy shadows.
  - *Secondary:* Transparent background, `#091E420F` border, `#42526E` text.
- **Tables:** Must have a flat design. Header row with uppercase, muted text. Hover effects on rows (`hover:bg-gray-50`). Actions (Edit/Delete) should appear on the far right of the row.
- **Modals/Drawers:** Use a slide-over panel from the right side for creating/editing Test Cases to maintain context of the underlying table, or a centered modal with a semi-transparent dark backdrop.
- **Icons:** Use `lucide-react` for all iconography. Keep icon stroke width to `1.5` or `2`.

## 7. Feedback & States
- **Loading:** Centered `Loader2` spinner (lucide, `animate-spin`, muted `#6B778C`) for data fetches; an inline spinner inside buttons while a mutation is pending.
- **Empty states:** Centered, muted message inside a dashed `#DFE1E6` border card; offer a primary action when relevant (e.g. "Create the first one"). Use a similar card for "no search results".
- **Errors:** Inline banner with `#FFEBE6` background and `#BF2600` text above the affected content — never a blocking browser alert.
- **Destructive actions:** Always confirm via a centered modal with a semi-transparent dark backdrop before deleting; the confirm button uses the FAILED red `#BF2600`.
- **AI generation:** "Generate with AI" is a secondary button (Sparkles icon in brand blue) that opens a right slide-over with a two-step flow — input → review (edit / uncheck proposed cases) → save — keeping the underlying table in context.
