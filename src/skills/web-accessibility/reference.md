# Accessibility Reference Guide

## Complete ARIA Attribute Reference

### Naming & Labeling

**aria-label**

- Provides accessible name when no visible label exists
- Use sparingly; prefer visible labels for all users

```html
<button aria-label="Close dialog">×</button>
<nav aria-label="Main navigation">...</nav>
```

**aria-labelledby**

- References one or more elements by ID for the accessible name
- Can combine multiple elements

```html
<h2 id="dialog-title">Confirmation</h2>
<div role="dialog" aria-labelledby="dialog-title">...</div>

<!-- Combining multiple labels -->
<span id="billing">Billing</span>
<span id="name">Name</span>
<input aria-labelledby="billing name" />
```

**aria-describedby**

- Links to description or help text
- Announced after label in screen readers

```html
<label for="password">Password</label>
<input id="password" type="password" aria-describedby="password-requirements" />
<div id="password-requirements">Must be at least 8 characters</div>
```

### Widget States

**aria-expanded**

- Indicates whether controlled element is expanded or collapsed
- Values: `true`, `false`, or omit if not applicable

```html
<button aria-expanded="false" aria-controls="submenu">Menu</button>
<div id="submenu" hidden>...</div>
```

**aria-selected**

- Indicates selected state in tabs, options, rows
- Values: `true`, `false`, or omit

```html
<div role="tablist">
  <button role="tab" aria-selected="true">Tab 1</button>
  <button role="tab" aria-selected="false">Tab 2</button>
</div>
```

**aria-checked**

- For checkbox/radio roles
- Values: `true`, `false`, `mixed` (for indeterminate checkboxes)

```html
<div role="checkbox" aria-checked="false">Accept terms</div>
<div role="checkbox" aria-checked="mixed">Select all (partially selected)</div>
```

**aria-pressed**

- Toggle button state
- Values: `true`, `false`, `mixed`

```html
<button aria-pressed="false">Bold</button>
```

**aria-disabled**

- Indicates disabled state
- Values: `true`, `false`
- Note: Still focusable unlike `disabled` attribute

```html
<button aria-disabled="true">Submit (not ready)</button>
```

**aria-invalid**

- Indicates validation error
- Values: `true`, `false`, `grammar`, `spelling`

```html
<input aria-invalid="true" aria-describedby="email-error" />
<div id="email-error">Please enter a valid email</div>
```

**aria-required**

- Indicates required field
- Values: `true`, `false`

```html
<input aria-required="true" />
```

### Relationships

**aria-controls**

- References element(s) controlled by current element

```html
<button aria-expanded="false" aria-controls="menu">Options</button>
<div id="menu" hidden>...</div>
```

**aria-owns**

- Establishes parent-child relationship in accessibility tree
- Use when DOM structure doesn't match desired a11y structure

```html
<div role="grid">
  <div role="row" aria-owns="cell1 cell2"></div>
</div>
<div id="cell1" role="gridcell">A</div>
<div id="cell2" role="gridcell">B</div>
```

**aria-activedescendant**

- For composite widgets; indicates currently active descendant
- Used with combobox, listbox, tree

```html
<input role="combobox" aria-activedescendant="option-2" />
<ul role="listbox">
  <li role="option" id="option-1">Option 1</li>
  <li role="option" id="option-2">Option 2</li>
</ul>
```

**aria-flowto**

- Indicates reading order when it differs from DOM order

```html
<div id="section1" aria-flowto="section3">Part 1</div>
<div id="section2">Sidebar</div>
<div id="section3">Part 2</div>
```

### Live Regions

**aria-live**

- Announces dynamic content changes
- Values: `off`, `polite` (wait for pause), `assertive` (interrupt)

```html
<div aria-live="polite">3 new messages</div>
<div aria-live="assertive">Error: Connection lost</div>
```

**aria-atomic**

- Whether to announce entire region or just changes
- Values: `true` (announce all), `false` (announce changes only)

```html
<div aria-live="polite" aria-atomic="true">Score: <span>42</span></div>
```

**aria-relevant**

- What changes to announce
- Values: `additions`, `removals`, `text`, `all`

```html
<ul aria-live="polite" aria-relevant="additions removals">
  <!-- Items added/removed will be announced -->
</ul>
```

**role="alert"**

- Implicit `aria-live="assertive"` + `aria-atomic="true"`

```html
<div role="alert">Your session will expire in 5 minutes</div>
```

**role="status"**

- Implicit `aria-live="polite"` + `aria-atomic="true"`

```html
<div role="status">Loading...</div>
```

### Hiding Content

**aria-hidden**

- Hides element from accessibility tree
- Values: `true`, `false`
- Use for decorative content or duplicate information

```html
<!-- Decorative icon -->
<svg aria-hidden="true">...</svg>

<!-- Icon with text label -->
<button>
  <svg aria-hidden="true">...</svg>
  Save
</button>
```

**Note:** Never use `aria-hidden="true"` on focusable elements!

### Modal & Dialog

**aria-modal**

- Indicates content outside dialog is inert
- Values: `true`, `false`

```html
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Confirm Action</h2>
  ...
</div>
```

## Complete Component Patterns

### Accordion

**HTML Structure:**

```html
<div class="accordion">
  <h3>
    <button
      id="accordion-btn-1"
      aria-expanded="false"
      aria-controls="accordion-panel-1"
      class="accordion-button"
    >
      Section 1
      <span aria-hidden="true">▼</span>
    </button>
  </h3>
  <div
    id="accordion-panel-1"
    role="region"
    aria-labelledby="accordion-btn-1"
    hidden
    class="accordion-panel"
  >
    <p>Content for section 1</p>
  </div>

  <!-- Repeat for more sections -->
</div>
```

**JavaScript:**

```javascript
// Toggle accordion panel
function toggleAccordion(button) {
  const expanded = button.getAttribute("aria-expanded") === "true";
  const panel = document.getElementById(button.getAttribute("aria-controls"));

  button.setAttribute("aria-expanded", !expanded);
  panel.hidden = expanded;
}

// Optional: Allow only one panel open at a time
function handleAccordionClick(event) {
  const button = event.target.closest(".accordion-button");
  if (!button) return;

  // Close all other panels
  const allButtons = document.querySelectorAll(".accordion-button");
  allButtons.forEach((btn) => {
    if (btn !== button && btn.getAttribute("aria-expanded") === "true") {
      toggleAccordion(btn);
    }
  });

  toggleAccordion(button);
}

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  const button = e.target;
  if (!button.classList.contains("accordion-button")) return;

  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    const buttons = Array.from(document.querySelectorAll(".accordion-button"));
    const currentIndex = buttons.indexOf(button);
    const nextIndex =
      e.key === "ArrowDown"
        ? (currentIndex + 1) % buttons.length
        : (currentIndex - 1 + buttons.length) % buttons.length;
    buttons[nextIndex].focus();
  }
});
```

### Tabs

**HTML Structure:**

```html
<div class="tabs">
  <div role="tablist" aria-label="Content sections">
    <button
      role="tab"
      id="tab-1"
      aria-selected="true"
      aria-controls="panel-1"
      tabindex="0"
    >
      Tab 1
    </button>
    <button
      role="tab"
      id="tab-2"
      aria-selected="false"
      aria-controls="panel-2"
      tabindex="-1"
    >
      Tab 2
    </button>
    <button
      role="tab"
      id="tab-3"
      aria-selected="false"
      aria-controls="panel-3"
      tabindex="-1"
    >
      Tab 3
    </button>
  </div>

  <div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
    <p>Content for tab 1</p>
  </div>
  <div role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>
    <p>Content for tab 2</p>
  </div>
  <div role="tabpanel" id="panel-3" aria-labelledby="tab-3" hidden>
    <p>Content for tab 3</p>
  </div>
</div>
```

**JavaScript:**

```javascript
function switchTab(oldTab, newTab) {
  // Update tabs
  oldTab.setAttribute("aria-selected", "false");
  oldTab.setAttribute("tabindex", "-1");
  newTab.setAttribute("aria-selected", "true");
  newTab.setAttribute("tabindex", "0");
  newTab.focus();

  // Update panels
  const oldPanel = document.getElementById(
    oldTab.getAttribute("aria-controls"),
  );
  const newPanel = document.getElementById(
    newTab.getAttribute("aria-controls"),
  );
  oldPanel.hidden = true;
  newPanel.hidden = false;
}

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  const tab = e.target;
  if (tab.getAttribute("role") !== "tab") return;

  const tabs = Array.from(
    tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]'),
  );
  const currentIndex = tabs.indexOf(tab);
  let newTab = null;

  switch (e.key) {
    case "ArrowLeft":
    case "ArrowUp":
      e.preventDefault();
      newTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
      break;
    case "ArrowRight":
    case "ArrowDown":
      e.preventDefault();
      newTab = tabs[(currentIndex + 1) % tabs.length];
      break;
    case "Home":
      e.preventDefault();
      newTab = tabs[0];
      break;
    case "End":
      e.preventDefault();
      newTab = tabs[tabs.length - 1];
      break;
  }

  if (newTab) {
    switchTab(tab, newTab);
  }
});
```

### Modal/Dialog

**HTML Structure:**

```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
  class="modal"
  hidden
>
  <div class="modal-content">
    <h2 id="dialog-title">Confirm Delete</h2>
    <p id="dialog-description">
      Are you sure you want to delete this item? This action cannot be undone.
    </p>
    <div class="modal-actions">
      <button type="button" class="button-primary" data-action="confirm">
        Delete
      </button>
      <button type="button" class="button-secondary" data-action="cancel">
        Cancel
      </button>
    </div>
  </div>
</div>
```

**JavaScript (Focus Trap):**

```javascript
class Modal {
  constructor(element) {
    this.element = element;
    this.focusableElements = null;
    this.firstFocusable = null;
    this.lastFocusable = null;
    this.previousActiveElement = null;
  }

  open() {
    this.previousActiveElement = document.activeElement;
    this.element.hidden = false;
    document.body.style.overflow = "hidden";

    // Get focusable elements
    this.focusableElements = this.element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    this.firstFocusable = this.focusableElements[0];
    this.lastFocusable =
      this.focusableElements[this.focusableElements.length - 1];

    // Focus first element
    this.firstFocusable.focus();

    // Add event listeners
    this.element.addEventListener("keydown", this.handleKeydown);
    document.addEventListener("keydown", this.trapFocus);
  }

  close() {
    this.element.hidden = true;
    document.body.style.overflow = "";

    // Remove event listeners
    this.element.removeEventListener("keydown", this.handleKeydown);
    document.removeEventListener("keydown", this.trapFocus);

    // Restore focus
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
    }
  }

  handleKeydown = (e) => {
    if (e.key === "Escape") {
      this.close();
    }
  };

  trapFocus = (e) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusable) {
        e.preventDefault();
        this.lastFocusable.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusable) {
        e.preventDefault();
        this.firstFocusable.focus();
      }
    }
  };
}

// Usage
const modal = new Modal(document.querySelector(".modal"));
document
  .querySelector("[data-open-modal]")
  .addEventListener("click", () => modal.open());
document
  .querySelector('[data-action="cancel"]')
  .addEventListener("click", () => modal.close());
```

### Combobox/Autocomplete

**HTML Structure:**

```html
<div class="combobox">
  <label for="country-input">Country</label>
  <input
    id="country-input"
    type="text"
    role="combobox"
    aria-autocomplete="list"
    aria-expanded="false"
    aria-controls="country-listbox"
    aria-activedescendant=""
  />
  <ul id="country-listbox" role="listbox" hidden>
    <!-- Options populated dynamically -->
  </ul>
</div>
```

**JavaScript:**

```javascript
class Combobox {
  constructor(input, listbox) {
    this.input = input;
    this.listbox = listbox;
    this.options = [];
    this.activeIndex = -1;

    this.input.addEventListener("input", this.handleInput);
    this.input.addEventListener("keydown", this.handleKeydown);
    this.listbox.addEventListener("click", this.handleOptionClick);
  }

  handleInput = (e) => {
    const value = e.target.value.toLowerCase();
    this.filterOptions(value);

    if (this.options.length > 0) {
      this.open();
    } else {
      this.close();
    }
  };

  handleKeydown = (e) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.setActiveOption(
          Math.min(this.activeIndex + 1, this.options.length - 1),
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        this.setActiveOption(Math.max(this.activeIndex - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (this.activeIndex >= 0) {
          this.selectOption(this.options[this.activeIndex]);
        }
        break;
      case "Escape":
        this.close();
        break;
    }
  };

  setActiveOption(index) {
    this.activeIndex = index;
    const option = this.options[index];

    // Update aria-activedescendant
    this.input.setAttribute("aria-activedescendant", option.id);

    // Update visual state
    this.options.forEach((opt, i) => {
      opt.classList.toggle("active", i === index);
    });

    // Scroll into view
    option.scrollIntoView({ block: "nearest" });
  }

  open() {
    this.listbox.hidden = false;
    this.input.setAttribute("aria-expanded", "true");
  }

  close() {
    this.listbox.hidden = true;
    this.input.setAttribute("aria-expanded", "false");
    this.input.setAttribute("aria-activedescendant", "");
    this.activeIndex = -1;
  }
}
```

## Landmark Roles

Use semantic HTML elements which have implicit roles:

| Semantic HTML          | Implicit Role   | Purpose                       |
| ---------------------- | --------------- | ----------------------------- |
| `<header>` (document)  | `banner`        | Site-wide header              |
| `<nav>`                | `navigation`    | Navigation section            |
| `<main>`               | `main`          | Primary content               |
| `<aside>`              | `complementary` | Related/supplementary content |
| `<footer>` (document)  | `contentinfo`   | Site-wide footer              |
| `<section>` with label | `region`        | Significant section           |
| `<form>` with label    | `form`          | Form landmark                 |
| `<search>` (HTML5.2)   | `search`        | Search functionality          |

**Use explicit roles when:**

- Semantic element doesn't exist (`<div role="search">`)
- Need multiple landmarks of same type (label with `aria-label` or `aria-labelledby`)

```html
<!-- Multiple navigation regions -->
<nav aria-label="Primary">...</nav>
<nav aria-label="Footer">...</nav>

<!-- Search region -->
<div role="search">
  <input type="search" />
</div>
```

## WCAG Compliance Levels

**Level A (Minimum):**

- Basic accessibility
- Required for legal compliance in many jurisdictions

**Level AA (Recommended):**

- Addresses major accessibility barriers
- Standard target for most websites
- Includes Level A + additional criteria

**Level AAA (Enhanced):**

- Highest level of accessibility
- May not be possible for all content
- Includes Levels A, AA + strictest criteria

Common AA requirements:

- 4.5:1 contrast for normal text
- 3:1 contrast for large text and UI components
- Resizable text up to 200%
- Multiple ways to find pages
- Consistent navigation
- Error suggestions for forms
