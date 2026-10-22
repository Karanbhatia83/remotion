import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {breath, cyc, frac, hump, lerp, rng} from './loop';
import frost from './data/shiv-frost.json';

// Mural 2 — Himalayan granite under "Om Namah Shivay".
// Plate is static. Moonlight, saffron rim, the travelling inner glow, snow,
// ash, mist and the heartbeat are all periodic in the loop.

const W = 1920;
const H = 1080;
const OVERSCAN = 1.035;

type Flake = {x: number; y0: number; r: number; k: number; drift: number; land: number; settles: boolean};
const makeFlakes = (n: number, seed: number): Flake[] => {
  const r = rng(seed);
  return Array.from({length: n}, () => ({
    x: r() * 1.3 - 0.15,
    y0: r(),
    r: 1.4 + r() * 2.4,
    k: r() < 0.65 ? 1 : 2,
    drift: 0.10 + r() * 0.12,          // fraction of W moved per fall
    land: 0.35 + r() * 0.55,           // where a settling flake stops (phase)
    settles: r() < 0.3,
  }));
};
const FLAKES = makeFlakes(220, 2210);

type Ash = {x: number; y0: number; r: number; k: number; sway: number};
const makeAsh = (n: number, seed: number): Ash[] => {
  const r = rng(seed);
  return Array.from({length: n}, () => ({x: r(), y0: r(), r: 1 + r() * 1.8, k: 1, sway: 8 + r() * 18}));
};
const ASH = makeAsh(90, 2211);

export const ShivStone: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = frame / durationInFrames;

  // camera: ~1% drift and return
  const cam = OVERSCAN * (1 + 0.01 * hump(t, 1));   // overscan lives here so every layer (plate, masks, points) scales together
  const camX = 6 * cyc(t, 1) ;
  const camY = -4 * cyc(t, 1, 0.25) + 4;

  // saffron rim breathes: brightest at 0s and 5s
  const rim = 0.45 + 0.55 * breath(t, 2);

  // inner glow: left → right, off-screen at both ends of the loop
  const glowX = lerp(-0.38, 1.38, t);
  const glowFade = Math.sin(Math.PI * t);          // 0 at wrap, full mid-loop

  // heartbeat: a soft swell every 5 s
  const hb = Math.pow(hump(t, 2), 6) * 0.14;

  // mist: one period per loop, right → left
  const mistX = frac(t) * W;

  return (
    <AbsoluteFill style={{background: '#070a12', overflow: 'hidden'}}>
      <AbsoluteFill style={{scale: String(cam), translate: `${camX}px ${camY}px`, transformOrigin: '50% 50%'}}>
        {/* ---------- stone ---------- */}
        <Img src={staticFile('plates/shiv-plate.png')} style={{position: 'absolute', inset: 0, width: W, height: H}} />

        {/* ---------- cold moonlight from above (grade) ---------- */}
        <AbsoluteFill style={{background: 'rgba(30,44,80,0.62)', mixBlendMode: 'multiply'}} />
        <AbsoluteFill
          style={{
            mixBlendMode: 'screen',
            background: 'linear-gradient(180deg, rgba(120,150,210,0.42) 0%, rgba(60,80,130,0.18) 40%, rgba(0,0,0,0) 75%)',
          }}
        />

        {/* ---------- heartbeat under the surface ---------- */}
        <AbsoluteFill style={{mixBlendMode: 'screen', opacity: hb, background: 'radial-gradient(ellipse 60% 70% at 50% 55%, rgba(200,190,170,1) 0%, rgba(0,0,0,0) 70%)'}} />

        {/* ---------- inner glow travelling through the rock, masked by the stone's grain ---------- */}
        <AbsoluteFill
          style={{
            mixBlendMode: 'screen',
            opacity: 1.0 * glowFade,
            WebkitMaskImage: `url(${staticFile('plates/shiv-mask.png')})`,
            maskImage: `url(${staticFile('plates/shiv-mask.png')})`,
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            background: `radial-gradient(ellipse 22% 85% at ${glowX * 100}% 50%, rgba(255,240,205,1) 0%, rgba(255,215,150,0.75) 30%, rgba(180,150,100,0.25) 62%, rgba(0,0,0,0) 100%)`,
          }}
        />
        {/* a softer, wider halo of the same light so it reads from the back row */}
        <AbsoluteFill
          style={{
            mixBlendMode: 'screen',
            opacity: 0.17 * glowFade,
            background: `radial-gradient(ellipse 34% 95% at ${glowX * 100}% 50%, rgba(255,235,200,0.9) 0%, rgba(0,0,0,0) 70%)`,
          }}
        />

        {/* ---------- frost sparkles in the cracks as the glow passes ---------- */}
        {(frost as Array<[number, number]>).map(([fx, fy], i) => {
          const d = Math.abs(fx - glowX);
          const near = Math.max(0, 1 - d / 0.16);
          const tw = 0.5 + 0.5 * cyc(t, 11 + (i % 7), i * 0.137);
          const a = near * near * tw * glowFade;
          if (a < 0.02) return null;
          const r = 1.5 + 2.5 * a;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: fx * W - r,
                top: fy * H - r,
                width: r * 2,
                height: r * 2,
                borderRadius: '50%',
                background: `rgba(255,250,235,${a})`,
                boxShadow: `0 0 ${6 + 10 * a}px rgba(255,240,210,${0.7 * a})`,
              }}
            />
          );
        })}

        {/* ---------- saffron rim light raking from the right ---------- */}
        <AbsoluteFill
          style={{
            mixBlendMode: 'screen',
            opacity: rim,
            background: 'linear-gradient(265deg, rgba(255,150,60,0.80) 0%, rgba(230,110,40,0.38) 18%, rgba(120,50,15,0.10) 40%, rgba(0,0,0,0) 60%)',
          }}
        />
        {/* rim catches the top edge of grains: a second, tighter pass through the grain mask */}
        <AbsoluteFill
          style={{
            mixBlendMode: 'screen',
            opacity: 0.6 * rim,
            WebkitMaskImage: `url(${staticFile('plates/shiv-mask.png')})`,
            maskImage: `url(${staticFile('plates/shiv-mask.png')})`,
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            background: 'linear-gradient(265deg, rgba(255,190,110,1) 0%, rgba(255,150,70,0.5) 25%, rgba(0,0,0,0) 55%)',
          }}
        />

        {/* ---------- ash rising from the bottom ---------- */}
        {ASH.map((a, i) => {
          const ph = frac(a.y0 - t * a.k);           // 1 → 0 rising
          const fade = Math.sin(Math.PI * ph) * 0.55;
          const px = a.x * W + a.sway * cyc(t, 3, a.x);
          const py = (0.08 + ph * 0.98) * H;
          return (
            <div key={`a${i}`} style={{position: 'absolute', left: px, top: py, width: a.r * 2, height: a.r * 2, borderRadius: '50%', background: `rgba(225,222,215,${fade})`, filter: 'blur(0.6px)'}} />
          );
        })}

        {/* ---------- snow drifting diagonally; some settles into the cracks ---------- */}
        {FLAKES.map((f, i) => {
          const raw = frac(f.y0 + t * f.k);          // 0 → 1 falling
          const settled = f.settles && raw > f.land;
          const ph = settled ? f.land : raw;
          const fall = Math.sin(Math.PI * raw) ;
          const settleFade = settled ? Math.max(0, 1 - (raw - f.land) / (1 - f.land)) : 1;
          const px = (f.x + ph * f.drift) * W + 4 * cyc(t, 5, f.x);
          const py = ph * 1.08 * H - 0.04 * H;
          const a = 0.85 * fall * settleFade;
          return (
            <div key={`s${i}`} style={{position: 'absolute', left: px, top: py, width: f.r * 2, height: f.r * 2, borderRadius: '50%', background: `rgba(245,248,255,${a})`, filter: `blur(${settled ? 0.8 : 0.5}px)`}} />
          );
        })}

        {/* ---------- mist drifting right → left in front of the stone ---------- */}
        <AbsoluteFill style={{opacity: 0.55, mixBlendMode: 'screen'}}>
          <Img src={staticFile('plates/shiv-mist.png')} style={{position: 'absolute', top: 0, left: -mistX, width: W, height: H}} />
          <Img src={staticFile('plates/shiv-mist.png')} style={{position: 'absolute', top: 0, left: W - mistX, width: W, height: H}} />
        </AbsoluteFill>

        {/* ---------- clear zone: middle third calmer and darker ---------- */}
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(4,6,12,0.34) 42%, rgba(4,6,12,0.34) 58%, rgba(0,0,0,0) 70%)'}} />

        {/* ---------- edge falloff ---------- */}
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 100% at 50% 50%, rgba(0,0,0,0) 50%, rgba(3,5,10,0.55) 85%, rgba(2,3,8,0.85) 100%)'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
