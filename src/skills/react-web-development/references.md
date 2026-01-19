# Reference Material

## Core Principles

-   **Component Hierarchy**: Lift state up only when necessary.
-   **One-Way Data Flow**: Props flow down; events flow up.
-   **Composition**: Prefer composition (`children` prop) over inheritance.
-   **Immutability**: Never mutate state directly; use functional updates.

## React Hooks Cheatsheet

| Hook | Purpose | Example Usage |
|------|---------|---------------|
| `useState` | Local component state | `const [count, setCount] = useState(0)` |
| `useEffect` | Side effects (API, DOM) | `useEffect(() => { subscribe() }, [])` |
| `useContext` | Global/subtree state | `const theme = useContext(ThemeContext)` |
| `useReducer` | Complex state logic | `const [state, dispatch] = useReducer(reducer, init)` |
| `useMemo` | Memoize expensive values | `const val = useMemo(() => compute(a), [a])` |
| `useCallback` | Memoize functions | `const fn = useCallback(() => {}, [])` |
| `useRef` | Mutable ref (DOM access) | `const inputRef = useRef(null)` |

## Best Practices Checklist

-   [ ] **Structure**: Feature-based folders (`src/features/auth`).
-   [ ] **Optimization**: Don't optimize prematurely. Measure first.
-   [ ] **Keys**: Use stable IDs for keys, not array indices.
-   [ ] **Effects**: Clean up subscriptions/timers in `useEffect`.
-   [ ] **Accessibility**: Manage focus, use semantic HTML.
-   [ ] **Security**: Avoid `dangerouslySetInnerHTML`.
