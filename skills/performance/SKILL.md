---
name: Web Performance Optimization
description: Optimize for Core Web Vitals with efficient rendering, bundling, caching, and network strategies
---

# Performance Skill

Improve user-perceived performance using modern metrics and best practices.

## Metrics (Core Web Vitals)

- **LCP** (Largest Contentful Paint): target < 2.5s
- **CLS** (Cumulative Layout Shift): target < 0.1
- **INP** (Interaction to Next Paint): target < 200ms
- **TTI/TBT**: Time to Interactive/Total Blocking Time

## Rendering

- Avoid layout thrashing; batch DOM reads/writes
- Use CSS for animations (transform/opacity) over JS
- Reduce reflow via container sizes and aspect-ratio

## Bundling

- Code split by route and feature
- Tree-shake and remove dead code
- Prefer ESM and modern targets

```json
// package.json
{
  "type": "module",
  "browserslist": ["defaults", "not IE 11"]
}
```

## Network

- Use HTTP/2/3; enable server compression (gzip/brotli)
- Optimize images (formats: WebP/AVIF; responsive sizes)
- Preload critical assets; prefetch routes

```html
<link
  rel="preload"
  href="/fonts/Inter.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
<link rel="prefetch" href="/route/chunk.js" />
```

## Caching

- Cache static assets with long TTLs; use content hashing
- Use Service Worker for offline/fast repeat visits
- Validate revalidation via ETags and cache-control

```http
Cache-Control: public, max-age=31536000, immutable
ETag: "abc123"
```

## Data Layer

- Client-side caching (React Query/Apollo/Redux Toolkit Query)
- Stale-while-revalidate patterns for lists
- Avoid waterfalls with batched requests

## Images & Fonts

- Lazy-load below-the-fold images; use `loading="lazy"`
- Use `font-display: swap` to avoid FOIT; preload critical fonts

```css
@font-face {
  font-family: Inter;
  src: url(Inter.woff2) format("woff2");
  font-display: swap;
}
```

## Performance Budget

- Set budgets per route (JS size, image count, LCP target)
- Fail CI when budgets exceeded via Lighthouse CI

```bash
npx lhci autorun --upload.target=filesystem
```

## Monitoring

- Field data via `web-vitals` library
- Real user monitoring (RUM) into analytics

```ts
import { onLCP, onCLS, onINP } from "web-vitals";

onLCP(console.log);
onCLS(console.log);
onINP(console.log);
```

## Do's & Don'ts

**Do:**

- Prioritize critical path (HTML/CSS first).
- Inline above-the-fold CSS only when small.
- Use lazy-loading and defers.

**Don't:**

- Import large libraries globally when localized.
- Render huge lists without virtualization.
- Animate layout-affecting properties (top/left/width).

## Resources

- Web.dev — https://web.dev/learn/
- Core Web Vitals — https://web.dev/vitals/
- Lighthouse CI — https://github.com/GoogleChrome/lighthouse-ci
