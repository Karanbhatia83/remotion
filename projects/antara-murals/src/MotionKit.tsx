import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {useFonts} from './fonts';

// Motion-vocabulary demo in the style of illustrated story reels: maroon stage, soft fades,
// a book that flips open, glowing Devanagari, a numeral count, self-drawing line icons,
// a persistent wooden board, and a gold-ringed circle reveal. All motion is code; the only
// raster inputs are a generated texture and one Kashi with Anshu photo.
export const MK_FPS = 30;
export const MK_FRAMES = 420;

const GOLD = '#F2C46D';
const CREAM = '#FFF4E4';
const LINE = '#F1D9B0';
const DEV = 'Tiro Devanagari Hindi, serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Dust: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {Array.from({length: 46}).map((_, i) => {
        const seed = Math.sin(i * 91.7) * 10000; const r = seed - Math.floor(seed);
        const x = (i * 197) % 1080; const speed = 0.4 + r * 0.9; const size = 2 + r * 4;
        const y = 1920 - ((frame * speed + i * 83) % 2100);
        const o = 0.15 + 0.35 * (0.5 + 0.5 * Math.sin(frame / (12 + r * 18) + i));
        return <div key={i} style={{position: 'absolute', left: x + 30 * Math.sin(frame / 50 + i), top: y, width: size, height: size, borderRadius: '50%', background: '#FFD9A0', opacity: o, filter: 'blur(1px)'}} />;
      })}
    </AbsoluteFill>
  );
};

const Stage: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#26060A'}}>
      <Img src={staticFile('motionkit/maroon.jpg')} style={{width: 1080, height: 1920, scale: String(1 + frame / MK_FRAMES * 0.05)}} />
      <Dust />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 260px 90px rgba(20,2,4,0.75)'}} />
    </AbsoluteFill>
  );
};

const Caption: React.FC<{text: string; from: number; to: number}> = ({text, from, to}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [from, from + 10, to - 8, to], [0, 1, 1, 0], clamp);
  const y = interpolate(frame, [from, from + 12], [14, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  return <div style={{position: 'absolute', top: 262, left: 90, right: 90, textAlign: 'center', opacity: o, translate: `0 ${y}px`, fontFamily: DEV, fontSize: 54, lineHeight: 1.3, color: CREAM, textShadow: '0 2px 12px rgba(0,0,0,0.6)'}}>{text}</div>;
};

// ---------- scene 1: the book
const Book: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 200}, durationInFrames: 20});
  const open = interpolate(frame, [40, 76], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const coverAngle = -180 * open;
  const shift = 170 * open;               // slide right so the open spread ends centred
  const fan = (k: number) => -180 * interpolate(frame, [44 + k * 4, 80 + k * 4], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const glow = interpolate(frame, [78, 104], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const bob = 6 * Math.sin(frame / 18);
  const W = 340, H = 460;
  const page = (extra: React.CSSProperties = {}) => ({position: 'absolute' as const, inset: 0, background: 'linear-gradient(90deg,#E9D9BC,#FBF2E2 30%,#F6EBD7)', borderRadius: 6, ...extra});
  const lines = (
    <div style={{position: 'absolute', inset: '60px 36px', display: 'flex', flexDirection: 'column', gap: 18}}>
      {Array.from({length: 11}).map((_, i) => <div key={i} style={{height: 3, background: 'rgba(120,90,50,0.22)', width: `${80 + ((i * 37) % 20)}%`}} />)}
    </div>
  );
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      {/* label + glowing word rising from the spread */}
      <div style={{position: 'absolute', top: 640, width: '100%', textAlign: 'center', opacity: glow}}>
        <div style={{fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 30, letterSpacing: '0.18em', color: LINE}}>ASHTANGA HRIDAYAM · 2.1</div>
      </div>
      <div style={{position: 'absolute', top: 720 + 60 * (1 - glow), width: '100%', textAlign: 'center', opacity: glow, filter: `blur(${10 * (1 - glow)}px)`,
        fontFamily: DEV, fontSize: 104, color: GOLD, textShadow: '0 0 24px rgba(242,196,109,0.85), 0 0 60px rgba(242,140,40,0.55)'}}>ब्रह्म मुहूर्त</div>

      <div style={{position: 'absolute', top: 960, left: 540 - W / 2, width: W, height: H, perspective: 1800, opacity: enter,
        translate: `${shift}px ${bob + 40 * (1 - enter)}px`}}>
        {/* shadow */}
        <div style={{position: 'absolute', left: -W * open * 0.95, right: -20, bottom: -46, height: 40, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(0,0,0,0.55), rgba(0,0,0,0))'}} />
        {/* right page block */}
        <div style={page({boxShadow: '4px 6px 18px rgba(0,0,0,0.45)'})}>{lines}</div>
        {/* fanning pages */}
        {[0, 1, 2].map((k) => (
          <div key={k} style={{...page({background: '#F7ECDA'}), transformOrigin: 'left center', rotate: `y ${fan(k)}deg`, opacity: fan(k) < -2 && fan(k) > -178 ? 1 : 0, boxShadow: '0 0 6px rgba(0,0,0,0.2)'}} />
        ))}
        {/* cover: front plum face, back cream page */}
        <div style={{position: 'absolute', inset: 0, transformOrigin: 'left center', rotate: `y ${coverAngle}deg`, transformStyle: 'preserve-3d'}}>
          <div style={{position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: 8, background: 'linear-gradient(135deg,#4A1426,#2C0A16)', boxShadow: '6px 10px 26px rgba(0,0,0,0.55)', border: '2px solid #8E6A45'}}>
            <div style={{position: 'absolute', inset: 16, border: `2px solid ${GOLD}`, borderRadius: 4, opacity: 0.8}} />
            <div style={{position: 'absolute', inset: 26, border: '1px solid rgba(242,196,109,0.45)', borderRadius: 2}} />
            <div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 22, letterSpacing: '0.16em', lineHeight: 1.6, color: GOLD}}>ASHTANGA<br />HRIDAYAM</div>
            <div style={{position: 'absolute', top: 262, width: '100%', textAlign: 'center', fontFamily: DEV, fontSize: 40, color: GOLD}}>२.१</div>
            <div style={{position: 'absolute', bottom: 54, width: '100%', textAlign: 'center', fontFamily: DEV, fontSize: 34, color: 'rgba(242,196,109,0.7)'}}>ॐ</div>
          </div>
          <div style={{...page(), backfaceVisibility: 'hidden', rotate: 'y 180deg'}}>{lines}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- persistent wooden board
const Board: React.FC<{start: number}> = ({start}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: 22});
  const glow = interpolate(frame, [start + 20, start + 44], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: 120, width: 840, top: 1330, height: 240, opacity: s, translate: `0 ${60 * (1 - s)}px`}}>
      <svg width={840} height={240} viewBox="0 0 840 240">
        <defs>
          <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E3BF86" /><stop offset="0.55" stopColor="#C99A5C" /><stop offset="1" stopColor="#9C6C38" /></linearGradient>
          <linearGradient id="legs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5A2C16" /><stop offset="1" stopColor="#2E140A" /></linearGradient>
        </defs>
        <ellipse cx={420} cy={226} rx={410} ry={14} fill="rgba(0,0,0,0.45)" />
        <rect x={60} y={120} width={720} height={70} rx={8} fill="url(#legs)" />
        <rect x={40} y={110} width={760} height={22} rx={6} fill="#4A2412" />
        <rect x={70} y={150} width={40} height={70} rx={6} fill="url(#legs)" /><rect x={730} y={150} width={40} height={70} rx={6} fill="url(#legs)" />
        <rect x={10} y={20} width={820} height={96} rx={48} fill="url(#wood)" stroke="#7A4E26" strokeWidth={3} />
        {[44, 58, 72, 86].map((y, i) => <path key={y} d={`M60 ${y} Q 300 ${y - 6 + i * 2} 420 ${y} T 780 ${y}`} stroke="rgba(110,70,30,0.25)" strokeWidth={2} fill="none" />)}
        <circle cx={48} cy={68} r={6} fill="#7A4E26" /><circle cx={792} cy={68} r={6} fill="#7A4E26" />
      </svg>
      <div style={{position: 'absolute', top: 30, width: '100%', textAlign: 'center', fontFamily: DEV, fontSize: 60, lineHeight: 1.25, color: '#6B3A12', opacity: 0.35 + 0.65 * glow,
        textShadow: `0 0 ${18 * glow}px rgba(255,200,110,${0.9 * glow})`}}>४:२४</div>
    </div>
  );
};

// ---------- scene 2: numerals + self-drawing icons
const Draw: React.FC<{d: string; t: number; width?: number}> = ({d, t, width = 5}) => (
  <path d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - t} stroke={LINE} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
);

const ICONS: Array<{label: string; paths: string[]}> = [
  {label: 'मन शांत', paths: ['M-110 40 L110 40', 'M-70 40 A70 70 0 0 1 70 40', 'M0 -60 L0 -88', 'M-62 -32 L-82 -52', 'M62 -32 L82 -52', 'M-96 14 L-122 6', 'M96 14 L122 6']},
  {label: 'ध्यान गहरा', paths: ['M0 -70 A18 18 0 1 1 0 -34 A18 18 0 1 1 0 -70', 'M-60 50 Q0 -10 60 50', 'M-90 60 Q0 20 90 60', 'M-40 10 L-80 30', 'M40 10 L80 30']},
  {label: 'दिन बिना भागदौड़', paths: ['M0 -50 L0 60', 'M0 -50 Q-60 -70 -110 -50 L-110 60 Q-60 40 0 60', 'M0 -50 Q60 -70 110 -50 L110 60 Q60 40 0 60', 'M-90 -20 L-30 -26', 'M-90 4 L-30 -2', 'M30 -26 L90 -20', 'M30 -2 L90 4']},
];
const NUM = ['१', '२', '३'];

const Benefits: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const SLOT = 50;
  const i = Math.min(2, Math.floor(frame / SLOT));
  const local = frame - i * SLOT;
  const t = interpolate(local, [4, 30], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const numPop = spring({frame: local, fps, config: {damping: 12, stiffness: 180}, durationInFrames: 14});
  const out = interpolate(local, [SLOT - 8, SLOT], [1, i === 2 ? 1 : 0], clamp);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 560, width: '100%', textAlign: 'center', fontFamily: DEV, fontSize: 64, color: GOLD, scale: String(numPop), textShadow: '0 0 18px rgba(242,196,109,0.6)'}}>{NUM[i]}</div>
      <div style={{position: 'absolute', top: 640, width: '100%', textAlign: 'center', fontFamily: DEV, fontSize: 60, color: CREAM, opacity: interpolate(local, [6, 16], [0, 1], clamp) * out}}>{ICONS[i].label}</div>
      <div style={{position: 'absolute', top: 735, left: 540 - 130, width: 260, height: 2, background: 'rgba(241,217,176,0.6)', scale: `${interpolate(local, [8, 24], [0, 1], clamp)} 1`}} />
      <svg style={{position: 'absolute', left: 540 - 180, top: 830, opacity: out}} width={360} height={300} viewBox="-180 -150 360 300">
        {ICONS[i].paths.map((d, k) => <Draw key={k} d={d} t={Math.min(1, Math.max(0, t * ICONS[i].paths.length - k * 0.6))} />)}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- scene 3: gold-ringed circle reveal
const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const R = 330;
  const open = interpolate(frame, [0, 30], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const ring = interpolate(frame, [6, 40], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const flicker = 0.55 + 0.25 * Math.sin(frame / 3.1) + 0.15 * Math.sin(frame / 1.7);
  const brand = interpolate(frame, [50, 66], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 540 - R, top: 940 - R, width: R * 2, height: R * 2, borderRadius: '50%', overflow: 'hidden', clipPath: `circle(${open * 50}% at 50% 50%)`}}>
        <Img src={staticFile('motionkit/diya.jpg')} style={{position: 'absolute', height: R * 2, left: -R * 0.55, scale: String(1.08 + frame / 600), filter: 'saturate(1.05) contrast(1.05)'}} />
        <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 60%, rgba(255,170,70,${0.35 * flicker}) 0%, rgba(255,140,40,0) 55%)`, mixBlendMode: 'screen'}} />
        <div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 80px 20px rgba(30,4,6,0.7)', borderRadius: '50%'}} />
      </div>
      <svg style={{position: 'absolute', left: 540 - R - 14, top: 940 - R - 14}} width={R * 2 + 28} height={R * 2 + 28} viewBox={`${-R - 14} ${-R - 14} ${R * 2 + 28} ${R * 2 + 28}`}>
        <circle r={R + 4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} stroke={GOLD} strokeWidth={5} fill="none" transform="rotate(-90)" style={{filter: 'drop-shadow(0 0 8px rgba(242,196,109,0.7))'}} />
        <circle r={R + 12} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} stroke="rgba(242,196,109,0.35)" strokeWidth={2} fill="none" transform="rotate(90)" />
      </svg>
      <div style={{position: 'absolute', top: 1290, width: '100%', textAlign: 'center', opacity: brand, fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 28, letterSpacing: '0.22em', color: LINE}}>KASHI WITH ANSHU</div>
    </AbsoluteFill>
  );
};

export const MotionKit: React.FC<{audio?: string}> = ({audio}) => {
  useFonts();
  const frame = useCurrentFrame();
  const fadeOut = (a: number, b: number) => interpolate(frame, [a, b], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <Stage />
      <Sequence from={0} durationInFrames={150}><AbsoluteFill style={{opacity: interpolate(frame, [120, 148], [1, 0], clamp)}}><Book /></AbsoluteFill></Sequence>
      <Sequence from={140} durationInFrames={150}><AbsoluteFill style={{opacity: fadeOut(270, 290)}}><Benefits /></AbsoluteFill></Sequence>
      <Sequence from={285} durationInFrames={135}><Reveal /></Sequence>
      {frame >= 130 && <Board start={130} />}
      <Caption text="हर सुबह, एक ग्रंथ खुलता है" from={6} to={78} />
      <Caption text="अष्टांग हृदयम् कहता है —" from={80} to={140} />
      <Caption text="इस समय उठने के तीन लाभ" from={146} to={286} />
      <Caption text="रोज़ एक नया विचार, काशी से" from={292} to={420} />
      <AbsoluteFill style={{background: '#000', opacity: interpolate(frame, [405, 420], [0, 1], clamp)}} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
