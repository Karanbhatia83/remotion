# Thank-you reel pipeline (green screen -> Remotion)

Source: 4K HEVC 10-bit, flat picture profile, rotation flag (portrait). Backdrop is a
low-saturation olive green (#8b937a), so stock chromakey/colorkey fail (skin and the silver
kurta print key out before the hair). Working approach:

1. `plate.py`  - sample visible backdrop from 4 frames, fit a smooth Y/Cb/Cr surface -> `plate.npy`
2. `fg.py`     - per frame: chroma-distance key against the plate (blurred chroma, luma-weighted),
                 erode 1px + feather, despill, grade (sat 1.75, contrast 1.22, S-curve, warm shift),
                 light-wrap from a sigma-18 blur of the background, stream RGBA -> VP9 alpha WebM
3. `captions.py` - faster-whisper (medium, hi) word timestamps on the cleaned voice -> captions.json,
                 then hand-corrected into `public/reel/captions_final.json`
4. Audio (ffmpeg): voice = highpass 85, afftdn, de-ess, EQ (-3.5 dB 220 Hz, -2 dB 450, +3 dB 2.4k,
   +3.5 dB 4.5k, +2 dB 9k shelf), compressor 2.5:1, loudnorm -14 LUFS.
   Music = highpass 120, lowpass 9k, -2.5 dB at 2 kHz, loudnorm -23.5, sidechain-ducked by the
   voice (ratio 4, release 800 ms) -> about -35 LUFS under speech, -24 in pauses, +6 dB outro swell.
5. `src/Reel.tsx` - Remotion: background (blurred, slow push 1.08->1.15), transparent subject
   (push 1.00->1.035 for parallax), key-light wash + vignette, hook, city callouts, captions,
   end card. Two compositions: ThankYouReel (music) and ThankYouReelNoMusic.
