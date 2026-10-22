import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {breath, cyc, frac, hump, lerp, rng, smooth} from './loop';

// Mural 3 — Nathdwara Pichwai cloth under "Radhey Radhey" / "Hare Krishna".
// Plate is static (with a periodic cloth sway). Fish, two lotuses and the
// kadamba blossoms are keyed sprites; glints, fireflies and gold specks are
// procedural. The central third of the cloth is left untouched.

const W = 1920;
const H = 1080;

const r0 = rng(3301);
const FIREFLIES = Array.from({length: 26}, () => ({
  x: 0.08 + r0() * 0.84, y: 0.30 + r0() * 0.40,
  k1: r0() < 0.5 ? 1 : 2, k2: r0() < 0.5 ? 1 : 2, k3: r0() < 0.5 ? 1 : 2,
  p1: r0(), p2: r0(), p3: r0(), r: 2 + r0() * 2.2,
}));
const r1 = rng(3302);
const SPECKS = Array.from({length: 70}, () => ({x: r1(), y0: r1(), k: r1() < 0.6 ? 1 : 2, r: 1.2 + r1() * 1.8, sway: 4 + r1() * 8}));
const r2 = rng(3303);
const BLOSSOMS = Array.from({length: 8}, (_, i) => {
  const left = i % 2 === 0;
  return {
    x0: left ? 0.05 + r2() * 0.33 : 0.62 + r2() * 0.33,
    y0: 0.20 + r2() * 0.10,
    phase: i / 8 + r2() * 0.06,          // one by one
    spin: (r2() < 0.5 ? -1 : 1) * (0.6 + r2() * 0.6),
    sway: 18 + r2() * 26,
    size: 42 + r2() * 14,
  };
});
const FISH = [
  {x0: 0.27, x1: 0.40, y: 0.905, phase: 0.00, size: 74},
  {x0: 0.49, x1: 0.60, y: 0.912, phase: 0.37, size: 66},
  {x0: 0.64, x1: 0.76, y: 0.900, phase: 0.71, size: 70},
];
const LOTUS = [
  {x: 0.37, y: 0.838, h: 86, phase: 0.0},
  {x: 0.63, y: 0.842, h: 80, phase: 0.5},
];

export const Pichwai: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = frame / durationInFrames;

  const cam = 1.02 * (1 + 0.03 * hump(t, 1));              // 2% overscan + 3% push-in and return, applied to every layer
  const swayX = 7 * cyc(t, 1) + 3 * cyc(t, 2, 0.3);        // cloth in a breeze (displacement offset)
  const swayY = 5 * cyc(t, 2, 0.6);
  const sheenX = frac(t) * W;                               // fabric sheen, one period per loop
  const glintX = lerp(-0.35, 1.35, t);                      // gold glint wave L → R
  const glintFade = Math.sin(Math.PI * t);
  const candle = 0.80 + 0.20 * (0.5 + 0.5 * (cyc(t, 7) * 0.5 + cyc(t, 13, 0.3) * 0.3 + cyc(t, 29, 0.7) * 0.2));

  return (
    <AbsoluteFill style={{background: '#0d1a3a', overflow: 'hidden'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id="cloth" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.009" numOctaves={2} seed={3} result="n" />
          <feOffset in="n" dx={swayX} dy={swayY} result="n2" />
          <feDisplacementMap in="SourceGraphic" in2="n2" scale={9} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <AbsoluteFill style={{scale: String(cam), transformOrigin: '50% 50%'}}>
        {/* ---------- the cloth, gently rippling ---------- */}
        <AbsoluteFill style={{filter: 'url(#cloth)'}}>
          <Img src={staticFile('plates/pichwai-plate.png')} style={{position: 'absolute', inset: 0, width: W, height: H}} />
        </AbsoluteFill>

        {/* ---------- candlelight on the whole cloth (very gentle) ---------- */}
        <AbsoluteFill style={{mixBlendMode: 'multiply', background: `rgba(255,236,200,${1 - 0.10 * (1 - candle)})`, opacity: 1}} />

        {/* ---------- fabric sheen sweeping across ---------- */}
        <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.55, overflow: 'hidden'}}>
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute', top: -200, height: H + 400, width: W, left: i * W - sheenX,
                background: 'linear-gradient(100deg, rgba(0,0,0,0) 30%, rgba(190,205,255,0.10) 45%, rgba(220,230,255,0.16) 50%, rgba(190,205,255,0.10) 55%, rgba(0,0,0,0) 70%)',
              }}
            />
          ))}
        </AbsoluteFill>

        {/* ---------- gold leaf catching the candlelight: a slow wave, masked to the gold ---------- */}
        <AbsoluteFill
          style={{
            mixBlendMode: 'screen',
            opacity: 0.95 * glintFade * candle,
            WebkitMaskImage: `url(${staticFile('plates/pichwai-gold.png')})`, maskImage: `url(${staticFile('plates/pichwai-gold.png')})`,
            WebkitMaskSize: '100% 100%', maskSize: '100% 100%',
            background: `linear-gradient(105deg, rgba(0,0,0,0) ${(glintX - 0.16) * 100}%, rgba(255,226,150,0.85) ${(glintX - 0.03) * 100}%, rgba(255,246,210,1) ${glintX * 100}%, rgba(255,226,150,0.85) ${(glintX + 0.03) * 100}%, rgba(0,0,0,0) ${(glintX + 0.16) * 100}%)`,
          }}
        />
        {/* steady warm lift on the gold so it always reads as metal */}
        <AbsoluteFill
          style={{
            mixBlendMode: 'screen', opacity: 0.28 * candle,
            WebkitMaskImage: `url(${staticFile('plates/pichwai-gold.png')})`, maskImage: `url(${staticFile('plates/pichwai-gold.png')})`,
            WebkitMaskSize: '100% 100%', maskSize: '100% 100%',
            background: 'rgba(255,200,110,1)',
          }}
        />

        {/* ---------- peacock tails shimmer blue-green ---------- */}
        {[{cx: 0.105, ph: 0}, {cx: 0.895, ph: 0.5}].map((p, i) => (
          <div
            key={`pk${i}`}
            style={{
              position: 'absolute', left: (p.cx - 0.09) * W, top: 0.64 * H, width: 0.18 * W, height: 0.30 * H,
              mixBlendMode: 'screen', opacity: 0.22 + 0.30 * breath(t, 1) * (i === 0 ? 1 : 1),
              background: `radial-gradient(ellipse 50% 50% at ${50 + 22 * cyc(t, 1, p.ph)}% ${50 + 14 * cyc(t, 2, p.ph + 0.2)}%, rgba(90,230,200,0.75) 0%, rgba(40,160,180,0.35) 40%, rgba(0,0,0,0) 70%)`,
            }}
          />
        ))}

        {/* ---------- the pond: lotuses sway, two of them open and close ---------- */}
        {LOTUS.map((l, i) => {
          const open = 0.78 + 0.22 * breath(t, 1 + 0) ;      // closed-ish → open → closed over the loop
          const o = i === 0 ? open : 0.78 + 0.22 * (1 - breath(t, 1));
          const h = l.h;
          const w = h * (273 / 294);
          return (
            <Img
              key={`lo${i}`}
              src={staticFile('plates/pichwai-lotus.png')}
              style={{
                position: 'absolute', left: l.x * W - w / 2, top: l.y * H - h, width: w, height: h,
                transformOrigin: '50% 100%',
                scale: `${0.92 + 0.14 * o} ${0.80 + 0.26 * o}`,
                rotate: `${2.2 * cyc(t, 1, l.phase)}deg`,
              }}
            />
          );
        })}

        {/* ---------- fish gliding between the lily pads, with ripples ---------- */}
        {FISH.map((f, i) => {
          const s = Math.sin(2 * Math.PI * (t + f.phase));
          const v = Math.cos(2 * Math.PI * (t + f.phase));             // velocity sign
          const x = lerp(f.x0, f.x1, 0.5 + 0.5 * s) * W;
          const y = f.y * H + 3 * cyc(t, 3, f.phase);
          const wR = smooth(0.5 + v * 2.5);                               // crossfade at the turn
          const h = f.size * (188 / 296);
          const common = {position: 'absolute' as const, left: x - f.size / 2, top: y - h / 2, width: f.size, height: h};
          return (
            <React.Fragment key={`f${i}`}>
              <Img src={staticFile('plates/pichwai-fishR.png')} style={{...common, opacity: wR}} />
              <Img src={staticFile('plates/pichwai-fishL.png')} style={{...common, opacity: 1 - wR}} />
              {[0, 1].map((k) => {
                const ph = frac(t * 2 + k * 0.5 + f.phase);
                const rr = 10 + 70 * ph;
                return (
                  <div key={k} style={{position: 'absolute', left: x - rr, top: y - rr * 0.32, width: rr * 2, height: rr * 0.64, borderRadius: '50%', border: `1.5px solid rgba(190,215,255,${0.45 * (1 - ph)})`}} />
                );
              })}
            </React.Fragment>
          );
        })}

        {/* ---------- kadamba blossoms drop one by one and dissolve before the pond ---------- */}
        {BLOSSOMS.map((b, i) => {
          const ph = frac(t + b.phase);                                   // 0 → 1 over its fall
          const y = lerp(b.y0, 0.74, smooth(ph)) * H;
          const x = b.x0 * W + b.sway * cyc(t, 1, b.phase) + b.sway * 0.5 * cyc(t, 2, b.phase + 0.3);
          const a = Math.sin(Math.PI * ph) * (ph < 0.8 ? 1 : (1 - ph) / 0.2);
          const sz = b.size;
          return (
            <Img
              key={`b${i}`} src={staticFile('plates/pichwai-blossom.png')}
              style={{position: 'absolute', left: x - sz / 2, top: y - sz / 2, width: sz, height: sz * (252 / 216), opacity: Math.max(0, a), rotate: `${360 * b.spin * ph}deg`}}
            />
          );
        })}

        {/* ---------- fireflies on the indigo ground ---------- */}
        {FIREFLIES.map((f, i) => {
          const x = (f.x + 0.03 * cyc(t, f.k1, f.p1)) * W;
          const y = (f.y + 0.02 * cyc(t, f.k2, f.p2)) * H;
          const a = 0.15 + 0.85 * (0.5 + 0.5 * cyc(t, f.k3, f.p3));
          return (
            <div key={`ff${i}`} style={{position: 'absolute', left: x - f.r, top: y - f.r, width: f.r * 2, height: f.r * 2, borderRadius: '50%', background: `rgba(255,235,150,${0.9 * a})`, boxShadow: `0 0 ${8 + 10 * a}px rgba(255,220,120,${0.7 * a})`}} />
          );
        })}

        {/* ---------- a slow rain of gold specks from the top border ---------- */}
        {SPECKS.map((s, i) => {
          const ph = frac(s.y0 + t * s.k);
          const y = lerp(0.02, 0.60, ph) * H;
          const x = s.x * W + s.sway * cyc(t, s.k * 2, s.x);
          const a = Math.sin(Math.PI * ph) * 0.85;
          return <div key={`g${i}`} style={{position: 'absolute', left: x, top: y, width: s.r * 2, height: s.r * 2, borderRadius: '50%', background: `rgba(255,210,110,${a})`, boxShadow: `0 0 ${s.r * 3}px rgba(255,200,90,${0.5 * a})`}} />;
        })}

        {/* ---------- edges ---------- */}
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 95% 100% at 50% 50%, rgba(0,0,0,0) 55%, rgba(5,8,20,0.35) 85%, rgba(4,6,16,0.6) 100%)'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
