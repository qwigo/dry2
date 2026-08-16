# DRY2 Code Audit & Red/Green Fix Plan

Audit date: 2026-08-16. Scope: everything under `src/`, `scripts/`, `tests/`, plus repo hygiene.
Part 1 lists every bug and code-quality problem found, grouped by severity. Part 2 is an ordered
red/green (failing-test-first) commit plan for fixing them.

**Status (2026-08-16):** Phase 0 is complete — A1–A4 below are fixed, plus two related problems
found while doing that work (A5, A6). See the commit log on this branch for the red/green pairs.
Phases 1–4 are still open.

---

## Part 1 — Findings

### A. Blocking: the project's own tooling is broken

| # | File | Problem | Status |
|---|------|---------|--------|
| A1 | `tests/unit/setup.js:14` | `global.navigator = dom.window.navigator` throws `TypeError: Cannot set property navigator ... which has only a getter` on Node ≥ 21 (repo engine allows `>=16`, CI/dev machines run 22). **The entire unit test suite fails to boot**, so `npm test` and `prepublishOnly` fail. | ✅ Fixed |
| A2 | *(missing file)* | There is **no ESLint config** (`.eslintrc*` / `eslint.config.js`), so `npm run lint` errors immediately ("Oops! Something went wrong"). `prepublishOnly` runs lint, so publishing is impossible. | ✅ Fixed |
| A3 | `index.html:13` | Loads `<script src="src/dry2/dry2.js">` — **that file does not exist**. The bundle only exists as `dist/dry2.js` after a build, and `dist/` is gitignored. The main demo page loads zero components. `examples/index.html` has the same problem pointing at `../dist/dry2.js`. `index.html` additionally used four wrong tag names (`avatar-component`/`badge-component`/`stat-component`/`toast-component` instead of `dry-avatar`/`dry-badge`/`dry-stat`/`dry-toast`). | ✅ Fixed (script includes + tag names). Marketing copy on `index.html` still claims "21 production-ready components" and lists a carousel, date picker, super select, speed dial and WYSIWYG editor that don't exist under `src/` — left alone as a product decision, not a mechanical fix. |
| A4 | `src/base.js` vs `src/dry2/base.js` | Two divergent copies of `BaseElement`, both assigning `window.BaseElement`. `src/base.js` is a stale subset (missing `_getNumericAttribute`, `_waitForChildrenAndInitialize`, `_extractSlotContent`, `attributeChangedCallback` wiring). Any page loading the wrong one gets runtime errors (e.g. countdown/toast call `_getNumericAttribute`). | ✅ Fixed — `src/base.js` deleted. |
| A5 | `tests/unit/setup.js` (found while fixing A4) | A **third**, independent, hand-rolled copy of `BaseElement` lived here for component specs to extend, missing `_dispatchEvent`, `_ensureAlpineProcessing`, `_getNumericAttribute` and others. Once A1 no longer masked it, `npm run test:unit` crashed the whole Node process with an uncaught `TypeError` (`this._dispatchEvent is not a function`, thrown inside a `setTimeout` in `accordion.js`, outside mocha's own error handling). Two active (non-`.bak`) specs, `base.test.js` and `basic.test.js`'s "Core Infrastructure" block, also exclusively tested a `BaseWebComponent` class and `src/dry2/dry2.js` bundle removed by a prior refactor — they could never have passed. A third, `swap-working.test.js`, imported the same nonexistent bundle needlessly. | ✅ Fixed — `setup.js` now subclasses the real `src/dry2/base.js`; `base.test.js` rewritten to test the real class; the stale bundle imports removed. `npm run test:unit` went from crashing mid-run to a clean 262 passing / 23 failing — the 23 are real, pre-existing component bugs, tracked below (mostly section C). |
| A6 | `tests/integration/karma.conf.js` (found while fixing A2/A5) | Points at `../../src/dry2/drawer-components.js`, `web-components.js` and `avatar-component.js` — none of which exist (components now live at `drawer.js`/`avatar.js`; `web-components.js` and its `DatePicker` component appear to have been removed entirely, yet `web-components.test.js` still asserts `DatePicker` is a function). The whole Karma integration suite (`npm run test:integration`) cannot run at all today. | ⬜ Open — not fixed. Lint was made to pass by scoping `no-undef` off for the one file with the dead `DatePicker` references (see `.eslintrc.cjs`) rather than fixing the suite, since repairing/rewriting the integration suite is a larger, separate effort. |

### B. Security: HTML/JS injection (XSS) — systemic

The library builds HTML with template literals and interpolates **unescaped attribute values** into
`innerHTML`, including into single-quoted Alpine `x-data` expressions. Only `badge`, `toast`
(message), and `accordion` (partially) escape anything. Beyond XSS, a plain apostrophe (e.g.
`name="O'Brien"`) breaks the generated Alpine expression and kills the component.

| # | File | Vector |
|---|------|--------|
| B1 | `button.js:37-47` | `href`, `target`, `type` interpolated into attributes; `content`, `icon`, `variant`, `size` into the x-data string. `href="x" onmouseover=...` or an apostrophe in button text breaks/injects. |
| B2 | `avatar.js:31-38` | `src`, `name`, `initials`, `alt` into x-data single-quoted strings. `name="O'Brien"` breaks the component outright. |
| B3 | `tabs.js:72-101` | `tab.title`, `tab.badge`, `tab.icon`, `tab.id` interpolated raw into buttons/panels and into Alpine expressions. |
| B4 | `breadcrumbs.js:62,89,96` | `href` unescaped (allows `javascript:` URLs and attribute breakout), `icon` raw HTML, unknown `separator` value interpolated raw. |
| B5 | `countdown.js:126` | `expiry-text` inserted as raw HTML; unit labels raw. |
| B6 | `stat.js:192-229` | `label`, `trend-value`, `comparison`, `icon`, `class` all raw. |
| B7 | `toggle-switch.js:44-47` | `value` and `name` baked raw into the Alpine `toggle()` function body; the `active-bg`/`inactive-bg`/`switch-color` class attrs raw. |
| B8 | `timeline.js:172` | `icon` raw (date/title are escaped — inconsistent). |
| B9 | `drawer.js` / `dialog.js` | `url`, `trigger-content`, `header-content`, `*-class` attrs raw into HTML/`hx-get`. |
| B10 | `select.js:140,211,255-259` | `button-class`, `dropdown-class`, `max-height`, `name` raw into the template. |
| B11 | `chat-bubble.js:162,184` | Message content rendered with `x-html` — raw HTML by design but undocumented and unsanitized; dangerous for chat (user-generated) content. |
| B12 | `accordion.js:551-581` | Hand-rolled regex "sanitizer": misses unquoted event handlers (`onclick=alert(1)`), and `.replace(/data:/gi,'')` corrupts legitimate content (`data-id` attributes, prose containing "data:"). DOMPurify is already an optional dependency but is never used. |
| B13 | `src/dry2/base.js:166-184` | `_createAlpineDataString` escapes only `'` — backslashes and newlines still break out of the string context. |

### C. Functional bugs (component behavior is wrong)

| # | File | Bug |
|---|------|-----|
| C1 | `drawer.js:402` | `AjaxDrawer.contentId` returns a **new random ID on every call** when the attribute is absent. `render()` calls it twice (button `hx-target` and content div `id`), so they never match — AJAX content loads nowhere. The component is broken by default. |
| C2 | `card.js:295-308` | `_handleAttributeChange` calls `this._render()` with **no argument**; `_render(slots)` then reads `slots.header` → `TypeError` on every observed attribute change after init. |
| C3 | `toggle-switch.js:358-377` | Attribute changes re-render via `_render()` with no `originalContent` (slot content lost) and **destroy the hidden form input** (`_createHiddenInput` is never re-run) → form integration silently breaks after any attribute change. Also references `on-label`/`off-label`/`this.onLabel` which don't exist anywhere. |
| C4 | `avatar.js:285-307` | On attribute change it re-renders with `_extractSlotContent()`, which returns the **current rendered innerHTML** — the whole avatar is nested inside its own slot container, duplicating DOM on every change. The correct helpers (`_preserveSlotContent`/`_reRenderWithSlotContent`) exist but are never called. |
| C5 | `button.js:128-133` | `setText()` assigns `this.textContent = text`, which **wipes the entire rendered component DOM**. |
| C6 | `tabs.js:329-354` and `avatar/card/toggle-switch/badge` `_getAlpineData` | Public APIs read Alpine state via `element.__x.$data` — that is the **Alpine v2 API**. The declared peer dependency is Alpine ^3 (`_x_dataStack`), so `switchTab()`, `nextTab()`, `checked`, `setImage()` etc. silently do nothing. `src/dry2/base.js:_getAlpineData` handles v3 correctly, but components override it with the broken v2 version. |
| C7 | `tabs.js:389-405` | `_handleAttributeChange` calls `_initializeComponent()`, which immediately returns because `_hasBeenProcessed` is true → attribute changes (including `active-tab`) do nothing after first render. Also `_extractTabItems()` returns `[]` after render (children were replaced), so `nextTab()`/`previousTab()` are broken post-init. |
| C8 | `toast.js:220-226` | `_handleAttributeChange` does `this.hide(); setTimeout(() => this.show(), 100)` — but `hide()` only clears `_isVisible` after its 300 ms animation, so the `show()` at 100 ms early-returns. A visible toast whose attribute changes disappears and never comes back. |
| C9 | `toast.js:274-289` | `Toast._create()` appends a `dry-toast` element to `document.body` for every call and never removes it → unbounded DOM growth in long-lived pages. |
| C10 | `countdown.js:130-136` | The `[slot="expired"]` fallback can never work after the first render: `render()` replaces `innerHTML`, destroying the slot element it later queries for. |
| C11 | `accordion.js:140,355` | Titles are HTML-escaped in `_extractItemsSecurely`, then inserted with `textContent` → **double escaping**: a title `Q&A` displays as `Q&amp;A`. |
| C12 | `qr.js:72-110` | When QRious is missing (or throws), `innerHTML` is replaced, detaching the canvas; `this.canvas` still points at the detached node, so all later renders draw to a canvas that isn't in the DOM. |
| C13 | `code.js:334-347` | `showCopy`/`showHeader`: absence of the attribute means `true`, but the setters use `_setBooleanAttribute`, whose `false` branch *removes* the attribute → `el.showCopy = false` yields `showCopy === true`. The property can never be turned off programmatically. |
| C14 | `src/dry2/base.js:57-85` | `_waitForChildrenAndInitialize` race: the MutationObserver path and the 100 ms/500 ms fallback timers are not mutually exclusive → **double initialization**, the second pass capturing already-rendered HTML as `_originalContent`. (Tabs defends itself with `_hasBeenProcessed`; accordion and others don't.) |
| C15 | `src/dry2/base.js:35-43` | Alpine polling (`setTimeout(checkAlpine, 10)`) retries forever with no timeout if Alpine never loads — permanent 100 Hz polling per component on any page without Alpine. |
| C16 | `dialog.js:69-74` | A `htmx:afterRequest` listener on `document.body` per instance, never removed (no `disconnectedCallback`) — leaks and closes *this* dialog whenever *any* request returns the close header. Default `trigger-id`/`dialog-inner-id` (`trigger`, `dialog-inner`) collide when more than one dialog is on the page → HTMX targets the wrong dialog. |
| C17 | `breadcrumbs.js:131-154` | MutationObserver created in `setupEventListeners` is never disconnected (no `disconnectedCallback`) → leak; also re-created on every re-init. |
| C18 | `toggle-switch.js:138-142` | Form `reset` listener bound with `.bind(this)` and never removed; re-init adds duplicates. |
| C19 | `chat-bubble.js:239-301` | Every property setter calls both `_setAttribute` (→ `attributeChangedCallback` → re-render) *and* `_triggerUpdate()` (→ re-render) → double full re-render per assignment. |
| C20 | `swap.js:13-24,181-192` | `_initializeComponent` re-sets `_isInitialized` (already set in `connectedCallback`), and `active` set via property triggers render from the setter *and* from `attributeChangedCallback` → double render. |
| C21 | `timeline.js:8-9` | `this.className = this.getContainerClasses()` where `getContainerClasses()` includes the current `class` attribute — re-running duplicates the class list each time. |
| C22 | `select.js` | No `observedAttributes`/attribute reactivity at all (post-init `disabled` etc. changes are ignored); `focusedIndex` state exists but no arrow-key handlers were ever wired (dead half-feature); no cleanup on disconnect. |
| C23 | `badge.js:247-258` | `_cacheAlpineData` reads `__x` (Alpine v2) → cache is always `null` → every "optimized" attribute path falls back to full re-render; `setContent` falls back to `this.textContent = content`, wiping the rendered DOM before rebuilding. |

### D. Build/dev scripts

| # | File | Problem |
|---|------|---------|
| D1 | `scripts/build.js:96-98` | Declares a dependency on `'alpine-utils'` — no such file exists; the dependency graph silently no-ops. |
| D2 | `scripts/build.js:300-313` | Generated `dist/index.js` does `export { BaseElement } from './dry2.js'`, but `dry2.js` is a classic script with no exports → the published ESM entry (`"module"`) throws on import. |
| D3 | `scripts/build.js:415-493` | Generated TypeScript definitions describe an API that does not exist (`setState`, `renderSlot`, `emit`, `escapeHtml`, `$`, `$$` …) and `getComponentTagName` invents wrong tag names (`button-component` instead of `dry-button`). The typings actively mislead consumers. |
| D4 | `scripts/build.js:330-410` | `copyAssets` copies the root `package.json` into `dist/`, then `generatePackageInfo` overwrites it — redundant; also the bundle-count log is off by one (`components.length + 1`). |
| D5 | `scripts/dev-server.js:42` | Serves `/test` from a `test/` directory that doesn't exist (tests live in `tests/`). |

### E. Code quality / DRY violations / hygiene

| # | Where | Problem |
|---|-------|---------|
| E1 | `src/dry2/base.js:344-428` | `DRY2AlpineUtils` duplicates `_waitForAlpineAndInitialize` and `_ensureAlpineProcessing` verbatim from `BaseElement` in the same file — copy-paste in a library literally named "DRY". |
| E2 | `accordion.js:203-214` | The same JSDoc comment block is pasted **four times** in a row. |
| E3 | `accordion.js:255-301` | `_initializeAlpineData` and `_createDataStringFallback` are dead code (never called). Ditto `tabs.js` `_createTabButtonHTML`, `_createTabPanelHTML`, `_getTabClasses`; `code.js` unused `index` vars; `swap.js` `transition` getter feeding a class that's computed but ignored (`'fade'` default has no fade behavior). |
| E4 | `accordion.js` (state) | `AccordionState` duplicates open/close logic that the Alpine `x-data` string re-implements; after init the two stores drift — one more copy of the same logic in strings. |
| E5 | Every component | Class-string builders (`getButtonClasses`, `getBadgeClasses`, …) are re-implemented as strings inside `x-data` *and* as JS methods (badge has both `_getSizeClasses` and an inline copy) — massive duplication; a change must be made in 2–3 places. |
| E6 | `.gitignore` | **8,654 lines**, individually listing thousands of `node_modules` file paths instead of one `node_modules/` line. |
| E7 | repo root | Committed junk: `coverage/` HTML reports, `.idea/`, five `*.test.js.bak` files, debug pages (`test-fixed.html`, `test-select.html`, `test-accordion-fixed.html`, `test-accordion-icons-fix.html`, `test-swap-debug.html`), stray screenshots (`button-component-wrong.png`, `accordion-showcase-updated.png`, `chat-bubble-showcase-updated.png`). |
| E8 | `package.json` | Placeholder metadata (`author: "Your Name"`, `yourusername` repo URLs); `files` lists `docs/` and `CHANGELOG.md` which don't exist. |
| E9 | naming | Inconsistent element naming: `dry-*` for most, but `swap-component`, `timeline-component`, `toggle-switch`, `tab-item`, `breadcrumb-item`; `breadcrumbs` uses snake_case attribute `breadcrumb_class` while everything else is kebab-case. |
| E10 | `stat.js:213-238` | Broken indentation (whole tail of the file shifted by one space) — signals unreviewed generated code. |
| E11 | `component-builder-example.js` | Example/demo code shipped inside `src/` and bundled into the dist build. |
| E12 | `timeline.js:186-188` | `get title` shadows `HTMLElement.title` (native tooltip) — surprising API. |

---

## Part 2 — Red/Green Commit Plan

Convention: each numbered step is **two commits** — first a `test:` commit that adds failing tests
reproducing the defect (RED, CI expected to fail or the test marked as the new spec), then a
`fix:`/`refactor:` commit that makes them pass (GREEN). Steps are ordered so the harness works
before anything depends on it, security lands early, and refactors come last on top of a safety
net. Run `npm run test:unit` between every commit.

### Phase 0 — Make red/green possible (harness first) — ✅ Complete

**Step 0.1 — Fix the test harness (A1)** — ✅ done
- 🔴 `test: add harness smoke spec proving the suite can boot`
- 🟢 `fix(tests): stop assigning read-only navigator global in setup.js`
  (used `Object.defineProperty`; audited the other `global.*` assignments — only `navigator` lacked a setter on this Node version, `performance` etc. were already fine)

**Step 0.2 — Restore lint (A2)** — ✅ done
- 🔴 `test: add spec proving eslint has a usable configuration`
- 🟢 `fix(tooling): add ESLint configuration so npm run lint is runnable`
  (`.eslintrc.cjs`, `eslint:recommended` + overrides for `src/**` classic-script globals vs `tests/**` ESM/mocha globals vs `tests/integration/**` karma-chai/karma-sinon globals; remaining findings left as non-blocking warnings, see E3)

**Step 0.3 — Single source of truth for BaseElement (A4, A5)** — ✅ done
- 🔴 `test: pin BaseElement as the single source of truth`
  (rewrote the stale `base.test.js`, which tested a removed `BaseWebComponent`/`dry2.js` bundle, to test the real `src/dry2/base.js`; asserted `src/base.js` is gone and that `global.BaseElement` used by specs has the full method set)
- 🟢 `refactor: delete stale src/base.js; make BaseElement single-sourced`
  (`tests/unit/setup.js` now subclasses the real `BaseElement`, overriding only the two async Alpine/children-wait methods for synchronous test behavior, instead of hand-maintaining a third partial copy)
- 🟢 `fix(tests): remove references to the nonexistent dry2.js bundle`
  (follow-up: `basic.test.js` and `swap-working.test.js` also referenced the removed bundle/`BaseWebComponent`; no separate red commit needed since they were already red on a clean checkout)

**Step 0.4 — Demo pages load real files (A3)** — ✅ done
- 🔴 `test: link-check the flagship demo pages' script tags`
  (`tests/unit/demo-pages.test.js`; covers both `index.html` and `examples/index.html`, plus tag-name/registration matching)
- 🟢 `fix(examples): load individual component sources, not a nonexistent bundle`
  (both pages now load each `src/dry2/*.js` file directly, `base.js` first, matching the pattern already used by `examples/*-showcase.html`; fixed the four wrong tag names on `index.html`)

Net result of Phase 0: `npm run test:unit` went from crashing before a single spec ran (A1) to
crashing partway through (A5) to a clean, complete run — **262 passing / 23 failing**. `npm run
lint` went from erroring immediately to exiting 0. Both demo pages now render real, interactive
components on a fresh checkout with no build step. The 23 remaining test failures are real,
pre-existing component bugs (mostly section C below) and two orphaned Karma-related items (A6) —
not fixed in Phase 0.

### Phase 1 — Security (systemic XSS)

**Step 1.1 — Shared escaping utilities in BaseElement (B13, groundwork)**
- 🔴 `test: specs for _escapeHtml, _escapeAttr, _escapeJsString on BaseElement`
  (cases: `'`, `"`, `\`, newline, `<script>`, `O'Brien`)
- 🟢 `feat(base): add centralized _escapeHtml/_escapeAttr/_escapeJsString; harden _createAlpineDataString`
  (single implementation; delete the per-component private copies in badge/toast/timeline/toggle-switch/code as they migrate in later steps)

**Step 1.2 — Button (B1, also fixes apostrophe breakage)**
- 🔴 `test(button): content with apostrophes/HTML renders inert; href/target/type are attribute-escaped`
- 🟢 `fix(button): escape all interpolated attribute values and x-data strings`

**Step 1.3 — Avatar (B2)**
- 🔴 `test(avatar): name "O'Brien" initializes; src/alt with quotes cannot break out`
- 🟢 `fix(avatar): escape src/name/initials/alt in x-data and attributes`

**Step 1.4 — Tabs (B3)**
- 🔴 `test(tabs): title/badge containing <img onerror> renders as text; ids sanitized`
- 🟢 `fix(tabs): escape title/badge, sanitize ids, whitelist icon markup`

**Step 1.5 — Breadcrumbs (B4)**
- 🔴 `test(breadcrumbs): javascript: hrefs are rejected; custom separator is escaped`
- 🟢 `fix(breadcrumbs): escape hrefs/text/separator; allow only http(s)/relative hrefs`

**Step 1.6 — Countdown, Stat, Timeline, Toggle-switch, Select, Drawer, Dialog class/text attrs (B5–B10)**
one red/green pair per component, same shape:
- 🔴 `test(<component>): hostile attribute values render inert`
- 🟢 `fix(<component>): escape interpolated attributes`

**Step 1.7 — Sanitized rich-content path (B11, B12)**
- 🔴 `test(accordion,chat-bubble): payloads that bypass the regex sanitizer (unquoted onclick, data-* corruption) are neutralized; legitimate data-* attributes survive`
- 🟢 `fix(sanitize): use DOMPurify when present (it is already an optionalDependency) with a conservative DOM-based fallback; delete the regex sanitizer`

### Phase 2 — Functional bug fixes

**Step 2.1 — AjaxDrawer random contentId (C1)**
- 🔴 `test(drawer): ajax-drawer hx-target matches the content div id without a content-id attribute`
- 🟢 `fix(drawer): generate contentId once (lazily memoize), not per getter call`

**Step 2.2 — Card attribute-change crash (C2)**
- 🔴 `test(card): changing elevation/variant after init does not throw and preserves slot content`
- 🟢 `fix(card): cache extracted slots; _render() uses cached slots when called without args`

**Step 2.3 — Toggle-switch re-render regressions (C3, C18)**
- 🔴 `test(toggle-switch): attribute change keeps hidden input + slot content; no on-label dead path; form reset listener not duplicated`
- 🟢 `fix(toggle-switch): cache original content, re-create hidden input after re-render, remove dead on-label branches, tear down form listener`

**Step 2.4 — Avatar re-render nesting (C4)**
- 🔴 `test(avatar): N attribute changes leave exactly one .avatar-container; badge slot preserved`
- 🟢 `fix(avatar): use _preserveSlotContent/_reRenderWithSlotContent in _handleAttributeChange`

**Step 2.5 — Button setText DOM wipe (C5)**
- 🔴 `test(button): setText updates the label while keeping the rendered button element`
- 🟢 `fix(button): update component data + re-render instead of assigning textContent`

**Step 2.6 — Alpine v3 data access (C6, C23)**
- 🔴 `test(base): _getAlpineData resolves via _x_dataStack (Alpine 3) across tabs/avatar/card/toggle-switch/badge public APIs`
- 🟢 `fix: delete per-component __x overrides; all components use BaseElement._getAlpineData`

**Step 2.7 — Tabs post-init API (C7)**
- 🔴 `test(tabs): setting active-tab after init switches tabs; nextTab/previousTab work after render`
- 🟢 `fix(tabs): cache extracted tab model; handle active-tab changes via Alpine data instead of re-running init`

**Step 2.8 — Toast lifecycle (C8, C9)**
- 🔴 `test(toast): attribute change while visible re-shows toast; Toast.success removes its host element after hide`
- 🟢 `fix(toast): make hide() promise-based and re-show after completion; auto-remove convenience toasts`

**Step 2.9 — Countdown expired slot (C10)**
- 🔴 `test(countdown): slot="expired" content shows on expiry even after prior renders`
- 🟢 `fix(countdown): capture expired-slot HTML before first render`

**Step 2.10 — Accordion double-escape (C11)**
- 🔴 `test(accordion): title "Q&A" displays as Q&A`
- 🟢 `fix(accordion): escape once — keep textContent insertion, drop pre-escaping`

**Step 2.11 — QR error recovery (C12)**
- 🔴 `test(qr): after a failed render, a successful render shows an attached canvas`
- 🟢 `fix(qr): re-attach/rebuild canvas when it is no longer connected`

**Step 2.12 — Code boolean setters (C13)**
- 🔴 `test(code): el.showCopy = false hides the copy button`
- 🟢 `fix(code): setters write explicit "false" value matching the getters' contract`

**Step 2.13 — Base init races & polling (C14, C15)**
- 🔴 `test(base): children arriving via observer + fallback timer initialize exactly once; Alpine polling stops after timeout`
- 🟢 `fix(base): guard _initializeComponent with an idempotency flag; cancel fallback timers when the observer fires; bound the Alpine wait with a deadline + warning`

**Step 2.14 — Listener/observer leaks (C16, C17)**
- 🔴 `test(dialog,breadcrumbs): disconnectedCallback removes document/body listeners and observers; two dialogs on one page target their own dialog`
- 🟢 `fix(dialog): per-instance unique default ids, scoped afterRequest handling, full teardown; fix(breadcrumbs): disconnect observer on removal`

**Step 2.15 — Double renders (C19, C20)**
- 🔴 `test(chat-bubble,swap): one property assignment causes exactly one render` (spy on _render)
- 🟢 `fix: setters only write attributes; attributeChangedCallback is the single render trigger`

**Step 2.16 — Small ones (C21, C22)**
- 🔴 `test(timeline): repeated init doesn't duplicate classes; test(select): disabled attribute change is honored`
- 🟢 `fix(timeline): compute classes from a stored original class list; feat(select): add observedAttributes handling + disconnect cleanup (and either wire or remove focusedIndex keyboard nav)`

### Phase 3 — Build & scripts

**Step 3.1 — Bundle/ESM output (D1, D2, D4)**
- 🔴 `test(build): dist/index.js is importable as ESM and exposes BaseElement; dependency graph has no phantom entries`
- 🟢 `fix(build): drop phantom alpine-utils dep; emit a real ESM wrapper (side-effect import + window.BaseElement re-export); remove redundant package.json copy; fix count log`

**Step 3.2 — Honest type definitions (D3)**
- 🔴 `test(build): generated .d.ts declares only methods that exist; tag names match customElements.define calls`
- 🟢 `fix(build): generate typings from the real BaseElement API; extract tag names by scanning define() calls`

**Step 3.3 — Dev server path (D5)**
- 🟢 `fix(dev-server): serve /tests, not /test` (trivial; no red needed beyond the existing 404)

### Phase 4 — Refactors & hygiene (safe on top of the test net)

**Step 4.1 — De-duplicate base (E1)**
- 🔴 `test(base): DRY2AlpineUtils mixin and BaseElement share one implementation` (behavioral specs pinned first)
- 🟢 `refactor(base): extract shared Alpine-wait logic; delete the verbatim copy`

**Step 4.2 — Dead code removal (E2, E3, E4, E11)**
- 🟢 `refactor: remove quadruplicated comment block, unused accordion/tabs/code helpers, drift-prone AccordionState duplication; move component-builder-example out of src/`
  (pure deletions — covered by the existing green suite; no red commit)

**Step 4.3 — Class-string duplication (E5)**
- 🔴 `test: snapshot class output for badge/button size+variant maps`
- 🟢 `refactor: single source of truth for size/variant class maps per component`

**Step 4.4 — Repo hygiene (E6, E7, E8, E10)**
- 🟢 `chore: replace 8,654-line .gitignore with a normal one (node_modules/, dist/, coverage/, .idea/)`
- 🟢 `chore: delete committed coverage/, .idea/, *.bak tests, root debug html pages and stray screenshots`
- 🟢 `chore: fill in real package.json metadata; drop nonexistent files entries; fix stat.js indentation`

**Step 4.5 — Naming consistency (E9, E12) — breaking, do last**
- 🔴 `test: dry-swap/dry-timeline/dry-toggle aliases resolve; breadcrumb-class attr honored (snake_case kept as deprecated alias)`
- 🟢 `feat!: register dry-* aliases for swap/timeline/toggle-switch, accept breadcrumb-class, rename timeline-item title→heading (keep deprecated fallbacks for one release)`

### Suggested cadence

Phases 0–1 are the highest value: today the suite doesn't run, lint doesn't run, the flagship demo
page is empty, and any attribute containing an apostrophe (or attacker HTML) breaks or exploits a
component. Phase 2 items C1–C5 are user-visible breakage in default configurations and should ship
next. Phases 3–4 can trail without risk.
