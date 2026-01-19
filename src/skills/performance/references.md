# Reference Material

## Core Web Vitals

| Metric | Full Name | Target | Description |
|--------|-----------|--------|-------------|
| **LCP** | Largest Contentful Paint | < 2.5s | Loading performance (hero image/text). |
| **INP** | Interaction to Next Paint | < 200ms | Responsiveness (replacing FID). |
| **CLS** | Cumulative Layout Shift | < 0.1 | Visual stability (unexpected movement). |

## RAIL Model

- **Response**: Process events in < 50ms.
- **Animation**: Produce a frame in 10ms (60fps).
- **Idle**: Maximize idle time for deferred work.
- **Load**: Deliver content and become interactive in < 5s.

## Optimization Checklist

- [ ] **Images**: Use WebP/AVIF, responsive sizes (`srcset`), and lazy loading.
- [ ] **Fonts**: Use `woff2`, subsetting, and `font-display: swap`.
- [ ] **JS**: Minify, compress (Brotli/Gzip), and code-split.
- [ ] **CSS**: Extract critical CSS, defer non-critical.
- [ ] **Network**: Use HTTP/2 or HTTP/3, CDN, and proper cache headers.
- [ ] **3rd Party**: Defer tracking scripts, use facades for heavy embeds (YouTube/Maps).

## Tools

- **Lighthouse**: Lab data audit.
- **WebPageTest**: Deep waterfall analysis.
- **Chrome DevTools**: Performance tab (flame charts) and Network tab.
- **Bundle Analyzer**: Visualize JS bundle composition.
