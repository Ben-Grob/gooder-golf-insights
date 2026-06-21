## Why the preview resets

The dev-server logs show this sequence right before each reset:

```
[vite] ✨ new dependencies optimized: @supabase/supabase-js
[vite] ✨ optimized dependencies changed. reloading
```

It's not an app crash. Vite's dependency optimizer discovers heavy deps (like `@supabase/supabase-js`) lazily — the first time a route imports them, Vite re-bundles and forces a **full page reload**. Older module chunks briefly 404/504 during the swap, which is exactly the "Failed to fetch dynamically imported module" runtime error you've been seeing too.

This is triggered whenever you navigate to a page that pulls in a dep Vite hadn't seen yet, hence the "random" feel.

## Fix

Pre-declare the heavy deps so Vite bundles them on startup once, instead of mid-session.

### Change

`vite.config.ts` — add an `optimizeDeps.include` list via the underlying `vite` config:

```ts
export default defineConfig({
  tanstackStart: { server: { entry: "server" } },
  vite: {
    optimizeDeps: {
      include: [
        "@supabase/supabase-js",
        "@tanstack/react-query",
        "react-hook-form",
        "zod",
      ],
    },
  },
});
```

(Final list will be based on which top-level deps are actually imported in `src/` — I'll grep before writing it.)

### Verify

1. Restart the dev server once so the new prebundle takes effect.
2. Tail the vite daemon log and confirm no further `new dependencies optimized … reloading` lines after navigating across the app's main routes.
3. Open the preview and click through pages that previously triggered the reload.

No app code changes, no behavior changes — only dev-server stability.