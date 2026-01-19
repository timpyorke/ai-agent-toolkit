# Examples

## React State Management

### Redux Toolkit (RTK)

```typescript
import { configureStore, createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async Thunk
export const fetchUser = createAsyncThunk("user/fetch", async (id: string) => {
  return (await fetch(\`/api/users/\${id}\`)).json();
});

// Slice
const userSlice = createSlice({
  name: "user",
  initialState: { data: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => { state.loading = true; })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const store = configureStore({ reducer: { user: userSlice.reducer } });
```

### Zustand (Simple Store)

```typescript
import { create } from "zustand";

interface UserStore {
  user: any;
  setUser: (u: any) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
```

## Vue State Management (Pinia)

```typescript
import { defineStore } from "pinia";

export const useTodoStore = defineStore("todo", {
  state: () => ({ items: [] }),
  actions: {
    add(text: string) {
      this.items.push({ id: Date.now(), text, done: false });
    },
    toggle(id: number) {
      const item = this.items.find((i) => i.id === id);
      if (item) item.done = !item.done;
    },
  },
  getters: {
    completedCount: (state) => state.items.filter((i) => i.done).length,
  },
});
```

## Patterns

### Optimistic Updates (React Query)

```typescript
const queryClient = useQueryClient();

useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    // Snapshot previous value
    const previousTodos = queryClient.getQueryData(['todos']);

    // Optimistically update
    queryClient.setQueryData(['todos'], (old) => [...old, newTodo]);

    return { previousTodos };
  },
  onError: (err, newTodo, context) => {
    // Rollback
    queryClient.setQueryData(['todos'], context.previousTodos);
  },
  onSettled: () => {
    // Refetch to sync
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
```
