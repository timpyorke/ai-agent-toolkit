---
name: web-accessibility
description: Implement accessible, inclusive web experiences aligned with WCAG, ARIA, and keyboard/focus best practices
---

# ♿ Web Accessibility (A11y) Skill

## Overview

Ensure your web applications are usable by everyone, including users relying on screen readers, keyboard navigation, magnifiers, voice control, or other assistive technologies. This skill provides practical guidance for building accessible UIs that comply with WCAG standards and modern best practices.

## Core WCAG Principles

1. **Perceivable**: Content can be seen, heard, or felt through different senses
2. **Operable**: Interface components are usable via keyboard, mouse, touch, or voice
3. **Understandable**: Content and controls behave predictably and clearly
4. **Robust**: Works reliably across browsers, devices, and assistive technologies

## Semantic HTML First

**Use the right element for the job:**

- Structure: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`
- Interactive: `<button>`, `<a>`, `<input>`, `<select>`, `<textarea>`
- Forms: `<label>`, `<fieldset>`, `<legend>`
- Data: `<table>`, `<th>`, `<caption>` for tabular data only

**Requirements:**

- All interactive elements reachable via `Tab` / `Shift+Tab`
- Tab order follows logical reading order (usually visual order)
- `Enter` activates buttons/links, `Space` activates buttons/checkboxes
- Arrow keys for custom components (tabs, menus, radio groups)

**Focus Indicators:**

- Always provide visible focus styles
- Never use `outline: none` without a replacement
- Ensure 3:1 contrast ratio for focus indicators (WCAG 2.2)

````css
/* Good focus styles */
:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* Or custom ring */
:focus- (Accessible Rich Internet Applications)

**First Rule of ARIA: Don't use ARIA**
- Prefer native semantic HTML over ARIA attributes
- Use ARIA only when HTML semantics are insufficient
- Never override native semantics (e.g., don't add `role="button"` to `<button>`)

**Common ARIA Patterns:**
- `aria-label`: Accessible name when no visible label exists
**Route Changes:**
- Move focus to main heading or content area after navigation
- Announce page changes to screen readers

**Modals/Dialogs:**
- Trap focus within modal while open
- Restore focus to trigger element on close
- Prevent background scrolling and interaction

**Skip Links:**
- Provide "Skip to main content" link as first focusable element
- Helpful for keyboard and screen reader users

```html
<!-- Skip link -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- Main landmark -->
<main id="main-content" tabindex="-1">
  <!-- Content -->
</main>
````

\*\*SAccessible Forms

**Labels:**

- Every input must have an associated label
- Use explicit association: `<label for="id">` + `<input id="id">`
- Or implicit: `<label>Label text <input /></label>`
- Placeholder is NOT a replacement for label

**Help Text & Errors:**

- Link help text with `aria-describedby`
- Clearly indicate required fields
- Provide specific, actionable error messages
- Use `aria-invalid="true"` on inputs with errors

**Grouping:**

- Use `<fieldset>` and `<legend>` for related controls
- Essential for radio buttons and checkboxes

````html
<fieldset>
  <legend>Shipping method</legend>
  <label><input type="radio" name="shipping" value="standard" /> Standard</label>
  <label><input type="radio" name="shipping" value="express" /> Express</label>
</fieldset
- `aria-label` or `aria-labelledby` for accessible names
**Contrast Requirements (WCAG 2.1 AA):**
- Normal text (< 18pt): 4.5:1 minimum
- Large text (≥ 18pt or ≥ 14pt bold): 3:1 minimum
- UI components and graphics: 3:1 minimum
- AAA level: 7:1 for normal, 4.5:1 for large

**Images:**
- Descriptive `alt` text for meaningful images
- `alt=""` for decorative images
- Complex images: detailed description via `aria-describedby` or adjacent text
mon Component Patterns

**Accordion:**
- `<button>` trigger with `aria-expanded="true/false"`
- Content region with `id` referenced by `aria-controls`
- Arrow keys to navigate between accordion items

**Tabs:**
- Container: `role="tablist"`
- Tabs: `role="tab"`, `aria-selected="true/false"`, `aria-controls`
- Panels: `role="tabpanel"`, `aria-labelledby`
- Arrow keys to switch tabs

**Modal/Dialog:**
- `role="dialog"` or `role="alertdialog"`
- `aria-modal="true"` to indicate modal behavior
- `aria-labelledby` references dialog title
- Focus trap within dialog

**Combobox/Autocomplete:**
- `role="combobox"` on input
- `aria-expaccessibility

**Manual Testing (Essential):**
1. **Keyboard Navigation**: Navigate entire site using only keyboard
   - Tab/Shift+Tab through all interactive elements
   - Enter/Space to activate buttons and links
   - Arrow keys for custom components
   - Escape to close modals/dialogs

2. **Screen Reader Testing**: Test with actual screen readers
   - Windows: NVDA (free) or JAWS
   - macOS: VoiceOver (built-in)
   - Mobile: TalkBack (Android), VoiceOver (iOS)

3. **Zoom & Magnification**: Test at 200% browser zoom

4. **Color Contrast**: Use browser DevTools or online checkers

**Automated Testing (Supplement):**
- **axe DevTools**: Browser extension for quick audits
- **Lighthouse**: Built into Chrome DevTools
- **eslint-plugin-jsx-a11y**: Catch issues during development
- **pa11y** or **axe-core**: CI/CD integration

```bash
# IBest Practices

### Do:
- ✅ Use semantic HTML elements before reaching for ARIA
- ✅ Provide text alternatives for non-text content
- ✅ Ensure all interactive elements are keyboard accessible
- ✅ Maintain sufficient color contrast ratios
- ✅ Test with actual assistive technologies
- ✅ Include accessibility in design phase, not as afterthought
- ✅ Make focus indicators clearly visible
- ✅ Provide clear, descriptive labels for all inputs
- ✅ Announce dynamic content changes appropriately
- ✅ Support browser zoom up to 200%

### Don't:
- ❌ Use `<div>` or `<span>` for interactive elements
- ❌ Remove `:focus` outlines without proper replacement
- ❌ Rely on color alone to convey meaning
- ❌ Use placeholder as a label replacement
- ❌ Trap keyboard focus unintentionally
- ❌ Create keyboard-only or mouse-only interfaces
- ❌ Auto-play audio or video without user control
- ❌ Use positive `tabindex` values (tabindex="1", tabindex="2", etc.)
- ❌ Hide content with `display: none` that should be screen-reader accessible
- ❌ Ignore automated testing warnings without investigation

## Quick Checklist

Before shipping:
- [ ] All images have appropriate `alt` text
- [ ] All form inputs have associated labels
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible and clear
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Page structure uses semantic HTML landmarks
- [ ] Modals trap focus and restore on close
- [ ] No automated accessibility errors (axe, Lighthouse)
- [ ] Tested with keyboard navigation
- [ ] Tested with screen reader (basic flow)
- [ ] Works at 200% zoom
- [ ] Dynamic content changes announced when necessary

## Resources

**Standards & Guidelines:**
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/)

**Testing Tools:**
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse (Chrome DevTools)](https://developers.google.com/web/tools/lighthouse)

**Screen Readers:**
- [NVDA (Windows, free)](https://www.nvaccess.org/)
- [VoiceOver (macOS/iOS, built-in)](https://www.apple.com/accessibility/voiceover/)
- [TalkBack (Android, built-in)](https://support.google.com/accessibility/android/answer/6283677)

---

**Related Skills**: [react](../react/SKILL.md) | [vue](../vue/SKILL.md) | [angular](../angular/SKILL.md) | [test-strategy](../test-strategy/SKILL.md)
````

## Forms

- Associate labels with inputs via `for`/`id` or wrapping
- Provide helper/error text via `aria-describedby`
- Group related controls with `fieldset` and `legend`

```html
<label for="email">Email</label>
<input id="email" name="email" type="email" aria-describedby="email-help" />
<div id="email-help">We'll never share your email.</div>
```

## Color & Contrast

- Maintain contrast ratios (WCAG AA: text 4.5:1; large 3:1)
- Do not use color alone to convey information
- Provide theme toggle and prefers-color-scheme support

## Media & Alternatives

- Alt text for images conveying meaning
- Captions and transcripts for video/audio
- Avoid autoplay; provide controls

## Components

- **Accordion**: button with `aria-expanded`, panel with `role="region"`
- **Tabs**: `role="tablist"`, tabs with `role="tab"`, panels `role="tabpanel"`
- **Menu**: `role="menu"` for application menus only; otherwise use list of buttons/links

## Testing A11y

- Keyboard tests: Tab/Shift-Tab/Enter/Space/Arrow keys
- Screen readers: NVDA, VoiceOver, JAWS basic checks
- Automated: axe, Lighthouse, eslint-plugin-jsx-a11y

```bash
# Run axe in Playwright
npx @axe-core/playwright --tags wcag2a,wcag2aa
```

## Do's & Don'ts

**Do:**

- Provide accessible names and descriptions.
- Maintain visible focus indicators.
- Announce dynamic updates via ARIA live regions if needed.

**Don't:**

- Remove outlines without replacement.
- Trap focus or keyboard unintentionally.
- Use non-semantic divs for interactive controls.

## Resources

- WCAG — https://www.w3.org/WAI/standards-guidelines/wcag/
- ARIA Authoring Practices — https://www.w3.org/WAI/ARIA/apg/
- Axe — https://www.deque.com/axe/
