# dry2.css Migration Reference Guide

This document maps **Tailwind CSS** utility classes to **dry2.css** equivalents (CSS variables and semantic classes). Use it as the single source of truth when converting example HTML files from Tailwind CDN to dry2.css.

---

## 1. Setup: Replace Tailwind with dry2.css

**Before (Tailwind CDN):**
```html
<script src="https://cdn.tailwindcss.com"></script>
```

**After (dry2.css):**
```html
<link rel="stylesheet" href="../src/dry2/css/dry2.css">
```
Or from dist:
```html
<link rel="stylesheet" href="../dist/dry2.css">
```

- Remove the Tailwind `<script>` tag.
- Add a `<link>` to `dry2.css` in `<head>`.
- Keep other assets (e.g. Font Awesome, htmx, component scripts) unchanged.

---

## 2. Breakpoints

dry2.css uses the same pixel breakpoints as Tailwind. Responsive utilities use either **Tailwind-style prefix** (`md:`, `lg:`, `xl:`) for display/flex or **suffix** for grid.

| Breakpoint | Min width | Tailwind | dry2.css (display/flex) | dry2.css (grid) |
|------------|-----------|----------|--------------------------|------------------|
| sm         | 640px     | sm:      | —                         | —                |
| md         | 768px     | md:      | .md\:flex, .md\:hidden   | .grid-cols-*-md  |
| lg         | 1024px    | lg:      | .lg\:flex, .lg\:block     | .grid-cols-*-lg  |
| xl         | 1280px    | xl:      | .xl\:flex, .xl\:block     | .grid-cols-*-xl  |

CSS variables (for custom media queries): `--stem-breakpoint-sm`, `--stem-breakpoint-md`, `--stem-breakpoint-lg`, `--stem-breakpoint-xl` (numeric, no unit).

---

## 3. Layout

### Container / max-width

| Tailwind              | dry2.css                          |
|-----------------------|------------------------------------|
| max-w-6xl mx-auto px-4 | .container                         |
| max-w-4xl mx-auto      | .container (uses --stem-container-max-width-*) |
| max-w-7xl              | Use .container; max-widths are md/lg/xl in dry2 |

Use a single `.container` class for centered, responsive max-width and horizontal padding. Nested `.container` has no extra padding.

### Flexbox

| Tailwind                    | dry2.css                    |
|-----------------------------|-----------------------------|
| flex                        | .flex                       |
| flex-col                    | .flex-col                   |
| flex-row                    | .flex-row                   |
| flex-wrap                   | .flex-wrap                  |
| justify-start/center/end    | .justify-start, .justify-center, .justify-end |
| justify-between             | .justify-between            |
| justify-around              | .justify-around             |
| items-start/center/end      | .items-start, .items-center, .items-end |
| items-stretch               | .items-stretch              |
| gap-2 / gap-4 / gap-6       | .gap-sm / .gap / .gap-lg    |
| hidden md:flex              | .hidden .md:flex (same)      |
| flex-col md:flex-row        | .flex-col .md:flex-row       |

### Grid

| Tailwind                          | dry2.css                                      |
|-----------------------------------|-----------------------------------------------|
| grid                              | .grid                                         |
| grid-cols-1                        | .grid-cols-1                                  |
| grid-cols-2                        | .grid-cols-2                                  |
| grid-cols-3                        | .grid-cols-3                                  |
| grid-cols-4                        | .grid-cols-4                                  |
| grid-cols-1 md:grid-cols-2        | .grid-cols-1 .grid-cols-2-md                  |
| grid-cols-1 md:grid-cols-2 lg:grid-cols-3 | .grid-cols-1 .grid-cols-2-md .grid-cols-3-lg |
| gap-4 / gap-6                     | .gap / .gap-lg                                |
| col-span-2 / col-span-full        | .col-span-2 / .col-span-full                  |

**Important:** For responsive grid, dry2 uses **suffix** (e.g. `grid-cols-2-md`, `grid-cols-3-lg`), not prefix like Tailwind’s `md:grid-cols-2`.

### Display

| Tailwind   | dry2.css   |
|------------|------------|
| hidden     | .hidden    |
| block      | .block     |
| inline     | .inline    |
| inline-block | .inline-block |
| md:block   | .md:block  |
| md:flex    | .md:flex   |
| md:hidden  | .md:hidden |

### Centering / margin

| Tailwind | dry2.css |
|----------|----------|
| mx-auto  | .mx-auto |
| ml-auto  | .ml-auto |
| mr-auto  | .mr-auto |

---

## 4. Spacing (padding and margin)

dry2.css uses a **semantic scale** (xs, sm, md, lg, xl) instead of Tailwind’s numeric scale.

| Tailwind (approx) | dry2.css | Variable / notes        |
|-------------------|----------|--------------------------|
| p-1 (4px)         | .p-xs    | --stem-spacing-xs        |
| p-2 (8px)         | .p-xs    | —                        |
| p-3 (12px)        | .p-sm    | --stem-spacing-sm        |
| p-4 (16px)        | .p-md    | --stem-spacing-md        |
| p-6 (24px)        | .p-lg    | --stem-spacing-lg        |
| p-8 (32px)        | .p-xl    | --stem-spacing-xl        |
| px-4              | .px-md   |                          |
| py-4              | .py-md   |                          |
| pt-2, pb-4        | .pt-sm, .pb-md | .pt-xs, .pt-sm, .pt-md, .pt-lg, .pt-xl (same for pb, pl, pr, mt, mb, ml, mr) |
| m-4               | .m-md    |                          |
| mb-2 / mb-4 / mb-8| .mb-sm / .mb-md / .mb-xl |        |
| mt-4               | .mt-md   |                          |

Directional utilities follow the same scale: `*-xs`, `*-sm`, `*-md`, `*-lg`, `*-xl` for padding and margin (e.g. `px-md`, `py-lg`, `mt-md`, `mb-xl`).

---

## 5. Typography

### Font size

| Tailwind  | dry2.css  | Variable / notes        |
|-----------|-----------|--------------------------|
| text-xs   | .text-xs  | 12px                     |
| text-sm   | .text-sm  | 14px                     |
| text-base | .text-base| 16px (default)           |
| text-lg   | .text-lg  | 20px                     |
| text-xl   | .text-xl  | 24px                     |
| text-2xl  | .text-2xl | 32px                     |
| text-3xl  | .text-3xl | 40px                     |
| text-md   | .text-md  | 18px (dry2 only)         |

### Font weight

| Tailwind   | dry2.css    |
|------------|-------------|
| font-normal  | .font-normal  |
| font-medium  | .font-medium  |
| font-semibold | .font-semibold |
| font-bold    | .font-bold    |

### Text color (semantic)

dry2.css favors **semantic** text colors over gray numbers.

| Tailwind (typical use) | dry2.css     | Use case              |
|------------------------|--------------|------------------------|
| text-gray-900          | (default) or body color | Primary text; ensure body uses --stem-color-text-base |
| text-gray-600 / text-gray-500 | .text-muted   | Secondary text, captions |
| text-blue-600 / primary | .text-primary | Links, primary emphasis |
| text-green-600          | .text-success | Success text           |
| text-amber-600          | .text-warning | Warning text           |
| text-red-600            | .text-error   | Error text             |
| text-white              | .text-inverted| Text on dark backgrounds |
| text-gray-800 (badges etc.) | .text-primary (or keep default) | Depends on context |

There are no `text-gray-*` utilities; use default (body) or .text-muted, .text-primary, .text-success, .text-warning, .text-error, .text-inverted.

---

## 6. Background colors

| Tailwind (typical) | dry2.css     | Use case                |
|--------------------|--------------|--------------------------|
| bg-white           | .bg-surface  | Page/card surface       |
| bg-gray-50 / bg-gray-100 | .bg-primary   | Light gray background   |
| bg-gray-200        | .bg-secondary| Slightly darker gray    |
| bg-blue-100 text-blue-800 | .badge (or .bg-primary + .text-primary for tags) | Badge/tag chips |
| bg-green-100       | .bg-success  | Success background       |
| bg-amber-100       | .bg-warning  | Warning background       |
| bg-red-100         | .bg-error    | Error background         |

For badge-style chips (e.g. “collapsible”, “sections”), prefer dry2’s `.badge`, `.badge-success`, `.badge-warning`, `.badge-error`, `.badge-info` where applicable.

---

## 7. Borders

| Tailwind   | dry2.css   |
|------------|------------|
| border     | .border    |
| border-2   | .border-2  |
| border-t   | .border-t  |
| border-b   | .border-b  |

Border color is not separate utilities; borders use theme border colors. For “border only” (e.g. bottom divider), use .border-b.

---

## 8. Border radius

| Tailwind  | dry2.css   |
|-----------|------------|
| rounded   | .rounded   |
| rounded-sm| .rounded-sm|
| rounded-lg| .rounded-lg|
| rounded-full | .rounded-full |

Variables: `--stem-border-radius-sm`, `--stem-border-radius`, `--stem-border-radius-lg`, `--stem-border-radius-full`.

---

## 9. Shadows

| Tailwind  | dry2.css   |
|-----------|------------|
| shadow-sm | .shadow-sm |
| shadow    | .shadow    |
| shadow-lg | .shadow-lg |
| shadow-xl | .shadow-xl |

---

## 10. Components (semantic classes)

Use these when migrating component-like patterns:

| Tailwind pattern (example)              | dry2.css pattern                    |
|----------------------------------------|-------------------------------------|
| px-4 py-2 rounded font-medium ...     | .btn                                |
| Primary button                         | .btn .btn-primary                   |
| Secondary / outline / danger            | .btn .btn-outline, .btn .btn-danger |
| Small/large button                     | .btn-sm, .btn-lg                    |
| Card: white bg, rounded, shadow         | .card                               |
| Badge / tag chips                      | .badge, .badge-success, .badge-warning, .badge-error, .badge-info |

---

## 11. Common migration patterns

### Page shell (e.g. examples index)

- **Tailwind:** `class="bg-gray-100"` on body → **dry2:** `class="bg-primary"` or leave default if body is styled in base.css.
- **Tailwind:** `max-w-6xl mx-auto px-4 xl:px-0 py-4` → **dry2:** `container` + `p-md` (or `py-md`) as needed.
- **Tailwind:** `flex items-center justify-between mb-8` → **dry2:** `flex items-center justify-between mb-xl`.
- **Tailwind:** `text-3xl font-bold text-gray-900 mb-2` → **dry2:** `text-3xl font-bold mb-sm` (primary text from body or leave default).
- **Tailwind:** `text-lg text-gray-600` → **dry2:** `text-lg text-muted`.
- **Tailwind:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` → **dry2:** `grid grid-cols-1 grid-cols-2-md grid-cols-3-lg gap-lg`.
- **Tailwind:** Card link: `bg-white rounded-lg shadow overflow-hidden hover:shadow-lg` → **dry2:** `card` (or `bg-surface rounded-lg shadow`) and keep overflow/hover in custom CSS if needed.
- **Tailwind:** Small tags `px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded` → **dry2:** `badge` or `badge-info` (and .text-primary if needed), or `p-xs px-sm text-xs rounded` with semantic colors.

### Responsive nav

- **Tailwind:** `hidden md:flex` for desktop nav → **dry2:** `hidden md:flex` (unchanged).
- **Tailwind:** `md:hidden` for mobile menu button → **dry2:** `md:hidden` (unchanged).

### Custom styles (e.g. gradient text, hover)

- Keep in `<style>` or in `examples/static/css/base.css`.
- Prefer dry2 variables where possible: e.g. `var(--stem-color-primary)`, `var(--stem-shadow-lg)`, `var(--stem-transition-duration-base)`.

---

## 12. CSS variables quick reference

Use these in custom CSS or when a utility does not exist:

- **Spacing:** `--stem-spacing-xs` through `--stem-spacing-xl`
- **Gap:** `--stem-gap`, `--stem-gap-sm`, `--stem-gap-lg`
- **Colors:** `--stem-color-primary`, `--stem-color-text-base`, `--stem-color-text-muted`, `--stem-color-bg-surface`, `--stem-color-bg-primary`, `--stem-color-border-base`
- **Typography:** `--stem-font-size-*`, `--stem-font-weight-*`, `--stem-line-height-*`, `--stem-font-family-sans`
- **Borders:** `--stem-border-width-1`, `--stem-border-radius`, `--stem-border-radius-lg`
- **Shadows:** `--stem-shadow-sm`, `--stem-shadow`, `--stem-shadow-lg`, `--stem-shadow-xl`
- **Transitions:** `--stem-transition-duration-fast`, `--stem-transition-duration-base`, `--stem-transition-ease-out`

---

## 13. What to remove or avoid

- Remove Tailwind CDN script.
- Do not use Tailwind-only classes (e.g. arbitrary values like `p-[13px]`, or Tailwind-specific grays like `text-gray-700`) unless you add custom CSS that uses dry2 variables.
- Prefer semantic utilities (e.g. .text-muted, .bg-primary) over recreating gray scales with custom classes.

This guide should be updated when dry2.css adds new utilities or variables so all HTML migrations stay consistent.
