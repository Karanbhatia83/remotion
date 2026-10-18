# Devi — temple composite

Green-screen narrator keyed over the temple plate. 1080x1920, 30 fps, 123.33 s
(3700 frames), duration and frame rate read off the source at build time.

## Run it

```bash
cd projects/antara-devi-reel
npm install
npx remotion studio          # preview
npx remotion render DeviTempleReel out/devi-temple-reel.mp4
npx remotion still DeviTempleReel out/frame.png --frame=600
```

The effects are WebGL2 shaders, so Chromium needs a GL backend. `remotion.config.ts`
sets `swangle` (ANGLE over SwiftShader), which works with or without a GPU. On a
machine with a GPU, `angle` is faster — plain `angle` fails on headless/CI boxes.

## Files

| File | What |
|---|---|
| `src/Root.tsx` | Composition + `calculateMetadata` (duration/fps from the plate) |
| `src/DeviTempleReel.tsx` | The composite: background, keyed narrator, grade |
| `src/effects/chroma-key.ts` | Custom YUV chroma-key effect |
| `src/get-video-metadata.ts` | Mediabunny duration/fps probe |
| `public/narrator-green.mp4` | Green-screen plate (gitignored — see below) |
| `public/temple.jpg` | Background, pre-resampled to 1080x1920 |
| `public/temple-original.png` | The 572x1024 original as supplied |

## Why not `colorKey()`

The request asked for `colorKey()` from `@remotion/effects`. It cannot key this
footage, and that is a property of the plate rather than of the parameters.

`colorKey()` measures Euclidean distance in RGB, so brightness is part of the
decision. The backing here is a desaturated olive — **#8EA371**, not a saturated
green — and it is lit unevenly, bright at the top, dim at the edges. Measured
against the key colour, in `colorKey()`'s own normalised units:

```
backing, dim edge of the screen   0.080
skin                              0.109
```

Those overlap. Any threshold that clears the backing also punches holes in her
face — at `similarity: 0.14`, the lowest value that removes the green, her
face is already transparent.

The unevenness is almost entirely *luma*. Drop luma from the comparison and key
on chroma alone, and the gap reopens:

```
backing, dim edge of the screen   0.016
gold zari                         0.076   (4.8x)
skin                              0.092   (5.8x)
garment                           0.098   (6.2x)
```

So `src/effects/chroma-key.ts` is a `createEffect()` shader that converts to
BT.709 Y'CbCr, throws away Y, and thresholds on chroma distance. Same `effects`
array, same four parameter names, same Studio controls.

`colorKey()` is still wired up behind the `keyer` prop (`'chroma' | 'colorKey'`)
so the two can be compared in Studio.

## Parameters

Defaults in `src/Root.tsx`, all measured rather than guessed:

| Prop | Default | Why |
|---|---|---|
| `keyColor` | `#8ea371` | Sampled off the backing across 5 frames (σ ≈ 2/255) |
| `similarity` | `0.042` | Backing 0.016, skin 0.092 — sits between with ~2x either way |
| `smoothness` | `0.018` | Feathered band above the threshold |
| `spillSuppression` | `0.5` | Verified: green-lit hair #687657 -> #5C3E2B |
| `narratorScale` | `1` | Plate is already 1080x1920. Lower it to show more temple |
| `subjectFilter` | see below | Contrast, saturation, warmth |

Threshold behaviour, checked against composites: below ~0.022 green survives at
the frame edge; above ~0.040 it starts eating her cheek and the gold zari.

## Grade

```
contrast(1.1) saturate(1.2) sepia(0.16) saturate(1.1) brightness(1.03)
```

Applied as a CSS filter on the keyed `<Video>`, so it only touches surviving
pixels, not the background. Contrast fixes the flat plate, the first `saturate`
brings skin back, `sepia` warms it into the lamplight, the second `saturate`
restores what sepia desaturated, `brightness` lifts it to the lamp level.
Measured on frame 600: skin #A39894 -> #B7A597, patola #64544E -> #6B5349.

A warm `mixBlendMode` overlay was considered instead. It was not used: the
subject layer is transparent everywhere the backing was, so a blend layer over
it tints the temple as well. The filter stays on the subject by construction.

## Source media

The plate arrives as **HEVC, 495 MB**. Browsers cannot reliably decode HEVC, so
it is transcoded to H.264 (CRF 19, CFR 30) at 116 MB:

```bash
ffmpeg -i green.mp4 -c:v libx264 -preset medium -crf 19 -profile:v high \
  -pix_fmt yuv420p -vsync cfr -r 30 -c:a aac -b:a 192k \
  -movflags +faststart public/narrator-green.mp4
```

`public/*.mp4` is gitignored — 116 MB does not belong in the repo. Re-create it
with the command above, or drop your own plate in and the composition re-reads
its duration automatically.

The temple image was supplied at **572x1024**, below the 1080x1920 canvas. It is
pre-resampled with lanczos so the browser is not doing a 1.89x bilinear upscale
every frame; `fit="cover"` is then a no-op. It is a soft, defocused plate so it
carries the enlargement, but a higher-resolution original would look better.

## Content

No captions, no text, no lower thirds, no entrance or exit animation. The
composite is static for the full duration.
