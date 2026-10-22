import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {breath, cyc, frac, hump, lerp, rng, smooth} from './loop';
import sun from './data/kashi-sun.json';

// Mural 4 — Madhubani Varanasi, 15 s. Boats, birds, fish and diyas are keyed
// sprites on periodic paths; sun rays are a rotating conic overlay; the paper
// "breathes" through a small periodic displacement; ripples are an x-periodic
// overlay that scrolls exactly one period per loop.

const W = 1920;
const H = 1080;
const RAYS = 24;
const SUN_R = 0.165;   // painted ray reach as a fraction of W (detector only finds the inner disc)

const BOATS = [
  {y: 0.755, size: 200, phase: 0.05, sprite: 'kashi-boat1', ar: 191 / 402},
  {y: 0.845, size: 250, phase: 0.48, sprite: 'kashi-boat2', ar: 222 / 398},
  {y: 0.935, size: 300, phase: 0.80, sprite: 'kashi-boat1', ar: 191 / 402},
];
const r0 = rng(4401);
const FISHES = Array.from({length: 4}, (_, i) => ({
  x0: 0.12 + i * 0.22 + r0() * 0.08, y0: 0.70 + r0() * 0.22, ax: 0.06 + r0() * 0.05, ay: 0.02, k1: 1, k2: 2, p: r0(), q: r0(), size: 70 + r0() * 30,
}));
const DIYAS = Array.from({length: 5}, (_, i) => ({phase: i / 5 + r0() * 0.05, y: 0.66 + r0() * 0.3, size: 40 + r0() * 14, bob: r0()}));
const FLOCKS = [
  {phase: 0.00, y: 0.075, n: 5, spread: 0.055},
  {phase: 0.52, y: 0.14, n: 3, spread: 0.05},
];

export const Kashi: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = frame / durationInFrames;

  const cam = 1.015 * (1 + 0.02 * hump(t, 1));
  const breatheX = 5 * cyc(t, 1) + 2 * cyc(t, 3, 0.4);
  const breatheY = 4 * cyc(t, 2, 0.2);
  const rayRot = (360 / RAYS) * frac(t);            // exactly one ray period per loop
  const sunPulse = 0.30 + 0.30 * breath(t, 3);      // every 5 s
  const inkX = lerp(-0.35, 1.35, t);
  const ripX = frac(t) * W;

  return (
    <AbsoluteFill style={{background: '#2a1d0f', overflow: 'hidden'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id="paper" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves={2} seed={5} result="n" />
          <feOffset in="n" dx={breatheX} dy={breatheY} result="n2" />
          <feDisplacementMap in="SourceGraphic" in2="n2" scale={5} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <AbsoluteFill style={{scale: String(cam), transformOrigin: '50% 50%'}}>
        {/* ---------- the painting, breathing ---------- */}
        <AbsoluteFill style={{filter: 'url(#paper)'}}>
          <Img src={staticFile('plates/kashi-plate.png')} style={{position: 'absolute', inset: 0, width: W, height: H}} />
        </AbsoluteFill>

        {/* ---------- wet-ink glisten on the black outlines ---------- */}
        <AbsoluteFill
          style={{
            mixBlendMode: 'screen', opacity: 0.55,
            WebkitMaskImage: `url(${staticFile('plates/kashi-ink.png')})`, maskImage: `url(${staticFile('plates/kashi-ink.png')})`,
            WebkitMaskSize: '100% 100%', maskSize: '100% 100%',
            background: `linear-gradient(100deg, rgba(0,0,0,0) ${(inkX - 0.14) * 100}%, rgba(200,190,170,0.9) ${inkX * 100}%, rgba(0,0,0,0) ${(inkX + 0.14) * 100}%)`,
          }}
        />

        {/* ---------- sun: rays turn like a wheel, glow pulses ---------- */}
        <div
          style={{
            position: 'absolute', left: (sun.cx - SUN_R) * W, top: sun.cy * H - SUN_R * W, width: SUN_R * 2 * W, height: SUN_R * 2 * W,
            borderRadius: '50%', mixBlendMode: 'screen', opacity: 0.32,
            background: `repeating-conic-gradient(from ${rayRot}deg at 50% 50%, rgba(255,210,120,0.9) 0deg, rgba(255,210,120,0.9) 3deg, rgba(0,0,0,0) 7deg, rgba(0,0,0,0) ${360 / RAYS}deg)`,
            WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,0) 24%, rgba(0,0,0,1) 34%, rgba(0,0,0,1) 72%, rgba(0,0,0,0) 100%)',
            maskImage: 'radial-gradient(circle, rgba(0,0,0,0) 24%, rgba(0,0,0,1) 34%, rgba(0,0,0,1) 72%, rgba(0,0,0,0) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute', left: (sun.cx - SUN_R * 1.2) * W, top: sun.cy * H - SUN_R * 1.2 * W, width: SUN_R * 2.4 * W, height: SUN_R * 2.4 * W,
            borderRadius: '50%', mixBlendMode: 'screen', opacity: sunPulse,
            background: 'radial-gradient(circle, rgba(255,200,100,0.9) 0%, rgba(255,160,60,0.45) 30%, rgba(0,0,0,0) 65%)',
          }}
        />

        {/* ---------- ripples running along the river ---------- */}
        <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.55}}>
          <Img src={staticFile('plates/kashi-ripples.png')} style={{position: 'absolute', top: 0, left: -ripX, width: W, height: H}} />
          <Img src={staticFile('plates/kashi-ripples.png')} style={{position: 'absolute', top: 0, left: W - ripX, width: W, height: H}} />
        </AbsoluteFill>

        {/* ---------- fish in slow loops beneath the boats ---------- */}
        {FISHES.map((f, i) => {
          const x = (f.x0 + f.ax * Math.sin(2 * Math.PI * (f.k1 * t + f.p))) * W;
          const y = (f.y0 + f.ay * Math.sin(2 * Math.PI * (f.k2 * t + f.q))) * H;
          const v = Math.cos(2 * Math.PI * (f.k1 * t + f.p));             // +ve → moving right
          const wR = smooth(0.5 + v * 2.5);
          const h = f.size * (229 / 401);
          const base = {position: 'absolute' as const, left: x - f.size / 2, top: y - h / 2, width: f.size, height: h};
          return (
            <React.Fragment key={`fi${i}`}>
              {/* sprite faces left; mirror it to swim right */}
              <Img src={staticFile('plates/kashi-fish.png')} style={{...base, opacity: wR, scale: '-1 1'}} />
              <Img src={staticFile('plates/kashi-fish.png')} style={{...base, opacity: 1 - wR}} />
            </React.Fragment>
          );
        })}

        {/* ---------- diyas drifting on the water ---------- */}
        {DIYAS.map((d, i) => {
          const x = lerp(-0.06, 1.06, frac(t + d.phase)) * W;
          const y = d.y * H + 3 * cyc(t, 4, d.bob);
          const h = d.size * (293 / 272);
          const fl = 0.6 + 0.4 * (0.5 + 0.5 * (cyc(t, 11, d.bob) * 0.6 + cyc(t, 23, d.bob * 2) * 0.4));
          return (
            <React.Fragment key={`d${i}`}>
              <div style={{position: 'absolute', left: x - d.size, top: y - h * 0.9, width: d.size * 2, height: d.size * 1.3, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,190,90,${0.55 * fl}) 0%, rgba(255,140,50,${0.25 * fl}) 40%, rgba(0,0,0,0) 70%)`, mixBlendMode: 'screen'}} />
              <Img src={staticFile('plates/kashi-diya.png')} style={{position: 'absolute', left: x - d.size / 2, top: y - h / 2, width: d.size, height: h, rotate: `${2 * cyc(t, 4, d.bob)}deg`}} />
            </React.Fragment>
          );
        })}

        {/* ---------- boats glide left → right, oars dipping ---------- */}
        {BOATS.map((b, i) => {
          const x = lerp(-0.2, 1.2, frac(t + b.phase)) * W;
          const y = b.y * H + 4 * cyc(t, 5, b.phase);
          const h = b.size * b.ar;
          return (
            <Img key={`b${i}`} src={staticFile(`plates/${b.sprite}.png`)} style={{position: 'absolute', left: x - b.size / 2, top: y - h, width: b.size, height: h, rotate: `${2 * cyc(t, 5, b.phase + 0.25)}deg`, transformOrigin: '50% 100%'}} />
          );
        })}

        {/* ---------- birds flap in slow unison and cross the sky ---------- */}
        {FLOCKS.map((fl, fi) => {
          const lead = lerp(-0.18, 1.18, frac(t + fl.phase));
          return Array.from({length: fl.n}, (_, i) => {
            const row = Math.ceil(i / 2) * (i % 2 === 0 ? 1 : -1);          // V formation
            const back = Math.ceil(i / 2);
            const x = (lead - back * fl.spread) * W;
            const y = (fl.y + Math.abs(row) * 0.028 + 0.012 * cyc(t, 2, fl.phase + i * 0.1)) * H;
            const up = smooth(0.5 + 1.6 * Math.sin(2 * Math.PI * (7 * t + 0.05 * i)));   // slow unison flap, crisp poses
            const sz = 66 - back * 6;
            const hU = sz * (330 / 358), hD = sz * (291 / 368);
            return (
              <React.Fragment key={`bk${fi}-${i}`}>
                <Img src={staticFile('plates/kashi-birdUp.png')} style={{position: 'absolute', left: x, top: y - hU / 2, width: sz, height: hU, opacity: up}} />
                <Img src={staticFile('plates/kashi-birdDown.png')} style={{position: 'absolute', left: x, top: y - hD / 2, width: sz, height: hD, opacity: 1 - up}} />
              </React.Fragment>
            );
          });
        })}

        {/* ---------- warm lamp-light grade and edges ---------- */}
        <AbsoluteFill style={{background: 'rgba(255,225,180,0.10)', mixBlendMode: 'multiply'}} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 95% 100% at 50% 50%, rgba(0,0,0,0) 55%, rgba(30,18,8,0.30) 85%, rgba(20,12,5,0.55) 100%)'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
