---
name: Web Accessibility (A11y)
description: Implement accessible, inclusive web experiences aligned with WCAG, ARIA, and keyboard/focus best practices
---

# Accessibility Skill

Ensure your UI is usable for all users, including those using screen readers, keyboard navigation, magnifiers, or assistive technologies.

## Principles

- **Perceivable**: Content can be perceived in multiple ways
- **Operable**: Interface usable via keyboard and assistive tech
- **Understandable**: Clear, consistent, predictable behaviors
- **Robust**: Works across devices and assistive tech

## Semantics First

- Use semantic elements: `header`, `nav`, `main`, `section`, `article`, `button`, `a`, `label`
- Link vs Button: navigation → `<a href>`, actions → `<button>`
- Use tables only for tabular data, include headers and captions

## Keyboard Navigation

- All interactive elements must be reachable via Tab
- Logical tab order matches visual order
- Provide visible focus styles (not outline: none)

```css
:focus {
  outline: 2px solid #1e90ff;
  outline-offset: 2px;
}
```

## ARIA

- Use ARIA only when native semantics insufficient
- `aria-label` or `aria-labelledby` for accessible names
- `aria-expanded`, `aria-controls` for disclosure widgets
- `role="dialog"` with `aria-modal="true"` for modals

## Focus Management

- Manage focus on route changes and modals
- Use focus traps for dialogs; restore focus on close

```js
// Move focus to main content on route change
const main = document.querySelector("main");
main.setAttribute("tabindex", "-1");
main.focus();
```

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
