# Deployment

The game ships as a static Vite build served from the `/ascend-os/` project path. `vite.config.ts` sets `base: '/ascend-os/'`, so every asset URL in `dist/index.html` carries that prefix.

All dependencies (React, React DOM, Lucide icons, Tailwind output) are bundled into `dist/assets`. There are no runtime CDN imports, so the game loads with a single React copy and works without third-party hosts.

Before publishing, confirm `dist/index.html` references `/ascend-os/assets/...` and contains no external module URLs.
