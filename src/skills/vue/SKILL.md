---
name: Vue Web Development
description: Build maintainable Vue apps with Composition API, Pinia state, routing, testing, and performance
---

# Vue Skill

Guidelines for scalable Vue 3 applications using the Composition API and modern tooling.

## Project Structure

- `src/components/` — Global reusable components
- `src/features/<feature>/` — Feature-local components, stores, composables
- `src/stores/` — Pinia stores
- `src/router/` — Route definitions per feature
- `src/composables/` — Reusable logic via Composition API

## Composition API

```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";

const filter = ref("");
const items = ref<string[]>([]);

const filtered = computed(() =>
  items.value.filter((i) => i.includes(filter.value)),
);

watch(filter, (val) => {
  // Debounce or side-effects
});

onMounted(async () => {
  items.value = await (await fetch("/api/items")).json();
});
</script>

<template>
  <input v-model="filter" />
  <ul>
    <li v-for="i in filtered" :key="i">{{ i }}</li>
  </ul>
</template>
```

## State Management (Pinia)

```ts
// stores/user.ts
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({ user: null as null | { id: string; name: string } }),
  actions: {
    async fetch(id: string) {
      this.user = await (await fetch(`/api/users/${id}`)).json();
    },
  },
  getters: {
    isLoggedIn: (state) => !!state.user,
  },
});
```

## Routing

```ts
// router/index.ts
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", component: () => import("../features/home/HomePage.vue") },
  {
    path: "/users/:id",
    component: () => import("../features/users/UserPage.vue"),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
```

## Styling

- Scoped CSS for component-local styles
- Utility-first (Tailwind) or CSS variables for theming
- Avoid deep selectors; prefer class-based targeting

## Accessibility

- Use semantic elements and `aria-` only when necessary
- Ensure keyboard navigation and focus management
- Provide accessible names for controls (`aria-label`, `aria-labelledby`)

```vue
<template>
  <button @click="open" aria-expanded="open">Menu</button>
  <nav v-if="open" role="menu" @keydown.escape="open = false">
    <a role="menuitem" href="/a">A</a>
    <a role="menuitem" href="/b">B</a>
  </nav>
</template>
```

## Performance

- Computed properties over watchers for derived state
- Lazy-load routes/components with dynamic imports
- Use `keep-alive` for caching expensive components

```vue
<template>
  <keep-alive>
    <router-view />
  </keep-alive>
</template>
```

## Testing

- **Unit**: Vue Test Utils + Vitest/Jest
- **Component**: Render and assert behavior/user interactions
- **Stores**: Test actions and getters in isolation

```ts
import { mount } from "@vue/test-utils";
import Tabs from "./Tabs.vue";

it("switches tab", async () => {
  const wrapper = mount(Tabs);
  await wrapper.find('[role="tab"]').trigger("click");
  expect(wrapper.find('[role="tabpanel"]').exists()).toBe(true);
});
```

## Do's & Don'ts

**Do:**

- Use `script setup` for concise components.
- Encapsulate logic in composables.
- Prefer Pinia over Vuex in Vue 3.

**Don't:**

- Mutate props inside components.
- Overuse global stores for local state.
- Heavy watchers for trivial updates.

## Resources

- Vue Docs — https://vuejs.org/
- Pinia — https://pinia.vuejs.org/
- Vue Router — https://router.vuejs.org/
