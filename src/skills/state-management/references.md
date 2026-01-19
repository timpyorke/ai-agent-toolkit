# Reference Material

## Core Principles

1.  **Single Source of Truth**: Define where state lives (URL, Server, Client Store) and stick to it.
2.  **Immutability**: Makes changes predictable and traceable (essential for Redux/React).
3.  **Unidirectional Data Flow**: Action -> Store -> View. Never View -> View.
4.  **Colocation**: Keep state as close to where it's used as possible (Local > Context > Global).

## Choosing a Solution

| Scope | React | Vue | Angular |
|-------|-------|-----|---------|
| **Local/Form** | `useState`, `useReducer` | `ref`, `reactive` | Component Property |
| **Server State** | TanStack Query, SWR | TanStack Query, Pinia | RxJS, NgRx Data |
| **Global UI** | Context, Zustand, Redux | Pinia | NgRx Store, Signals |
| **Complex Flows** | XState | XState | RxJS |

## Best Practices

-   **Selectors**: Always use selectors to derive data. Avoid computing in components.
-   **Normalization**: Store data like a database (IDs + Dictionary), not arrays of objects.
-   **Actions as Events**: Actions should describe *what happened* (`userLoggedOut`), not *what to do* (`setUserDataToNull`).
