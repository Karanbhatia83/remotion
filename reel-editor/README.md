# reel-editor

A Remotion project that lays animated titles over a vertical (1080×1920) reel.

Built against a 10s, 30fps clip. Overlays are config-driven — the copy and
timings live in one file, so changing them doesn't mean touching component code.

## Setup

```bash
npm install
npm run studio     # live preview
npm run render     # writes out/reel-titled.mp4
```

Put your footage at `public/source.mp4`. Media is gitignored, so the clip the
project was built against is not in this repo.

If the render can't launch a browser, point it at one you already have:

```bash
npx remotion render src/index.ts Reel out/reel-titled.mp4 \
  --browser-executable=/path/to/chrome
```

## Editing

Everything you'd normally want to change is in **`src/edit.config.ts`**:

- `OVERLAYS` — copy, plus `from`/`to` in seconds for each overlay. Set
  `enabled: false` to drop one.
- `CLIPS` — clips play back to back. Add an entry to join another clip; the
  composition length recalculates itself.
- `MUSIC` — set `enabled: true` and drop a file in `public/`. Fades are handled.
- `PALETTE` — warm saffron/marigold, pulled from the footage.
- `SAFE` — margins that keep overlays clear of the Instagram caption block and
  action rail.

## Notes

- Fonts are **self-hosted** in `public/fonts` (Mukta + Poppins) rather than
  fetched from the Google Fonts CDN, so renders don't depend on the network.
  Mukta covers Devanagari, so Hindi copy works with no code change.
- `src/fonts.ts` holds the render via `delayRender` until every face has loaded,
  so no frame captures in a fallback face.
- The end CTA is deliberately positioned high and ends at 9.05s: the closing
  shot frames the subject centrally and carries its own comment overlays from
  ~9.1s.
