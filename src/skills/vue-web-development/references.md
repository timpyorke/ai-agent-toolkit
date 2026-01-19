# Reference Material

## Project Structure

-   `src/components/`: Global reusable UI components.
-   `src/features/`: Domain-specific components, stores, routes.
-   `src/composables/`: Reusable stateful logic (hooks).
-   `src/stores/`: Pinia modules.

## Styling Scoping

-   **Scoped**: `<style scoped>` for component isolation.
-   **Modules**: `style.module.css` for explicit class mapping.
-   **Global**: `start/base.css` for resets and variables.

## Accessibility

-   Use semantic HTML (`<nav>`, `<button>` vs `<div>`).
-   Manage focus for modals and routing.
-   Use `aria-*` attributes for custom controls.
