---
name: Frontend State Management
description: Design predictable, scalable client-side state using Redux, Pinia, NgRx, and reactive patterns
---

# State Management Skill

Choose the right state solution per framework and use predictable patterns for updates and effects.

## Principles

- **Single source of truth** per domain
- **Immutable updates** for predictability
- **Selectors** for derived data
- **Effects** for side effects (API, storage)

## React

### Redux Toolkit

```ts
import {
  configureStore,
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

export const fetchUser = createAsyncThunk("user/fetch", async (id: string) => {
  return (await fetch(`/api/users/${id}`)).json();
});

const userSlice = createSlice({
  name: "user",
  initialState: {
    data: null as any,
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchUser.fulfilled, (s, a) => {
        s.loading = false;
        s.data = a.payload;
      })
      .addCase(fetchUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message ?? null;
      });
  },
});

export const store = configureStore({ reducer: { user: userSlice.reducer } });
```

### Alternative: Zustand

```ts
import { create } from "zustand";

export const useUserStore = create<{ user: any; setUser: (u: any) => void }>(
  (set) => ({
    user: null,
    setUser: (u) => set({ user: u }),
  }),
);
```

## Vue (Pinia)

```ts
import { defineStore } from "pinia";

export const useTodoStore = defineStore("todo", {
  state: () => ({ items: [] as { id: string; text: string; done: boolean }[] }),
  actions: {
    add(text: string) {
      this.items.push({ id: crypto.randomUUID(), text, done: false });
    },
    toggle(id: string) {
      const i = this.items.find((i) => i.id === id)!;
      i.done = !i.done;
    },
  },
  getters: {
    completed: (s) => s.items.filter((i) => i.done),
  },
});
```

## Angular (NgRx)

- Structure: actions → reducer → selectors → effects

```ts
// selectors.ts
import { createSelector, createFeatureSelector } from "@ngrx/store";

export const selectUserState = createFeatureSelector<any>("user");
export const selectUser = createSelector(selectUserState, (s) => s.user);
```

## Persistence & Sync

- Persist via localStorage/sessionStorage responsibly (PII caution)
- Sync server state via query libs; keep client state for UI/control

## Patterns

- **Normalized State**: Avoid deep nested trees; use IDs + maps
- **Entity Adapters**: Tooling for CRUD operations (RTK/NgRx)
- **Optimistic Updates**: Update UI before server confirmation with rollback on failure

```ts
// React Query example
await queryClient.cancelQueries(["todos"]);
const prev = queryClient.getQueryData(["todos"]);
queryClient.setQueryData(["todos"], updater);
// rollback on error
```

## Testing State

- Reducers pure-function tests
- Selectors as derived data
- Effects with mocked services/APIs

## Do's & Don'ts

**Do:**

- Keep side effects out of reducers.
- Use selectors for performance and encapsulation.
- Document state shape per domain.

**Don't:**

- Store derived/transient values unnecessarily.
- Overuse global state for local UI concerns.
- Mutate state directly in immutable systems.

## Resources

- Redux Toolkit — https://redux-toolkit.js.org/
- Pinia — https://pinia.vuejs.org/
- NgRx — https://ngrx.io/
