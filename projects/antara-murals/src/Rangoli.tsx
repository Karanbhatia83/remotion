import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {cyc, flicker, frac, hump, lerp, rng, smooth} from './loop';
import flames from './data/rangoli-flames.json';
import geom from './data/rangoli-geom.json';

// Mural 6 — top-down rangoli ringed with diyas.
// Diya positions were detected from the plate. Flicker, the clockwise light
// wave, powder sparkle, petals and the centre pulse are all periodic.

const W = 1920;
const H = 1080;
const CX = geom.cx * W;
const CY = geom.cy * H;
const RING = geom.r * W;

const r0 = rng(6601);
const SPARK = Array.from({length: 170}, () => {
  const rr = RING * (0.32 + 0.64 * Math.sqrt(r0()));
  const th = r0() * Math.PI * 2;
  return {x: CX + rr * Math.cos(th), y: CY + rr * Math.sin(th), k: r0() < 0.5 ? 2 : 3, p: r0(), s: 1.6 + r0() * 1.4};
});
const GRAINS = Array.from({length: 14}, () => {
  const rr = RING * (0.25 + 0.65 * r0()); const th = r0() * Math.PI * 2;
  return {x: CX + rr * Math.cos(th), y: CY + rr * Math.sin(th), p: r0()};
});
const PETALS = Array.from({length: 10}, () => ({x: 0.06 * W + r0() * 0.88 * W, y: 0.08 * H + r0() * 0.84 * H, p: r0(), rot: r0() * 360, dir: r0() < 0.5 ? -1 : 1}));
const SLIDERS = Array.from({length: 4}, (_, i) => {
  const th = (i / 4) * Math.PI * 2 + 0.4; const rr = RING * 1.35;
  return {x: CX + rr * Math.cos(th), y: CY + rr * Math.sin(th) * 0.75, p: r0(), rot: r0() * 360};
});

const angDist = (a: number, b: number) => {
  let d = Math.abs(((a - b) % 360) + 360) % 360;
  return d > 180 ? 360 - d : d;
};

const Petal: React.FC<{x: number; y: number; rot: number; scale: number; opacity: number}> = ({x, y, rot, scale, opacity}) => (
  <div
    style={{
      position: 'absolute', left: x - 14, top: y - 8.5, width: 28, height: 17, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
      background: 'radial-gradient(ellipse at 40% 40%, #ffb13a 0%, #f07f14 55%, #b9540a 100%)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.5)', rotate: `${rot}deg`, scale: String(scale), opacity,
    }}
  />
);

export const Rangoli: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = frame / durationInFrames;

  const cam = 1.06 * (1 + 0.01 * hump(t, 1));
  const camRot = 2.5 * hump(t, 1);                        // very slow turn and return
  const sweep = 360 * frac(t);                            // clockwise light wave, one lap per loop
  const ph = frac(2 * t);                                 // centre pulse every 5 s
  const R = lerp(RING * 0.22, RING * 0.96, ph);
  const pulseA = 0.42 * Math.pow(1 - ph, 1.2) * smooth(ph / 0.1);
  const discMask = `radial-gradient(circle at ${CX}px ${CY}px, rgba(0,0,0,1) ${RING - 14}px, rgba(0,0,0,0) ${RING + 6}px)`;
  // the plain centre disc stays untouched: light layers are donut-masked away from it
  const donutMask = `radial-gradient(circle at ${CX}px ${CY}px, rgba(0,0,0,0) ${RING * 0.20}px, rgba(0,0,0,1) ${RING * 0.30}px, rgba(0,0,0,1) ${RING - 14}px, rgba(0,0,0,0) ${RING + 6}px)`;

  return (
    <AbsoluteFill style={{background: '#120d09', overflow: 'hidden'}}>
      <AbsoluteFill style={{scale: String(cam), rotate: `${camRot}deg`, transformOrigin: `${CX}px ${CY}px`}}>
        <Img src={staticFile('plates/rangoli-plate.png')} style={{position: 'absolute', inset: 0, width: W, height: H}} />

        {/* ---------- light wave travelling clockwise over the powder ---------- */}
        <AbsoluteFill
          style={{
            mixBlendMode: 'screen', opacity: 0.55,
            WebkitMaskImage: donutMask, maskImage: donutMask,
            background: `conic-gradient(from ${sweep - 30}deg at ${CX}px ${CY}px, rgba(0,0,0,0) 0deg, rgba(255,214,140,0.55) 30deg, rgba(0,0,0,0) 60deg, rgba(0,0,0,0) 360deg)`,
          }}
        />

        {/* ---------- centre pulse ---------- */}
        <AbsoluteFill
          style={{
            mixBlendMode: 'screen', opacity: pulseA,
            WebkitMaskImage: donutMask, maskImage: donutMask,
            background: `radial-gradient(circle at ${CX}px ${CY}px, rgba(0,0,0,0) ${R - 70}px, rgba(255,222,160,0.9) ${R}px, rgba(0,0,0,0) ${R + 70}px)`,
          }}
        />

        {/* ---------- diyas: flicker, and brighten as the wave passes ---------- */}
        {(flames as Array<{x: number; y: number; a: number}>).map((f, i) => {
          const base = 0.68 + 0.32 * (0.5 + 0.5 * flicker(t, i * 0.37));
          const wave = Math.exp(-Math.pow(angDist(f.a, sweep) / 26, 2));
          const I = base * (0.7 + 0.9 * wave);
          const x = f.x * W, y = f.y * H;
          const dx = (x - CX) / Math.hypot(x - CX, y - CY), dy = (y - CY) / Math.hypot(x - CX, y - CY);
          return (
            <React.Fragment key={i}>
              {/* reflection on the polished stone, outward of the flame */}
              <div style={{position: 'absolute', left: x + dx * 30 - 55, top: y + dy * 30 - 32, width: 110, height: 64, borderRadius: '50%', mixBlendMode: 'screen', opacity: 0.26 * I, background: 'radial-gradient(ellipse, rgba(255,170,80,0.9) 0%, rgba(255,120,40,0.35) 45%, rgba(0,0,0,0) 72%)', filter: 'blur(6px)'}} />
              {/* the flame's glow */}
              <div style={{position: 'absolute', left: x - 30, top: y - 30, width: 60, height: 60, borderRadius: '50%', mixBlendMode: 'screen', opacity: 0.8 * I, background: 'radial-gradient(circle, rgba(255,235,190,1) 0%, rgba(255,180,90,0.7) 28%, rgba(255,120,40,0.25) 55%, rgba(0,0,0,0) 72%)'}} />
            </React.Fragment>
          );
        })}

        {/* ---------- powder grains catching the light ---------- */}
        {SPARK.map((s, i) => {
          const a = Math.pow(0.5 + 0.5 * cyc(t, s.k, s.p), 4) * 0.9;
          if (a < 0.03) return null;
          return <div key={`s${i}`} style={{position: 'absolute', left: s.x - s.s, top: s.y - s.s, width: s.s * 2, height: s.s * 2, borderRadius: '50%', background: `rgba(255,245,215,${a})`, boxShadow: `0 0 ${4 + 6 * a}px rgba(255,225,160,${0.7 * a})`}} />;
        })}
        {GRAINS.map((g, i) => {
          const lift = Math.pow(Math.max(0, Math.sin(2 * Math.PI * (t + g.p))), 2) * 12;
          return <div key={`g${i}`} style={{position: 'absolute', left: g.x - 2 + 6 * lift / 12, top: g.y - 2 - lift, width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,200,120,0.85)', boxShadow: '0 0 4px rgba(255,190,110,0.6)', opacity: 0.35 + 0.65 * (lift / 12)}} />;
        })}

        {/* ---------- marigold petals drifting down onto the floor ---------- */}
        {PETALS.map((p, i) => {
          const pp = frac(t + p.p);
          const land = smooth((pp - 0.55) / 0.12);
          const sc = 0.5 + 0.5 * smooth(pp / 0.55);
          const drift = 26 * (1 - land) * Math.sin(2 * Math.PI * (t + p.p));
          const rot = p.rot + p.dir * 160 * (1 - land) * pp;
          const op = smooth(pp / 0.06) * (1 - smooth((pp - 0.86) / 0.12));
          return <Petal key={`p${i}`} x={p.x + drift} y={p.y + 10 * (1 - land) * cyc(t, 2, p.p)} rot={rot} scale={sc} opacity={op} />;
        })}
        {SLIDERS.map((p, i) => (
          <Petal key={`sl${i}`} x={p.x + 48 * cyc(t, 1, p.p)} y={p.y + 6 * cyc(t, 2, p.p)} rot={p.rot + 14 * cyc(t, 1, p.p)} scale={1} opacity={1} />
        ))}

        {/* ---------- warm lamplight grade and edges ---------- */}
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 95% at 50% 50%, rgba(0,0,0,0) 45%, rgba(12,6,2,0.45) 80%, rgba(8,4,1,0.8) 100%)'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
