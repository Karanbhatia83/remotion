import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {breath, cyc, flicker, frac, hump, lerp, rng, smooth} from './loop';

// Mural 1 — living handmade paper under "Ram Ram" chanting.
// The plate is a vertically seamless tile; it scrolls exactly one tile height
// per loop. Lamps, breath, dust, shimmer and the hand shadow are separate
// layers that do not scroll, as they would be in a real room.

const W = 1920;
const H = 1080;
const TILE_H = 1080;      // plates/ramnaam-tile.png is 1920 x 1080 and seamless top↔bottom
const OVERSCAN = 1.03;    // headroom for the 1% camera push

type Fleck = {x: number; y0: number; r: number; k: number; sway: number; gold: boolean; lamp: 0 | 1};

const makeFlecks = (n: number, seed: number): Fleck[] => {
  const r = rng(seed);
  return Array.from({length: n}, () => {
    const lamp = r() < 0.5 ? 0 : 1;
    return {
      x: r(),
      y0: r(),
      r: 1.2 + r() * 2.6,
      k: r() < 0.72 ? 1 : 2,          // integer cycles per loop → seamless
      sway: 6 + r() * 14,
      gold: r() < 0.3,
      lamp,
    };
  });
};
const FLECKS = makeFlecks(150, 1108);

// Lamp positions (just out of frame) and the pools they throw.
const LAMPS = [
  {cx: -0.06, cy: -0.10, rx: 0.66, ry: 0.86, seed: 1},   // top-left
  {cx: 1.06, cy: 1.10, rx: 0.66, ry: 0.86, seed: 2},     // bottom-right
] as const;

export const RamNaam: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = frame / durationInFrames;

  // --- camera: 1% push-in and return, once per loop
  const cam = 1 + 0.01 * hump(t, 1);

  // --- scroll: one exact tile per loop
  const scrollY = -frac(t) * TILE_H;

  // --- golden breath: swells at 0s and 5s
  const breathAmt = breath(t, 2);

  // --- lamp flicker (each lamp its own rhythm)
  const lampGain = LAMPS.map((l) => 0.86 + 0.14 * (0.5 + 0.5 * flicker(t, l.seed)));
  const lampJit = LAMPS.map((l) => ({
    dx: 6 * cyc(t, 13, l.seed * 0.3) + 3 * cyc(t, 29, l.seed * 0.6),
    dy: 5 * cyc(t, 17, l.seed * 0.5) + 3 * cyc(t, 31, l.seed * 0.8),
  }));

  // --- hand shadow: one pass along the bottom edge per loop, fully gone at wrap
  const hs = smooth((t - 0.52) / 0.36);              // 0..1 across its window
  const handX = lerp(-0.25, 1.2, hs) * W;
  const handA = Math.sin(Math.PI * smooth((t - 0.52) / 0.36)) * 0.42;
  const handOn = t > 0.52 && t < 0.88;

  // --- heat shimmer: static turbulence, displacement amount pulses periodically
  const shimmer = 3.5 + 2.5 * cyc(t, 9) + 1.5 * cyc(t, 19, 0.3);

  return (
    <AbsoluteFill style={{background: '#1a0f06', overflow: 'hidden'}}>
      <AbsoluteFill style={{scale: String(cam), transformOrigin: '50% 50%'}}>
        {/* ---------- scrolling paper (two copies to cover the wrap) ---------- */}
        {/* overscan scale on the parent, scroll on the child: the translate then
            happens inside the scaled space, so one TILE_H of scroll is exactly
            one on-screen tile period and the wrap is pixel-exact. */}
        <AbsoluteFill style={{scale: String(OVERSCAN), transformOrigin: '50% 50%'}}>
          <AbsoluteFill style={{translate: `0px ${scrollY}px`}}>
            <Img src={staticFile('plates/ramnaam-tile.png')} style={{position: 'absolute', left: 0, top: 0, width: W, height: TILE_H}} />
            <Img src={staticFile('plates/ramnaam-tile.png')} style={{position: 'absolute', left: 0, top: TILE_H, width: W, height: TILE_H}} />
            <Img src={staticFile('plates/ramnaam-tile.png')} style={{position: 'absolute', left: 0, top: -TILE_H, width: W, height: TILE_H}} />
          </AbsoluteFill>
        </AbsoluteFill>

        {/* ---------- base darkening so lamp pools read as the only light ---------- */}
        <AbsoluteFill style={{background: 'rgba(28,14,4,0.66)', mixBlendMode: 'multiply'}} />

        {/* ---------- lamp pools (screen) ---------- */}
        {LAMPS.map((l, i) => (
          <AbsoluteFill
            key={i}
            style={{
              mixBlendMode: 'screen',
              opacity: lampGain[i],
              background: `radial-gradient(ellipse ${l.rx * 100}% ${l.ry * 100}% at ${l.cx * 100 + lampJit[i].dx / 19.2}% ${l.cy * 100 + lampJit[i].dy / 10.8}%,
                rgba(255,196,110,0.95) 0%, rgba(230,140,55,0.62) 22%, rgba(140,70,20,0.28) 48%, rgba(0,0,0,0) 72%)`,
            }}
          />
        ))}

        {/* ---------- golden breath: whole surface inhales ---------- */}
        <AbsoluteFill
          style={{
            mixBlendMode: 'soft-light',
            opacity: 0.18 + 0.5 * breathAmt,
            background: 'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(255,205,120,1) 0%, rgba(255,170,80,0.7) 45%, rgba(120,70,20,0) 85%)',
          }}
        />

        {/* ---------- heat shimmer above each lamp (static noise, pulsing displacement) ---------- */}
        <svg width={0} height={0} style={{position: 'absolute'}}>
          <filter id="heat" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves={2} seed={7} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={shimmer} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
        {LAMPS.map((l, i) => (
          <div
            key={`sh${i}`}
            style={{
              position: 'absolute',
              left: (l.cx - 0.28) * W,
              top: (l.cy - 0.26) * H,
              width: 0.56 * W,
              height: 0.52 * H,
              filter: 'url(#heat)',
              background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,210,140,0.16) 0%, rgba(255,180,90,0.08) 40%, rgba(0,0,0,0) 70%)`,
              mixBlendMode: 'screen',
              opacity: 0.9,
            }}
          />
        ))}

        {/* ---------- dust and gold flecks rising in the lamp beams ---------- */}
        {FLECKS.map((f, i) => {
          const lamp = LAMPS[f.lamp];
          const ph = frac(f.y0 - t * f.k);                 // 1 → 0 as it rises
          const fade = Math.sin(Math.PI * ph);             // 0 at both ends of its cycle
          // place inside the lamp's pool; rise toward the lamp
          const px = (lamp.cx + (f.x - 0.5) * 1.1) * W + f.sway * cyc(t, f.k * 3, f.x);
          const py = (lamp.cy + (f.lamp === 0 ? 1 : -1) * (ph * 0.95)) * H;
          const near = 1 - ph;                              // closer to lens later in life for a few
          const toLens = i % 9 === 0;
          const r = f.r * (toLens ? 1 + 2.6 * near : 1);
          const blur = toLens ? 1.5 + 5 * near : 0.4;
          const col = f.gold ? '255,214,120' : '255,236,200';
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: px - r,
                top: py - r,
                width: r * 2,
                height: r * 2,
                borderRadius: '50%',
                background: `rgba(${col},${(f.gold ? 0.9 : 0.55) * fade * lampGain[f.lamp]})`,
                boxShadow: f.gold ? `0 0 ${r * 3}px rgba(255,200,90,${0.5 * fade})` : 'none',
                filter: `blur(${blur}px)`,
              }}
            />
          );
        })}

        {/* ---------- the writer's hand: shadow only, bottom edge ---------- */}
        {handOn && (
          <div
            style={{
              position: 'absolute',
              left: handX - 420,
              top: H - 230,
              width: 840,
              height: 560,
              borderRadius: '45% 55% 50% 50%',
              background: 'rgba(20,8,0,1)',
              opacity: handA,
              filter: 'blur(42px)',
              rotate: '-18deg',
            }}
          />
        )}

        {/* ---------- edges fall to darkness ---------- */}
        <AbsoluteFill
          style={{
            background:
              'radial-gradient(ellipse 85% 95% at 50% 50%, rgba(0,0,0,0) 40%, rgba(10,4,0,0.62) 78%, rgba(8,3,0,0.92) 100%)',
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
