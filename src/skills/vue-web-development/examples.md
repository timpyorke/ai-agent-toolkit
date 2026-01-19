# Examples

## Composition API

### Basic Component

```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";

const filter = ref("");
const items = ref<string[]>([]);

const filtered = computed(() =>
  items.value.filter((i) => i.includes(filter.value)),
);

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

```typescript
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({ user: null as { id: string; name: string } | null }),
  actions: {
    async fetch(id: string) {
      this.user = await (await fetch(\`/api/users/\${id}\`)).json();
    },
  },
  getters: {
    isLoggedIn: (state) => !!state.user,
  },
});
```

## Routing

```typescript
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", component: () => import("../features/home/HomePage.vue") },
  { path: "/users/:id", component: () => import("../features/users/UserPage.vue") },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
```

## Testing (Vue Test Utils)

```typescript
import { mount } from "@vue/test-utils";
import Tabs from "./Tabs.vue";

it("switches tab", async () => {
  const wrapper = mount(Tabs);
  await wrapper.find('[role="tab"]').trigger("click");
  expect(wrapper.find('[role="tabpanel"]').exists()).toBe(true);
});
```
