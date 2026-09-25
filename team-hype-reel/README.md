# Team Hype Reel

A 20-second, 1080×1920 vertical reel (Reels / TikTok / Shorts) made from the team clip in `public/team.mp4`.

| Time | Scene | What happens |
| --- | --- | --- |
| 0–2s | Hook | "POV: you work with THE BEST TEAM EVER 🔥" slams in over the build-up |
| 2–8s | Squad clip | The original clip with beat zooms, camcorder UI, pop captions, emoji stickers, then a reverse-scrub "REWIND" |
| 8–12s | Run it back | 2×2 grid of color-remixed, sped-up copies bouncing on the beat |
| 12–16s | Roll call | Freeze-frame with animated name tags ("Chief Waving Officer 👋", "Hype Man 📣", …) |
| 16–20s | Outro | "ONE TEAM. ONE VIBE." + CTA, ending on "SQUAD GOALS 🔥" with confetti on the final hit |

## Soundtrack

`scripts/generate-audio.mjs` synthesizes an original 120 BPM track and the sound effects (whoosh, pop, rewind, shutter), so the audio is royalty-free.
At 120 BPM and 30fps, one beat is exactly 15 frames and scene cuts land on bar lines.

```console
npm run audio   # regenerate public/*.wav
```

## Commands

```console
npm i
npm run dev      # Remotion Studio
npm run render   # -> out/team-hype-reel.mp4
```

Edit captions and name tags in `src/TeamHype/scenes/`.

## Footage

The team footage is not committed. Add it locally before previewing or rendering:

```console
cp /path/to/clip.mp4 public/team.mp4   # H.264 recommended
npx remotion ffmpeg -ss 4.8 -i public/team.mp4 -frames:v 1 -q:v 2 public/freeze.jpg
```
