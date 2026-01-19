# Accessibility Examples & Testing

## Focus Management Examples

### Skip Links

```html
<!-- Place at the very top of <body> -->
<a href="#main-content" class="skip-link"> Skip to main content </a>

<!-- CSS to hide until focused -->
<style>
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 100;
  }

  .skip-link:focus {
    top: 0;
  }
</style>

<!-- Target element -->
<main id="main-content" tabindex="-1">
  <h1>Page Title</h1>
  <!-- Content -->
</main>
```

### Focus Management on Route Change (React)

```javascript
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    // Focus main content area on route change
    if (mainRef.current) {
      mainRef.current.focus();
    }

    // Announce route change to screen readers
    const message = document.title || "Page changed";
    announceToScreenReader(message);
  }, [location]);

  return (
    <main ref={mainRef} tabindex="-1" className="main-content">
      {/* Page content */}
    </main>
  );
}

// Announce to screen readers using live region
function announceToScreenReader(message) {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", "polite");
  announcement.style.position = "absolute";
  announcement.style.left = "-10000px";
  announcement.style.width = "1px";
  announcement.style.height = "1px";
  announcement.style.overflow = "hidden";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
```

### Modal Focus Trap (Vanilla JS)

```javascript
class FocusTrap {
  constructor(element) {
    this.element = element;
    this.previousFocus = null;
    this.focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "textarea:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");
  }

  activate() {
    // Store currently focused element
    this.previousFocus = document.activeElement;

    // Get all focusable elements
    const focusable = Array.from(
      this.element.querySelectorAll(this.focusableSelector),
    );

    if (focusable.length === 0) return;

    this.firstFocusable = focusable[0];
    this.lastFocusable = focusable[focusable.length - 1];

    // Set up tab trap
    this.element.addEventListener("keydown", this.handleKeyDown);

    // Focus first element
    this.firstFocusable.focus();
  }

  deactivate() {
    this.element.removeEventListener("keydown", this.handleKeyDown);

    // Restore focus
    if (this.previousFocus && this.previousFocus.focus) {
      this.previousFocus.focus();
    }
  }

  handleKeyDown = (e) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      // Shift + Tab: trap at first element
      if (document.activeElement === this.firstFocusable) {
        e.preventDefault();
        this.lastFocusable.focus();
      }
    } else {
      // Tab: trap at last element
      if (document.activeElement === this.lastFocusable) {
        e.preventDefault();
        this.firstFocusable.focus();
      }
    }
  };
}

// Usage
const modal = document.querySelector('[role="dialog"]');
const focusTrap = new FocusTrap(modal);

function openModal() {
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  focusTrap.activate();
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
  focusTrap.deactivate();
}
```

## Form Validation Examples

### Accessible Form with Validation

```html
<form id="signup-form" novalidate>
  <!-- Name field -->
  <div class="form-field">
    <label for="name"> Name <span aria-label="required">*</span> </label>
    <input
      type="text"
      id="name"
      name="name"
      required
      aria-required="true"
      aria-describedby="name-error"
    />
    <div id="name-error" class="error" role="alert" hidden>
      Please enter your name
    </div>
  </div>

  <!-- Email field -->
  <div class="form-field">
    <label for="email"> Email <span aria-label="required">*</span> </label>
    <input
      type="email"
      id="email"
      name="email"
      required
      aria-required="true"
      aria-describedby="email-help email-error"
    />
    <div id="email-help" class="help-text">We'll never share your email</div>
    <div id="email-error" class="error" role="alert" hidden></div>
  </div>

  <!-- Password field with strength indicator -->
  <div class="form-field">
    <label for="password">
      Password <span aria-label="required">*</span>
    </label>
    <input
      type="password"
      id="password"
      name="password"
      required
      aria-required="true"
      aria-describedby="password-requirements password-strength password-error"
    />
    <div id="password-requirements" class="help-text">
      At least 8 characters with uppercase, lowercase, and number
    </div>
    <div id="password-strength" role="status" aria-live="polite">
      <!-- Updated dynamically -->
    </div>
    <div id="password-error" class="error" role="alert" hidden></div>
  </div>

  <!-- Submit -->
  <button type="submit">Create Account</button>
</form>

<script>
  const form = document.getElementById("signup-form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Clear previous errors
    clearErrors();

    // Validate
    const errors = validateForm();

    if (errors.length > 0) {
      displayErrors(errors);
      // Focus first error
      const firstError = document.querySelector('[aria-invalid="true"]');
      if (firstError) firstError.focus();
    } else {
      // Submit form
      submitForm();
    }
  });

  function validateForm() {
    const errors = [];
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const password = document.getElementById("password");

    if (!name.value.trim()) {
      errors.push({ field: name, message: "Please enter your name" });
    }

    if (!email.value.trim()) {
      errors.push({ field: email, message: "Please enter your email" });
    } else if (!isValidEmail(email.value)) {
      errors.push({
        field: email,
        message: "Please enter a valid email address",
      });
    }

    if (!password.value) {
      errors.push({ field: password, message: "Please enter a password" });
    } else if (!isStrongPassword(password.value)) {
      errors.push({
        field: password,
        message:
          "Password must be at least 8 characters with uppercase, lowercase, and number",
      });
    }

    return errors;
  }

  function displayErrors(errors) {
    errors.forEach(({ field, message }) => {
      // Mark field as invalid
      field.setAttribute("aria-invalid", "true");

      // Show error message
      const errorId = field.id + "-error";
      const errorElement = document.getElementById(errorId);
      errorElement.textContent = message;
      errorElement.hidden = false;
    });
  }

  function clearErrors() {
    document.querySelectorAll('[aria-invalid="true"]').forEach((field) => {
      field.removeAttribute("aria-invalid");
    });

    document.querySelectorAll(".error").forEach((error) => {
      error.textContent = "";
      error.hidden = true;
    });
  }

  // Password strength indicator
  document.getElementById("password").addEventListener("input", (e) => {
    const password = e.target.value;
    const strengthElement = document.getElementById("password-strength");

    let strength = "Weak";
    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score < 3) strength = "Weak";
    else if (score < 4) strength = "Medium";
    else strength = "Strong";

    strengthElement.textContent = `Password strength: ${strength}`;
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isStrongPassword(password) {
    return (
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    );
  }
</script>
```

## Dynamic Content Announcements

### Toast Notifications

```html
<!-- Toast container with live region -->
<div
  id="toast-container"
  role="status"
  aria-live="polite"
  aria-atomic="true"
  class="toast-container"
>
  <!-- Toasts inserted here -->
</div>

<script>
  function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // For urgent messages, use assertive
    if (type === "error") {
      toast.setAttribute("role", "alert");
    }

    container.appendChild(toast);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }

  // Usage
  document.getElementById("save-button").addEventListener("click", () => {
    // ... save logic
    showToast("Changes saved successfully", "success");
  });
</script>
```

### Loading State Announcements

```html
<button id="load-data-button">Load Data</button>
<div
  id="loading-status"
  role="status"
  aria-live="polite"
  aria-atomic="true"
></div>
<div id="data-container"></div>

<script>
  async function loadData() {
    const button = document.getElementById("load-data-button");
    const status = document.getElementById("loading-status");
    const container = document.getElementById("data-container");

    // Start loading
    button.disabled = true;
    button.textContent = "Loading...";
    status.textContent = "Loading data, please wait";

    try {
      const data = await fetch("/api/data").then((r) => r.json());

      // Success
      container.innerHTML = renderData(data);
      status.textContent = "Data loaded successfully";

      // Clear status after announcement
      setTimeout(() => {
        status.textContent = "";
      }, 1000);
    } catch (error) {
      // Error - use alert role for immediate announcement
      status.setAttribute("role", "alert");
      status.textContent = "Error loading data. Please try again.";
    } finally {
      button.disabled = false;
      button.textContent = "Load Data";
    }
  }
</script>
```

## Testing Workflows

### Manual Keyboard Testing Checklist

```markdown
## Keyboard Navigation Test

### Tab Navigation

- [ ] Tab key moves focus to all interactive elements
- [ ] Tab order follows logical reading order
- [ ] Focus visible on all elements
- [ ] Shift+Tab moves backwards correctly
- [ ] No keyboard traps (can always escape)

### Interactive Elements

- [ ] Enter activates buttons and links
- [ ] Space activates buttons and toggles checkboxes
- [ ] Arrow keys work in custom components (tabs, menus, etc.)
- [ ] Escape closes modals, menus, dropdowns
- [ ] Home/End navigate to first/last (where appropriate)

### Forms

- [ ] Can fill out entire form with keyboard only
- [ ] Error messages are announced
- [ ] Can submit form with Enter
- [ ] Required fields clearly indicated

### Dynamic Content

- [ ] New content doesn't steal focus unexpectedly
- [ ] Updates announced to screen readers (live regions)
- [ ] Focus managed appropriately on route changes

### Widgets

- [ ] Accordions: Arrow keys navigate, Space/Enter toggle
- [ ] Tabs: Arrow keys switch tabs, panels update
- [ ] Modals: Focus trapped, Escape closes, focus restored
- [ ] Dropdowns/Combobox: Arrow keys, Enter selects, Escape closes
```

### Automated Testing with axe-core

**Install:**

```bash
npm install --save-dev @axe-core/cli @axe-core/playwright
```

**CI/CD Integration:**

```yaml
# .github/workflows/a11y.yml
name: Accessibility Tests

on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Build site
        run: npm run build

      - name: Serve site
        run: npm run serve &

      - name: Run axe
        run: |
          npx @axe-core/cli http://localhost:3000 \
            --tags wcag2a,wcag2aa,wcag21aa \
            --exit
```

**Playwright Integration:**

```javascript
// tests/a11y.spec.js
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility tests", () => {
  test("Homepage should not have accessibility violations", async ({
    page,
  }) => {
    await page.goto("/");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("Form page should be accessible", async ({ page }) => {
    await page.goto("/contact");

    const results = await new AxeBuilder({ page })
      .exclude(".third-party-widget") // Exclude external widgets
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
```

**Jest + Testing Library:**

```javascript
// Button.test.jsx
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import Button from "./Button";

expect.extend(toHaveNoViolations);

test("Button should be accessible", async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("Button should have accessible name", () => {
  render(<Button>Click me</Button>);
  const button = screen.getByRole("button", { name: /click me/i });
  expect(button).toBeInTheDocument();
});

test("Icon button should have aria-label", () => {
  render(
    <Button aria-label="Close">
      <CloseIcon />
    </Button>,
  );
  const button = screen.getByRole("button", { name: /close/i });
  expect(button).toBeInTheDocument();
});
```

### Screen Reader Testing Guide

**VoiceOver (macOS):**

```markdown
## VoiceOver Quick Start

### Activation

- Cmd + F5: Toggle VoiceOver on/off
- Cmd + Fn + F5: On newer MacBooks

### Navigation

- VO = Control + Option (default)
- VO + Right Arrow: Next element
- VO + Left Arrow: Previous element
- VO + Space: Activate element
- VO + U: Open rotor (navigate by headings, links, etc.)

### Testing Checklist

- [ ] Page title announced on load
- [ ] All text content readable
- [ ] All images have alt text (or marked decorative)
- [ ] Headings create logical structure
- [ ] Links have descriptive text
- [ ] Buttons clearly indicate action
- [ ] Forms have proper labels
- [ ] Error messages announced
- [ ] Live regions announce updates
```

**NVDA (Windows - Free):**

```markdown
## NVDA Quick Start

### Download

https://www.nvaccess.org/download/

### Navigation

- Insert = NVDA key
- Down Arrow: Next line
- Up Arrow: Previous line
- Tab: Next focusable element
- H: Next heading
- K: Next link
- B: Next button
- F: Next form field
- Insert + Down: Read all

### Testing Checklist

- [ ] Browse mode works (arrow keys read content)
- [ ] Focus mode works (Tab navigates forms)
- [ ] Alt text read for images
- [ ] Links announced with context
- [ ] Form fields have labels
- [ ] Buttons indicate state (pressed, expanded)
- [ ] Tables have headers
- [ ] Error messages accessible
```

## React Component Examples

### Accessible Button Component

```jsx
// Button.jsx
import React from "react";
import PropTypes from "prop-types";

function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  loading = false,
  "aria-label": ariaLabel,
  ...props
}) {
  return (
    <button
      className={`button button-${variant}`}
      onClick={onClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      {...props}
    >
      {loading && <span className="spinner" role="status" aria-hidden="true" />}
      <span className={loading ? "visually-hidden" : ""}>{children}</span>
      {loading && <span className="sr-only">Loading...</span>}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(["primary", "secondary", "danger"]),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  "aria-label": PropTypes.string,
};

export default Button;
```

### Accessible Form Field Component

```jsx
// FormField.jsx
import React, { useId } from "react";
import PropTypes from "prop-types";

function FormField({
  label,
  type = "text",
  required = false,
  error,
  helperText,
  value,
  onChange,
  ...props
}) {
  const id = useId();
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(" ");

  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label}
        {required && (
          <span aria-label="required" className="required">
            *
          </span>
        )}
      </label>

      {helperText && (
        <div id={helperId} className="helper-text">
          {helperText}
        </div>
      )}

      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy || undefined}
        {...props}
      />

      {error && (
        <div id={errorId} className="error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  helperText: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export default FormField;
```

### Accessible Modal Component

```jsx
// Modal.jsx
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";

function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Store previous focus
    previousFocusRef.current = document.activeElement;

    // Focus modal
    const firstFocusable = modalRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    firstFocusable?.focus();

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    // Cleanup
    return () => {
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="modal-close"
          >
            ×
          </button>
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export default Modal;
```

## Common Patterns

### Visually Hidden but Screen-Reader Accessible

```css
/* Screen reader only class */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Focusable skip link */
.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

```html
<!-- Icon with hidden text -->
<button>
  <svg aria-hidden="true"><!-- star icon --></svg>
  <span class="sr-only">Add to favorites</span>
</button>

<!-- External link indicator -->
<a href="https://example.com">
  Example Site
  <span class="sr-only">(opens in new tab)</span>
</a>
```

### Loading Indicators

```html
<!-- Button with loading state -->
<button disabled aria-busy="true">
  <span class="spinner" aria-hidden="true"></span>
  <span class="sr-only">Loading, please wait</span>
</button>

<!-- Section loading -->
<div aria-busy="true" aria-describedby="loading-message">
  <div class="skeleton"></div>
  <div id="loading-message" class="sr-only">Loading content, please wait</div>
</div>
```
