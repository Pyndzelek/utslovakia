# design-sync notes

- This repo is a Next.js app, not a published DS. `.design-sync/ds/build.mjs` (run as `buildCmd`) builds a pseudo-package into `.design-sync/pkg/dist/`: esbuild bundle of `src/components/ui/*` (react external), Tailwind v4 CSS compiled via postcss from `.design-sync/ds/styles.css`, and `.d.ts` via tsc. `.design-sync/pkg/` has its own package.json (name `utslovakia`) and a `node_modules` symlink to the repo's.
- `next-intl` and `@/i18n/navigation` are stubbed (`ds/stubs/`): messages come from `src/messages/en.json`, Link is a plain `<a>`. So Price shows USD (locale `en`).
- Scope: only `src/components/ui` primitives. App components (catalog/, product/, home/, layout/) not synced — they need Payload data + routing; candidates for a later pass (the CSS `@source` already covers layout/ and home/).
- Run the converter with `--node-modules ./.design-sync/pkg/node_modules --entry ./.design-sync/pkg/dist/index.js` from repo root (PKG_DIR derives from the entry; `cssEntry`/`srcDir` are relative to `.design-sync/pkg`).
- macOS 12: Playwright's chromium is unsupported. Use system Chrome: `DS_CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`.
- Fonts: Inter and Sora load from Google Fonts via `@import` in styles.css (`[FONT_REMOTE]`, informational). `--font-inter/--font-sora` are defined in `:root` there (the app gets them from next/font).
- Known render warns: RevealOnScroll captures blank (fade-in on scroll finishes after the screenshot); renders fine after ~2s.
- `ProductCardSkeleton` is not exported from the entry (not a ui primitive of interest); add to `ds/index.ts` if wanted.

## Re-sync risks
- Previews are tied to the English message file and the `ui` component APIs; changes to `src/components/ui/*` need `node .design-sync/ds/build.mjs` first.
- `tsc` step prints a harmless `payload` module-augmentation error (payload-types.ts); Price's `prices` prop is typed loosely because of it.
