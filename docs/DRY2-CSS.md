# DRY2.CSS Documentation

**Version:** 1.0.0
**A minimalist CSS framework for modern web applications**

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [CSS Variables Reference](#css-variables-reference)
4. [Utility Classes](#utility-classes)
5. [Component Classes](#component-classes)
6. [Theme System](#theme-system)
7. [Migration from Tailwind](#migration-from-tailwind)
8. [Examples](#examples)

---

## Introduction

DRY2.css (formerly Stem) is a minimalist CSS framework designed for building modern web applications with a focus on:

- **Customizable via CSS Variables**: All design tokens defined as CSS variables for easy theming
- **Mobile-First Responsive Design**: Base styles for mobile, scale up for larger screens
- **Semantic HTML First**: Semantic elements get automatic styling
- **Accessible by Default**: Proper ARIA support and keyboard navigation
- **No Build Step Required**: Just link the CSS file and start using it

### Philosophy

- All values defined as CSS variables for complete theme control
- Mobile-first responsive design (base styles for mobile, enhance for desktop)
- Semantic HTML over utility classes where possible
- Zero JavaScript dependencies (pure CSS)

---

## Getting Started

### Installation

#### 1. Direct Link (CDN - Coming Soon)

```html
<link rel="stylesheet" href="https://unpkg.com/dry2-css/dist/dry2.css">
```

#### 2. Local File

Download `dry2.css` and include it in your project:

```html
<link rel="stylesheet" href="path/to/dry2.css">
```

#### 3. NPM Package (Coming Soon)

```bash
npm install dry2-css
```

```javascript
import 'dry2-css/dist/dry2.css';
```

### Basic Usage

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My App with DRY2.css</title>
    <link rel="stylesheet" href="path/to/dry2.css">
</head>
<body>
    <div class="container">
        <h1 class="text-3xl font-bold">Welcome to DRY2.css</h1>
        <button class="btn btn-primary">Get Started</button>
    </div>
</body>
</html>
```

---

## CSS Variables Reference

All design tokens in DRY2.css are defined as CSS variables, allowing complete customization without modifying the framework.

### Breakpoints

```css
--stem-breakpoint-sm: 640;   /* 640px - Small devices (landscape phones) */
--stem-breakpoint-md: 768;   /* 768px - Medium devices (tablets) */
--stem-breakpoint-lg: 1024;  /* 1024px - Large devices (desktops) */
--stem-breakpoint-xl: 1280;  /* 1280px - Extra large devices */
```

**Usage in Media Queries:**
```css
@media (min-width: 768px) {
    /* Tablet and larger styles */
}
```

### Spacing Scale

```css
--stem-spacing-xs: 0.5rem;   /* 8px - Tight spacing */
--stem-spacing-sm: 0.75rem;  /* 12px - Compact spacing */
--stem-spacing-md: 1rem;     /* 16px - Default spacing */
--stem-spacing-lg: 1.5rem;   /* 24px - Comfortable spacing */
--stem-spacing-xl: 2rem;     /* 32px - Generous spacing */
```

**Usage:**
```css
.my-element {
    padding: var(--stem-spacing-md);
    margin-bottom: var(--stem-spacing-lg);
}
```

### Typography

#### Font Sizes

```css
--stem-font-size-xs: 0.75rem;    /* 12px - Fine print, captions */
--stem-font-size-sm: 0.875rem;   /* 14px - Small text, labels */
--stem-font-size-base: 1rem;     /* 16px - Body text (default) */
--stem-font-size-md: 1.125rem;   /* 18px - Emphasized body text */
--stem-font-size-lg: 1.25rem;    /* 20px - Small headings */
--stem-font-size-xl: 1.5rem;     /* 24px - Medium headings */
--stem-font-size-2xl: 2rem;      /* 32px - Large headings */
--stem-font-size-3xl: 2.5rem;    /* 40px - Hero headings */
```

#### Font Weights

```css
--stem-font-weight-normal: 400;    /* Regular text */
--stem-font-weight-medium: 500;    /* Slightly emphasized */
--stem-font-weight-semibold: 600;  /* Headings, important text */
--stem-font-weight-bold: 700;      /* Strong emphasis */
```

#### Line Heights

```css
--stem-line-height-tight: 1.25;    /* Headings, compact text */
--stem-line-height-normal: 1.5;    /* Body text (default) */
--stem-line-height-relaxed: 1.75;  /* Comfortable reading */
```

#### Font Families

```css
--stem-font-family-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...;
--stem-font-family-serif: Georgia, Cambria, "Times New Roman", ...;
--stem-font-family-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, ...;
```

### Colors

#### Primary Colors

```css
--stem-color-primary: #3b82f6;        /* Blue - primary brand color */
--stem-color-primary-light: #60a5fa;  /* Light blue - hover states */
--stem-color-primary-dark: #2563eb;   /* Dark blue - pressed states */
```

#### Semantic Colors

```css
/* Success (Green) */
--stem-color-success: #10b981;
--stem-color-success-light: #34d399;
--stem-color-success-dark: #059669;

/* Warning (Amber) */
--stem-color-warning: #f59e0b;
--stem-color-warning-light: #fbbf24;
--stem-color-warning-dark: #d97706;

/* Error (Red) */
--stem-color-error: #ef4444;
--stem-color-error-light: #f87171;
--stem-color-error-dark: #dc2626;
```

#### Text Colors

```css
--stem-color-text-base: #1f2937;      /* Dark gray - primary text */
--stem-color-text-muted: #6b7280;     /* Medium gray - secondary text */
--stem-color-text-inverted: #ffffff;  /* White - text on dark backgrounds */
```

#### Background Colors

```css
--stem-color-bg-surface: #ffffff;     /* White - page background */
--stem-color-bg-primary: #f9fafb;     /* Very light gray - card backgrounds */
--stem-color-bg-secondary: #f3f4f6;   /* Light gray - secondary surfaces */
```

#### Border Colors

```css
--stem-color-border-base: #d1d5db;    /* Medium gray - default borders */
--stem-color-border-light: #e5e7eb;   /* Light gray - subtle dividers */
--stem-color-border-dark: #9ca3af;    /* Dark gray - emphasized borders */
```

### Border Properties

```css
/* Border Widths */
--stem-border-width-1: 1px;   /* Default border */
--stem-border-width-2: 2px;   /* Medium border */
--stem-border-width-4: 4px;   /* Heavy border */

/* Border Radius */
--stem-border-radius-sm: 4px;      /* Small rounded corners */
--stem-border-radius-md: 8px;      /* Medium rounded corners */
--stem-border-radius-lg: 12px;     /* Large rounded corners */
--stem-border-radius-xl: 16px;     /* Extra large rounded corners */
--stem-border-radius-full: 9999px; /* Fully rounded (circles, pills) */
```

### Shadows

```css
--stem-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--stem-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--stem-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
--stem-shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.04);
```

### Transitions

```css
/* Durations */
--stem-transition-duration-fast: 150ms; /* Fast transitions */
--stem-transition-duration-base: 200ms; /* Default transition speed */
--stem-transition-duration-slow: 300ms; /* Slow transitions */

/* Easing Functions */
--stem-transition-ease: ease;
--stem-transition-ease-in: ease-in;
--stem-transition-ease-out: ease-out;
--stem-transition-ease-in-out: ease-in-out;
```

---

## Utility Classes

### Container

Centers content and provides responsive max-widths:

```html
<div class="container">
    <p>Centered, responsive content</p>
</div>
```

- Full-width on mobile with horizontal padding
- Responsive max-width at larger breakpoints
- Automatic centering on tablet and larger

### Flexbox

#### Core Flexbox

```html
<div class="flex">...</div>
<div class="flex flex-col">...</div>     <!-- Vertical layout -->
<div class="flex flex-wrap">...</div>    <!-- Wrapping items -->
```

#### Justify Content

```html
<div class="flex justify-start">...</div>
<div class="flex justify-center">...</div>
<div class="flex justify-end">...</div>
<div class="flex justify-between">...</div>
<div class="flex justify-around">...</div>
```

#### Align Items

```html
<div class="flex items-start">...</div>
<div class="flex items-center">...</div>
<div class="flex items-end">...</div>
<div class="flex items-stretch">...</div>
```

#### Gap

```html
<div class="flex gap">...</div>      <!-- 1rem / 16px -->
<div class="flex gap-sm">...</div>   <!-- 0.5rem / 8px -->
<div class="flex gap-lg">...</div>   <!-- 1.5rem / 24px -->
```

#### Responsive Flexbox

```html
<!-- Stack on mobile, row on tablet+ -->
<div class="flex flex-col md:flex-row">...</div>
```

### Grid System

#### Core Grid

```html
<div class="grid grid-cols-2">...</div>
<div class="grid grid-cols-3 gap">...</div>
<div class="grid grid-cols-4 gap-lg">...</div>
```

Available columns: `grid-cols-1`, `grid-cols-2`, `grid-cols-3`, `grid-cols-4`, `grid-cols-6`, `grid-cols-12`

#### Auto-Fit Grid

Automatically creates columns based on minimum width (no media queries needed):

```html
<div class="grid grid-auto-fit gap">
    <!-- Items automatically fit viewport -->
</div>
```

#### Column Span

```html
<div class="grid grid-cols-4">
    <div class="col-span-2">Takes 2 columns</div>
    <div>1 column</div>
    <div>1 column</div>
</div>
```

Available spans: `col-span-1`, `col-span-2`, `col-span-3`, `col-span-4`, `col-span-6`, `col-span-12`, `col-span-full`

#### Responsive Grid

```html
<!-- 1 col mobile, 2 cols tablet, 3 cols desktop -->
<div class="grid grid-cols-1 grid-cols-2-md grid-cols-3-lg">...</div>
```

### Display Utilities

```html
<div class="hidden">Hidden on all sizes</div>
<div class="block">Visible as block</div>
<div class="inline-block">Visible as inline-block</div>

<!-- Responsive Display -->
<div class="hidden md:block">Hidden on mobile, visible on tablet+</div>
<div class="block md:hidden">Visible on mobile, hidden on tablet+</div>
<nav class="hidden md:flex">Hidden on mobile, flex on tablet+</nav>
```

### Typography

#### Font Sizes

```html
<p class="text-xs">Extra small text (12px)</p>
<p class="text-sm">Small text (14px)</p>
<p class="text-base">Base text (16px)</p>
<p class="text-md">Medium text (18px)</p>
<p class="text-lg">Large text (20px)</p>
<p class="text-xl">Extra large text (24px)</p>
<p class="text-2xl">2X large text (32px)</p>
<p class="text-3xl">3X large text (40px)</p>
```

#### Font Weights

```html
<p class="font-normal">Normal weight (400)</p>
<p class="font-medium">Medium weight (500)</p>
<p class="font-semibold">Semibold weight (600)</p>
<p class="font-bold">Bold weight (700)</p>
```

#### Text Colors

```html
<p class="text-primary">Primary blue text</p>
<p class="text-muted">Muted gray text</p>
<p class="text-success">Success green text</p>
<p class="text-warning">Warning amber text</p>
<p class="text-error">Error red text</p>
<p class="text-inverted">White text (for dark backgrounds)</p>
```

### Background Colors

```html
<div class="bg-surface">White background</div>
<div class="bg-primary">Light gray background</div>
<div class="bg-secondary">Medium gray background</div>
<div class="bg-success">Green background</div>
<div class="bg-warning">Amber background</div>
<div class="bg-error">Red background</div>
```

### Borders

#### Border Widths

```html
<div class="border">1px border</div>
<div class="border-2">2px border</div>

<!-- Directional Borders -->
<div class="border-t">Top border only</div>
<div class="border-b">Bottom border only</div>
```

#### Border Radius

```html
<div class="rounded">Base rounded corners (8px)</div>
<div class="rounded-sm">Small rounded corners (4px)</div>
<div class="rounded-lg">Large rounded corners (12px)</div>
<div class="rounded-full">Fully rounded (pill shape/circle)</div>
```

### Shadows

```html
<div class="shadow-sm">Small shadow</div>
<div class="shadow">Base shadow</div>
<div class="shadow-lg">Large shadow</div>
<div class="shadow-xl">Extra large shadow</div>
```

### Spacing

#### Padding

```html
<!-- All Sides -->
<div class="p-xs">8px padding</div>
<div class="p-sm">12px padding</div>
<div class="p-md">16px padding</div>
<div class="p-lg">24px padding</div>
<div class="p-xl">32px padding</div>

<!-- Horizontal (X-axis) -->
<div class="px-md">16px left/right padding</div>

<!-- Vertical (Y-axis) -->
<div class="py-lg">24px top/bottom padding</div>
```

#### Margin

```html
<!-- All Sides -->
<div class="m-md">16px margin</div>

<!-- Horizontal (X-axis) -->
<div class="mx-lg">24px left/right margin</div>
<div class="mx-auto">Centered horizontally</div>

<!-- Vertical (Y-axis) -->
<div class="my-xl">32px top/bottom margin</div>

<!-- Individual Sides -->
<div class="mt-lg">24px top margin</div>
<div class="mb-md">16px bottom margin</div>
<div class="ml-sm">12px left margin</div>
<div class="mr-auto">Push to right edge</div>
```

---

## Component Classes

### Buttons

#### Basic Button

```html
<button class="btn">Default Button</button>
```

#### Size Variants

```html
<button class="btn btn-sm">Small Button</button>
<button class="btn">Default Button</button>
<button class="btn btn-lg">Large Button</button>
```

#### Style Variants

```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-success">Success</button>
<button class="btn btn-danger">Danger</button>
<button class="btn btn-outline">Outline</button>
<button class="btn btn-ghost">Ghost</button>
```

#### Button States

```html
<button class="btn btn-primary" disabled>Disabled</button>
```

#### Complete Example

```html
<button class="btn btn-primary btn-lg">
    Sign Up Now
</button>
```

### Cards

Basic container for grouping related content:

```html
<div class="card">
    <h3>Card Title</h3>
    <p>Card content goes here. Cards provide visual separation and hierarchy.</p>
    <button class="btn btn-primary">Action</button>
</div>
```

**Features:**
- `padding`: 1.5rem (24px)
- `background`: White with shadow
- `border-radius`: 12px
- `box-shadow`: Medium elevation

### Badges

Status indicators and labels:

```html
<!-- Default Badge -->
<span class="badge">Default</span>

<!-- Style Variants -->
<span class="badge badge-success">Active</span>
<span class="badge badge-warning">Pending</span>
<span class="badge badge-error">Failed</span>
<span class="badge badge-info">New</span>
```

**Use Cases:**
- Status indicators (Active, Pending, Failed)
- Notification counts
- Labels and tags
- Category markers

---

## Theme System

DRY2.css includes built-in dark mode support with two activation methods.

### Automatic Dark Mode

Respects user's system preference automatically:

```html
<!-- No code needed - works automatically when user has dark mode enabled in OS -->
```

### Manual Dark Mode

Add the `.dark` class to `<html>` or `<body>`:

```html
<html class="dark">
    <!-- Content automatically switches to dark theme -->
</html>
```

### Toggle Dark Mode with JavaScript

```javascript
// Toggle dark mode
document.documentElement.classList.toggle('dark');

// Enable dark mode
document.documentElement.classList.add('dark');

// Disable dark mode
document.documentElement.classList.remove('dark');

// Check if dark mode is active
const isDark = document.documentElement.classList.contains('dark');
```

### Customizing Theme Colors

Override CSS variables to match your brand:

```css
/* Light Mode Custom Colors */
:root {
    --stem-color-primary: #8b5cf6;         /* Purple instead of blue */
    --stem-color-primary-light: #a78bfa;
    --stem-color-primary-dark: #7c3aed;
}

/* Dark Mode Custom Colors */
.dark {
    --stem-color-primary: #a78bfa;         /* Lighter purple for dark mode */
    --stem-color-primary-light: #c4b5fd;
    --stem-color-primary-dark: #8b5cf6;
}
```

### Theme-Aware Components

All DRY2.css components automatically adapt to dark mode:

```html
<div class="card">
    <!-- Automatically uses dark colors in dark mode -->
    <h3>This card adapts to theme</h3>
    <button class="btn btn-primary">So does this button</button>
</div>
```

---

## Migration from Tailwind

DRY2.css provides many familiar utilities if you're migrating from Tailwind CSS.

### Equivalent Classes

| Tailwind | DRY2.css | Description |
|----------|----------|-------------|
| `container` | `container` | Centered container |
| `flex` | `flex` | Flexbox display |
| `flex-col` | `flex-col` | Flex direction column |
| `justify-center` | `justify-center` | Center on main axis |
| `items-center` | `items-center` | Center on cross axis |
| `gap-4` | `gap` | Gap between items |
| `hidden` | `hidden` | Hide element |
| `md:block` | `md:block` | Show on tablet+ |
| `grid` | `grid` | Grid display |
| `grid-cols-3` | `grid-cols-3` | 3 column grid |
| `text-sm` | `text-sm` | Small text |
| `font-bold` | `font-bold` | Bold weight |
| `text-blue-600` | `text-primary` | Primary color text |
| `bg-white` | `bg-surface` | White background |
| `rounded` | `rounded` | Rounded corners |
| `shadow` | `shadow` | Box shadow |
| `p-4` | `p-md` | Medium padding |
| `mx-auto` | `mx-auto` | Center horizontally |

### Key Differences

#### 1. Semantic Color Names

**Tailwind:**
```html
<p class="text-blue-600">Text</p>
<div class="bg-gray-100">Content</div>
```

**DRY2.css:**
```html
<p class="text-primary">Text</p>
<div class="bg-primary">Content</div>
```

#### 2. Named Spacing Scale

**Tailwind:**
```html
<div class="p-4 m-2">Content</div>
```

**DRY2.css:**
```html
<div class="p-md m-sm">Content</div>
```

Scale: `xs` (8px), `sm` (12px), `md` (16px), `lg` (24px), `xl` (32px)

#### 3. Responsive Breakpoint Syntax

Both use similar syntax:

```html
<!-- Same in both frameworks -->
<div class="hidden md:block">Content</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">...</div>
```

#### 4. Built-in Dark Mode

**Tailwind:**
```html
<div class="bg-white dark:bg-gray-900">Content</div>
```

**DRY2.css:**
```html
<!-- Automatic - no dark: prefix needed -->
<div class="bg-surface">Content</div>
```

### Migration Steps

1. **Replace color utilities** with semantic names:
   - `text-blue-600` → `text-primary`
   - `bg-gray-100` → `bg-primary`
   - `text-green-600` → `text-success`

2. **Update spacing** to named scale:
   - `p-4` → `p-md`
   - `m-2` → `m-sm`
   - `gap-4` → `gap`

3. **Remove dark: prefixes** - theme adapts automatically:
   - `dark:bg-gray-900` → use default classes

4. **Use component classes** where available:
   - Custom button styles → `btn btn-primary`
   - Custom card styles → `card`

5. **Keep responsive classes** - they work the same:
   - `md:flex`, `lg:grid-cols-3` work identically

### What's Not Included

DRY2.css focuses on essential utilities. Not included:

- Hover/focus state utilities (use `:hover` in CSS)
- Transform utilities (use CSS directly)
- Animation utilities (use CSS directly)
- Complex gradient utilities (use CSS variables)
- Arbitrary value syntax (use CSS directly)

For these use cases, write custom CSS with DRY2's CSS variables:

```css
.my-element {
    background: linear-gradient(
        to right,
        var(--stem-color-primary),
        var(--stem-color-primary-light)
    );
    transition: transform var(--stem-transition-duration-fast);
}

.my-element:hover {
    transform: scale(1.05);
}
```

---

## Examples

### Hero Section

```html
<section class="container py-xl">
    <div class="text-center">
        <h1 class="text-3xl font-bold mb-md">Welcome to Our App</h1>
        <p class="text-lg text-muted mb-lg">
            Build amazing things with DRY2.css
        </p>
        <div class="flex justify-center gap">
            <button class="btn btn-primary btn-lg">Get Started</button>
            <button class="btn btn-outline btn-lg">Learn More</button>
        </div>
    </div>
</section>
```

### Card Grid

```html
<div class="container">
    <div class="grid grid-cols-1 grid-cols-2-md grid-cols-3-lg gap-lg">
        <div class="card">
            <h3 class="font-semibold mb-sm">Feature 1</h3>
            <p class="text-muted">Description of feature one</p>
        </div>
        <div class="card">
            <h3 class="font-semibold mb-sm">Feature 2</h3>
            <p class="text-muted">Description of feature two</p>
        </div>
        <div class="card">
            <h3 class="font-semibold mb-sm">Feature 3</h3>
            <p class="text-muted">Description of feature three</p>
        </div>
    </div>
</div>
```

### Navigation Header

```html
<header class="container">
    <div class="flex justify-between items-center">
        <h1 class="text-xl font-bold">Brand</h1>
        <nav class="hidden md:flex gap">
            <a href="#" class="text-primary">Home</a>
            <a href="#" class="text-primary">About</a>
            <a href="#" class="text-primary">Contact</a>
        </nav>
        <button class="btn btn-primary">Sign In</button>
    </div>
</header>
```

### Status Dashboard

```html
<div class="card">
    <h3 class="font-semibold mb-md">System Status</h3>
    <div class="flex flex-col gap-sm">
        <div class="flex justify-between items-center">
            <span>API Server</span>
            <span class="badge badge-success">Online</span>
        </div>
        <div class="flex justify-between items-center">
            <span>Database</span>
            <span class="badge badge-success">Online</span>
        </div>
        <div class="flex justify-between items-center">
            <span>Cache Server</span>
            <span class="badge badge-warning">Degraded</span>
        </div>
    </div>
</div>
```

### Form Layout

```html
<div class="card">
    <h2 class="text-xl font-semibold mb-lg">Contact Us</h2>
    <form class="flex flex-col gap-md">
        <div>
            <label class="block text-sm font-medium mb-xs">Name</label>
            <input type="text" class="w-full p-sm border rounded">
        </div>
        <div>
            <label class="block text-sm font-medium mb-xs">Email</label>
            <input type="email" class="w-full p-sm border rounded">
        </div>
        <div>
            <label class="block text-sm font-medium mb-xs">Message</label>
            <textarea class="w-full p-sm border rounded" rows="4"></textarea>
        </div>
        <div class="flex gap">
            <button type="submit" class="btn btn-primary">Send Message</button>
            <button type="button" class="btn btn-ghost">Cancel</button>
        </div>
    </form>
</div>
```

---

## Browser Support

DRY2.css supports all modern browsers:

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

**Requirements:**
- CSS Custom Properties (CSS Variables)
- CSS Grid
- Flexbox
- Media Queries

---

## License

MIT License - Free to use in personal and commercial projects.

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Maintain mobile-first approach
2. Use CSS variables for all values
3. Follow existing naming conventions
4. Ensure accessibility
5. Test in multiple browsers

---

## Resources

- **GitHub Repository**: [github.com/yourusername/dry2](https://github.com/yourusername/dry2)
- **Examples**: See `/examples` directory
- **Component Showcases**: Individual demo pages for each component

---

**Questions or Issues?**
Open an issue on GitHub or contribute to the documentation!
