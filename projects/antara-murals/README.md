# Antara — animated mural backdrops (LED wall)

Six seamless-loop backdrops for the Antara bhajan show, 1920x1080 @ 24 fps.

| Composition | File | Length |
|---|---|---|
| `RamNaam`   | Antara_Mural_RamNaam_Surface_v1_1080p_10s.mp4    | 10 s |
| `ShivStone` | Antara_Mural_Shiv_Stone_Surface_v1_1080p_10s.mp4 | 10 s |
| `Pichwai`   | Antara_Mural_Pichwai_Surface_v1_1080p_10s.mp4    | 10 s |
| `Kashi`     | Antara_Mural_Kashi_Folk_v1_1080p_15s.mp4         | 15 s |
| `Mandala`   | Antara_Mural_Mandala_Surface_v1_1080p_10s.mp4    | 10 s |
| `Rangoli`   | Antara_Mural_Rangoli_Diyas_v1_1080p_10s.mp4      | 10 s |

## How the loops are made exact

The still plates in `public/plates/` were AI-generated; **all motion is procedural** in
Remotion. Every animated value is a function of `t = frame / durationInFrames` with an
integer number of cycles per loop (`src/loop.ts`), so frame N wraps to frame 0 by
construction. Things that bit us, and their fixes, are documented in the components:

- Scrolling texture: overscan `scale` on a parent, `translate` on the child — otherwise
  the translate is applied in screen pixels and the tile period no longer matches.
- CSS `mask-image` reads alpha, not luminance: masks are RGBA with alpha = mask.
- Masked layers must live under the same scale wrapper as the plate, or they moiré.
- Rotating a raster by its own pattern period is not pixel-identical. The mandala plate
  was mirror-folded to exact 20-fold symmetry, and each ring is rendered twice
  (at a and a-18°) with a crossfade across the loop so the wrap is an ordinary step.

## Render

```
npx remotion render src/index.ts <Composition> out/<name>.mp4 --gl=swangle --codec=h264 --crf=14
```

Loop check used for every delivery: mean |frame[i+1] - frame[i]| for all i, and the
wrap |frame[0] - frame[N-1]| must fall inside that range.
