import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {cyc, frac, hump, lerp, rng, smooth} from './loop';
import geom from './data/mandala-geom.json';
import gems from './data/mandala-gems.json';

// Mural 5 — golden mandala under the opening Om.
// The plate is split into concentric annuli with radial masks; each annulus
// rotates by exactly 18° per loop. The plate is 20-fold symmetric (40-fold on
// the outer rings), so 18° lands exactly on-pattern and the wrap is invisible.

const W = 1920;
const H = 1080;
const CX = geom.cx * W;
const CY = geom.cy * H;
const STEP = 18;                       // 360 / 20
const ANGLE0 = 0.41;                   // never sit at exactly 0°: keeps every frame resampled the same way
const SCALE0 = 1.0015;
const RINGS = [
  {r0: 164, r1: 420, dir: -1, breathe: 0.0},   // inner lotus petals + beads
  {r0: 420, r1: 498, dir: +1, breathe: -1},
  {r0: 498, r1: 748, dir: -1, breathe: 0.5},   // outer petals
  {r0: 748, r1: 900, dir: +1, breathe: -1},    // outermost rings; feathered out before the corners (see ringMask)
];

const r0 = rng(5501);
const DUST = Array.from({length: 90}, () => ({th: r0() * Math.PI * 2, p: r0(), k: r0() < 0.6 ? 1 : 2, r: 1.4 + r0() * 1.8}));

// the rotated plate cannot cover the frame corners, so the outermost ring fades
// to the static base over a wide feather instead of a hard edge
const ringMask = (r0: number, r1: number) =>
  r1 >= 900
    ? `radial-gradient(circle at ${CX}px ${CY}px, rgba(0,0,0,0) ${r0 - 2}px, rgba(0,0,0,1) ${r0 + 2}px, rgba(0,0,0,1) ${r1}px, rgba(0,0,0,0) ${r1 + 140}px)`
    : `radial-gradient(circle at ${CX}px ${CY}px, rgba(0,0,0,0) ${r0 - 2}px, rgba(0,0,0,1) ${r0 + 2}px, rgba(0,0,0,1) ${r1 - 2}px, rgba(0,0,0,0) ${r1 + 2}px)`;

export const Mandala: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = frame / durationInFrames;

  const cam = 1.02 * (1 + 0.02 * hump(t, 1));
  const ph = frac(2 * t);                                   // pulse every 5 s
  const R = lerp(200, 1150, ph);
  const pulseA = 0.6 * Math.pow(1 - ph, 1.3) * smooth(ph / 0.08);
  const nebX = frac(t) * W;

  return (
    <AbsoluteFill style={{background: '#070916', overflow: 'hidden'}}>
      <AbsoluteFill style={{scale: String(cam), transformOrigin: `${CX}px ${CY}px`}}>
        {/* ---------- base plate (the calm centre disc comes from here) ---------- */}
        <Img src={staticFile('plates/mandala-plate.png')} style={{position: 'absolute', inset: 0, width: W, height: H}} />

        {/* ---------- nebula drifting in the indigo, masked off the gold ---------- */}
        <AbsoluteFill
          style={{
            mixBlendMode: 'screen', opacity: 0.42,
            WebkitMaskImage: `url(${staticFile('plates/mandala-dark.png')})`, maskImage: `url(${staticFile('plates/mandala-dark.png')})`,
            WebkitMaskSize: '100% 100%', maskSize: '100% 100%',
          }}
        >
          <Img src={staticFile('plates/mandala-nebula.png')} style={{position: 'absolute', top: 0, left: -nebX, width: W, height: H}} />
          <Img src={staticFile('plates/mandala-nebula.png')} style={{position: 'absolute', top: 0, left: W - nebX, width: W, height: H}} />
        </AbsoluteFill>

        {/* ---------- the rings: alternating rotation, two of them breathing ----------
            Each ring is drawn twice: copy A at angle a(t), copy B one full pattern
            period behind it (a(t) - 18°). They show the same pattern but a raster
            rotated by its period does not reproduce the same pixels, so we crossfade
            A → B across the loop. At the end B sits exactly where A starts, and the
            wrap is an ordinary 0.075° step with correlated resampling. */}
        {RINGS.map((rg, i) => {
          const br = rg.breathe < 0 ? 0 : 0.022 * hump(t + rg.breathe, 1);
          const aA = rg.dir * (STEP * t + ANGLE0);
          const aB = aA - rg.dir * STEP;
          const wB = t;                                   // 0 at start → 1 at end
          return (
            <React.Fragment key={i}>
              {[{a: aA, o: 1 - wB}, {a: aB, o: wB}].map((c, j) => (
                <AbsoluteFill
                  key={j}
                  style={{
                    WebkitMaskImage: ringMask(rg.r0, rg.r1), maskImage: ringMask(rg.r0, rg.r1),
                    transformOrigin: `${CX}px ${CY}px`,
                    rotate: `${c.a}deg`,
                    scale: String(SCALE0 + br),
                    opacity: c.o,
                  }}
                >
                  <Img src={staticFile('plates/mandala-plate.png')} style={{position: 'absolute', inset: 0, width: W, height: H}} />
                </AbsoluteFill>
              ))}
            </React.Fragment>
          );
        })}

        {/* ---------- fixed studio light: the object turns, the light does not ---------- */}
        <AbsoluteFill style={{mixBlendMode: 'soft-light', background: 'linear-gradient(125deg, rgba(255,230,190,0.55) 0%, rgba(0,0,0,0) 45%, rgba(10,8,30,0.55) 100%)'}} />

        {/* ---------- the pulse: a ring of light travelling outward ---------- */}
        <AbsoluteFill
          style={{
            mixBlendMode: 'screen', opacity: pulseA,
            background: `radial-gradient(circle at ${CX}px ${CY}px, rgba(0,0,0,0) ${R - 90}px, rgba(255,226,160,0.9) ${R}px, rgba(0,0,0,0) ${R + 90}px)`,
          }}
        />

        {/* ---------- gems glint as the pulse passes ---------- */}
        {(gems as Array<{x: number; y: number; k: string; rad: number}>).map((g, i) => {
          const d = Math.abs(g.rad * H - R);
          const a = Math.exp(-(d * d) / (2 * 38 * 38)) * pulseA * 1.6;
          if (a < 0.03) return null;
          const col = g.k === 'r' ? '255,225,220' : '220,235,255';
          const s = 3 + 5 * a;
          return <div key={i} style={{position: 'absolute', left: g.x * W - s / 2, top: g.y * H - s / 2, width: s, height: s, borderRadius: '50%', background: `rgba(${col},${Math.min(1, a)})`, boxShadow: `0 0 ${8 + 14 * a}px rgba(${col},${0.8 * Math.min(1, a)})`}} />;
        })}

        {/* ---------- fine gold dust drifting outward from the centre ---------- */}
        {DUST.map((d, i) => {
          const pp = frac(t * d.k + d.p);
          const rr = lerp(185, 980, pp);
          const a = Math.sin(Math.PI * pp) * 0.85;
          const x = CX + rr * Math.cos(d.th + 0.05 * cyc(t, 1, d.p));
          const y = CY + rr * Math.sin(d.th + 0.05 * cyc(t, 1, d.p));
          return <div key={`d${i}`} style={{position: 'absolute', left: x - d.r, top: y - d.r, width: d.r * 2, height: d.r * 2, borderRadius: '50%', background: `rgba(255,215,130,${a})`, boxShadow: `0 0 ${d.r * 3}px rgba(255,200,100,${0.5 * a})`}} />;
        })}

        {/* ---------- edges ---------- */}
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 95% 100% at 50% 50%, rgba(0,0,0,0) 55%, rgba(3,4,12,0.4) 85%, rgba(2,3,10,0.7) 100%)'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
