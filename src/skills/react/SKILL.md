---
name: React Web Development
description: Build scalable, accessible React apps with component patterns, hooks, state management, testing, and performance optimization
---

# React Skill

When building React applications, follow these patterns and practices to ensure maintainability, performance, and accessibility.

## Core Architecture

- **Component Hierarchy**: Prefer small, focused components. Lift state only as needed.
- **File Structure**:
  - `src/features/<feature>/components/` — Presentational components
  - `src/features/<feature>/hooks/` — Feature-specific hooks
  - `src/features/<feature>/services/` — API calls
  - `src/shared/` — Reusable UI primitives and utilities
- **Colocation**: Keep state and effects close to where they are used.

## Hooks & State

### Essential Hooks

```tsx
import { useState, useEffect, useMemo, useCallback, useRef } from "react";

function Example({ items }: { items: string[] }) {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(
    () => items.filter((i) => i.includes(filter)),
    [items, filter],
  );

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div>
      <input ref={inputRef} value={filter} onChange={onChange} />
      <ul>
        {filtered.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Derived State

- Use `useMemo` for expensive computations, not for simple props.
- Avoid duplicating state that can be derived from props.

### Data Fetching

```tsx
function useUser(userId: string) {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((d) => active && setData(d))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [userId]);

  return { data, loading, error };
}
```

## Component Patterns

- **Controlled vs Uncontrolled**: Prefer controlled inputs for forms; uncontrolled for simple cases.
- **Compound Components**: Provide flexible APIs via context.

```tsx
// Compound components
const TabsContext = React.createContext<{
  active: string;
  setActive: (id: string) => void;
} | null>(null);

function Tabs({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState("");
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div role="tablist">{children}</div>
    </TabsContext.Provider>
  );
}

function Tab({ id, children }: { id: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabsContext)!;
  const selected = ctx.active === id;
  return (
    <button
      role="tab"
      aria-selected={selected}
      onClick={() => ctx.setActive(id)}
    >
      {children}
    </button>
  );
}

function TabPanel({ id, children }: { id: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabsContext)!;
  return ctx.active === id ? <div role="tabpanel">{children}</div> : null;
}
```

## Styling

- **CSS-in-JS**: Use libraries like `styled-components` or `@emotion` for theming.
- **CSS Modules/Tailwind**: Prefer predictable scoping and utility classes.
- **Design Tokens**: Centralize colors, spacing, typography.

## Accessibility

- Use semantic HTML: buttons for actions, links for navigation.
- Manage focus: focus trap modals, restore focus on close.
- ARIA only when semantics insufficient.
- Provide keyboard support for interactive widgets.

```tsx
function Modal({ open, onClose, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => prev?.focus();
  }, [open]);

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" tabIndex={-1} ref={ref}>
      <button onClick={onClose}>Close</button>
      {children}
    </div>
  );
}
```

## Performance

- **Memoization**: `React.memo` for pure components; measure before applying.
- **Avoid Re-renders**: Stable callbacks/values for child props.
- **Code Splitting**: `React.lazy` and `Suspense` for routes/components.

```tsx
const UserProfile = React.lazy(() => import("./UserProfile"));

export function Route() {
  return (
    <React.Suspense fallback={<Spinner />}>
      <UserProfile />
    </React.Suspense>
  );
}
```

- **List Virtualization**: Use `react-window` for large lists.
- **Avoid heavy inline functions** inside lists; precompute handlers if needed.

## Testing

- **Unit**: React Testing Library + Jest.
- **Integration**: Test component composition and data fetching.
- **Accessibility**: Test roles, names, keyboard navigation.

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

it("switches tabs with keyboard", async () => {
  render(
    <Tabs>
      <Tab id="a">A</Tab>
      <Tab id="b">B</Tab>
      <TabPanel id="a">Panel A</TabPanel>
      <TabPanel id="b">Panel B</TabPanel>
    </Tabs>,
  );

  const a = screen.getByRole("tab", { name: /a/i });
  const b = screen.getByRole("tab", { name: /b/i });
  await userEvent.click(a);
  expect(screen.getByText(/panel a/i)).toBeInTheDocument();
  await userEvent.click(b);
  expect(screen.getByText(/panel b/i)).toBeInTheDocument();
});
```

## Data Layer

- Use a query library (React Query/Apollo) for caching, retries, and background refresh.

```tsx
import { useQuery } from "@tanstack/react-query";

function useUser(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => (await fetch(`/api/users/${id}`)).json(),
    staleTime: 60_000,
  });
}
```

## Do's & Don'ts

**Do:**

- Colocate state and effects.
- Prefer composition over inheritance.
- Use Suspense for data boundaries where supported.

**Don't:**

- Overuse context for frequently changing values.
- Keep large objects in state without memoization.
- Block main thread with heavy computations.

## Resources

- React Docs — https://react.dev
- React Testing Library — https://testing-library.com/docs/react-testing-library/intro/
- TanStack Query — https://tanstack.com/query/latest
