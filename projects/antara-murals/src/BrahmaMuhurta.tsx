import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {useFonts} from './fonts';

// Brahma Muhurta reel, rebuilt after the trial: hook in frame 1, one idea per screen,
// motion every 1-2 s, value early, explicit save / share / comment ask at the end.
export const BM_FPS = 30;
export const BM_FRAMES = 720; // 24 s

const INK = '#2A1A10';
const RED = '#A3271C';
const SAFFRON = '#B8621B';
const MUTED = '#6A533B';
const PAPER = '#F3EAD3';
const DISPLAY = 'Rozha One, serif';
const BODY = 'Tiro Devanagari Hindi, serif';
const HAND = 'Kalam, cursive';

// scene boundaries (frames)
const S = {hook: [0, 66], source: [66, 138], shloka: [138, 258], when: [258, 378], why: [378, 510], how: [510, 612], cta: [612, 720]} as const;

export type HookVariant = 'A' | 'B' | 'C';

const pop = (frame: number, fps: number, delay = 0) => spring({frame: frame - delay, fps, config: {damping: 14, stiffness: 160}, durationInFrames: 14});

// word-by-word reveal; keeps something moving on screen at all times
const Words: React.FC<{text: string; start?: number; stagger?: number; style: React.CSSProperties; color?: (w: string, i: number) => string | undefined}> = ({text, start = 0, stagger = 3, style, color}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{...style, width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: '0.28em'}}>
      {text.split(' ').map((w, i) => {
        const s = pop(frame, fps, start + i * stagger);
        return <span key={i} style={{opacity: s, translate: `0 ${interpolate(s, [0, 1], [18, 0])}px`, color: color?.(w, i)}}>{w}</span>;
      })}
    </div>
  );
};

const Paper: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: PAPER}}>
    <Img src={staticFile('brahma/parchment.jpg')} style={{width: 1080, height: 1920}} />
    <AbsoluteFill style={{boxShadow: 'inset 0 0 220px 40px rgba(90,60,25,0.32)'}} />
    {children}
  </AbsoluteFill>
);

// content box inside the Reels safe zone (top 220, bottom 420, sides 80)
const Box: React.FC<{children: React.ReactNode; justify?: React.CSSProperties['justifyContent']}> = ({children, justify = 'center'}) => (
  <div style={{position: 'absolute', left: 80, right: 80, top: 220, bottom: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: justify, textAlign: 'center'}}>{children}</div>
);

const AlarmClock: React.FC<{h: number; m: number; size: number; shake?: number; strike?: number; ring?: boolean}> = ({h, m, size, shake = 0, strike = 0, ring = true}) => {
  const frame = useCurrentFrame();
  const rot = shake * Math.sin(frame * 1.7);
  const ha = ((h % 12) + m / 60) * 30;
  const ma = m * 6;
  const ringO = ring ? 0.5 + 0.5 * Math.sin(frame * 0.9) : 0;
  return (
    <svg width={size} height={size} viewBox="-120 -130 240 250" style={{rotate: `${rot}deg`, overflow: 'visible'}}>
      <g stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round">
        <path d="M-78 -78 a40 40 0 0 1 52 -30" fill={SAFFRON} />
        <path d="M78 -78 a40 40 0 0 0 -52 -30" fill={SAFFRON} />
        <line x1={-62} y1={92} x2={-78} y2={112} /><line x1={62} y1={92} x2={78} y2={112} />
        <circle r={96} fill="#FBF5E6" />
        {Array.from({length: 12}).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return <line key={i} x1={Math.sin(a) * 78} y1={-Math.cos(a) * 78} x2={Math.sin(a) * 88} y2={-Math.cos(a) * 88} strokeWidth={i % 3 === 0 ? 7 : 4} />;
        })}
        <line x1={0} y1={0} x2={Math.sin((ha * Math.PI) / 180) * 46} y2={-Math.cos((ha * Math.PI) / 180) * 46} strokeWidth={9} />
        <line x1={0} y1={0} x2={Math.sin((ma * Math.PI) / 180) * 70} y2={-Math.cos((ma * Math.PI) / 180) * 70} strokeWidth={6} />
        <circle r={7} fill={INK} />
      </g>
      <g stroke={RED} strokeWidth={5} strokeLinecap="round" opacity={ringO}>
        <path d="M-112 -60 l-14 -10 M-118 -30 l-18 -2 M112 -60 l14 -10 M118 -30 l18 -2" />
      </g>
      {strike > 0 && <line x1={-130} y1={110} x2={-130 + 260 * strike} y2={110 - 240 * strike} stroke={RED} strokeWidth={14} strokeLinecap="round" />}
    </svg>
  );
};

// ---------------- scenes
const Hook: React.FC<{v: HookVariant}> = ({v}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  // Frame 1 is already complete: no fade from blank. Small punch-in keeps it alive.
  const punch = interpolate(frame, [0, 66], [1.0, 1.06]);
  const strike = interpolate(frame, [14, 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <Paper>
      <Box>
        <div style={{scale: String(punch), display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          {v === 'A' && (<>
            <div style={{fontFamily: DISPLAY, fontSize: 118, lineHeight: 1.12, color: INK}}>आप ग़लत समय पर<br />उठ रहे हैं।</div>
            <div style={{marginTop: 70}}><AlarmClock h={7} m={30} size={430} shake={5} strike={strike} /></div>
          </>)}
          {v === 'B' && (<>
            <div style={{fontFamily: BODY, fontSize: 60, color: MUTED}}>आयुर्वेद के अनुसार</div>
            <div style={{fontFamily: DISPLAY, fontSize: 96, lineHeight: 1.1, color: INK, marginTop: 6}}>उठने का सही समय</div>
            <div style={{marginTop: 50}}><AlarmClock h={4} m={24} size={380} shake={4} /></div>
            <div style={{fontFamily: DISPLAY, fontSize: 168, lineHeight: 1, color: RED, marginTop: 40, scale: String(interpolate(pop(frame, fps, 2), [0, 1], [1.25, 1]))}}>4:24 AM</div>
          </>)}
          {v === 'C' && (<>
            <div style={{fontFamily: DISPLAY, fontSize: 96, color: INK}}>सूर्योदय से</div>
            <div style={{fontFamily: DISPLAY, fontSize: 190, lineHeight: 1.05, color: RED}}>96 मिनट</div>
            <div style={{fontFamily: DISPLAY, fontSize: 96, color: INK}}>पहले क्या होता है?</div>
            <div style={{marginTop: 60}}><AlarmClock h={4} m={24} size={330} shake={4} /></div>
          </>)}
        </div>
      </Box>
    </Paper>
  );
};

const Book: React.FC<{open: number}> = ({open}) => (
  <svg width={520} height={300} viewBox="-260 -150 520 300">
    <g stroke={INK} strokeWidth={6} strokeLinejoin="round" fill="#F6ECD2">
      <path d={`M0 -110 Q-${120 * open + 40} -140 -${220 * open + 20} -110 L-${220 * open + 20} 120 Q-${120 * open + 40} 90 0 120 Z`} />
      <path d={`M0 -110 Q${120 * open + 40} -140 ${220 * open + 20} -110 L${220 * open + 20} 120 Q${120 * open + 40} 90 0 120 Z`} />
      <line x1={0} y1={-110} x2={0} y2={120} />
    </g>
    <g stroke={MUTED} strokeWidth={3} opacity={open}>
      {[-60, -25, 10, 45].map((y) => <React.Fragment key={y}><line x1={-170} y1={y} x2={-40} y2={y + 4} /><line x1={40} y1={y + 4} x2={170} y2={y} /></React.Fragment>)}
    </g>
  </svg>
);

const Source: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const open = pop(frame, fps, 0);
  return (
    <Paper>
      <Box>
        <div style={{fontFamily: BODY, fontSize: 58, color: MUTED}}><Words text="1,400 साल पहले" style={{}} /></div>
        <div style={{marginTop: 50, scale: String(interpolate(open, [0, 1], [0.85, 1]))}}><Book open={open} /></div>
        <div style={{fontFamily: BODY, fontSize: 50, color: MUTED, marginTop: 50}}><Words text="आयुर्वेद के ग्रंथ" start={10} style={{}} /></div>
        <div style={{fontFamily: DISPLAY, fontSize: 118, color: INK, lineHeight: 1.1}}><Words text="अष्टांग हृदयम्" start={16} stagger={5} style={{}} /></div>
        <div style={{fontFamily: BODY, fontSize: 50, color: MUTED, marginTop: 10}}><Words text="में लिखा है —" start={30} style={{}} /></div>
      </Box>
    </Paper>
  );
};

const Shloka: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const drop = pop(frame, fps, 0);
  const swing = 1.6 * Math.sin(frame / 9) * Math.exp(-frame / 60);
  const line2 = 60;
  const u1 = interpolate(frame, [8, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const u2 = interpolate(frame, [line2 + 8, line2 + 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Paper>
      <Box>
        <div style={{rotate: `${swing}deg`, transformOrigin: '50% -200px', translate: `0 ${interpolate(drop, [0, 1], [-60, 0])}px`, opacity: drop,
          width: 900, boxSizing: 'border-box', padding: '44px 56px 40px', borderRadius: 26, background: 'linear-gradient(180deg,#EAD39B,#DDBF7E)', border: `5px solid ${INK}`, boxShadow: '0 18px 40px rgba(60,35,10,0.28)', position: 'relative'}}>
          <div style={{position: 'absolute', left: 34, top: '50%', width: 16, height: 16, borderRadius: 8, border: `4px solid ${INK}`, background: PAPER}} />
          <div style={{position: 'absolute', right: 34, top: '50%', width: 16, height: 16, borderRadius: 8, border: `4px solid ${INK}`, background: PAPER}} />
          <div style={{fontFamily: DISPLAY, fontSize: 66, lineHeight: 1.25, color: INK}}>ब्राह्मे मुहूर्ते उत्तिष्ठेत्,</div>
          <div style={{height: 6, width: `${u1 * 80}%`, margin: '6px auto 0', background: RED, borderRadius: 3}} />
          <div style={{fontFamily: DISPLAY, fontSize: 66, lineHeight: 1.25, color: INK, marginTop: 18, opacity: interpolate(frame, [line2 - 6, line2], [0.35, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>स्वस्थो रक्षार्थमायुषः।</div>
          <div style={{height: 6, width: `${u2 * 72}%`, margin: '6px auto 0', background: RED, borderRadius: 3}} />
        </div>
        <div style={{marginTop: 60, fontFamily: HAND, fontWeight: 700, fontSize: 56, lineHeight: 1.3, color: RED, minHeight: 150}}>
          {frame < line2
            ? <Words text="ब्रह्म मुहूर्त में उठें," start={10} style={{}} />
            : <Words text="स्वस्थ रहने और अपनी आयु की रक्षा के लिए।" start={line2 + 6} style={{}} />}
        </div>
        <div style={{fontFamily: BODY, fontSize: 34, color: MUTED, marginTop: 10}}>— अष्टांग हृदयम्, सूत्रस्थान 2.1</div>
      </Box>
    </Paper>
  );
};

const When: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bar = interpolate(frame, [12, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const sun = pop(frame, fps, 34);
  const X0 = 40, X1 = 880; // 3:30 -> 6:30 on a 900 px axis
  const x = (hh: number, mm: number) => X0 + ((hh * 60 + mm - 210) / 180) * (X1 - X0);
  return (
    <Paper>
      <Box>
        <div style={{fontFamily: DISPLAY, fontSize: 104, color: INK}}><Words text="ब्रह्म मुहूर्त कब?" style={{}} /></div>
        <div style={{position: 'relative', width: 920, height: 330, marginTop: 70}}>
          <div style={{position: 'absolute', left: X0, top: 150, width: (X1 - X0) * Math.min(1, bar * 1.2), height: 6, background: INK, borderRadius: 3}} />
          <div style={{position: 'absolute', left: x(4, 24), top: 118, width: (x(5, 12) - x(4, 24)) * bar, height: 70, background: 'rgba(163,39,28,0.18)', border: `4px solid ${RED}`, borderRadius: 14}} />
          {[[4, 24], [5, 12], [6, 0]].map(([hh, mm], i) => (
            <div key={i} style={{position: 'absolute', left: x(hh, mm) - 80, width: 160, top: 210, textAlign: 'center', opacity: pop(frame, fps, 20 + i * 7),
              fontFamily: DISPLAY, fontSize: 50, color: i === 2 ? SAFFRON : RED}}>{`${hh}:${String(mm).padStart(2, '0')}`}</div>
          ))}
          <svg style={{position: 'absolute', left: x(6, 0) - 60, top: 20, scale: String(sun), opacity: sun}} width={120} height={120} viewBox="-60 -60 120 120">
            <g stroke={SAFFRON} strokeWidth={6} strokeLinecap="round">
              {Array.from({length: 8}).map((_, i) => <line key={i} x1={Math.cos((i * Math.PI) / 4) * 36} y1={Math.sin((i * Math.PI) / 4) * 36} x2={Math.cos((i * Math.PI) / 4) * 52} y2={Math.sin((i * Math.PI) / 4) * 52} />)}
            </g>
            <circle r={26} fill={SAFFRON} />
          </svg>
          <div style={{position: 'absolute', left: x(4, 24), width: x(5, 12) - x(4, 24), top: 72, textAlign: 'center', fontFamily: HAND, fontWeight: 700, fontSize: 40, color: RED, opacity: pop(frame, fps, 30)}}>48 मिनट</div>
        </div>
        <div style={{fontFamily: BODY, fontSize: 52, lineHeight: 1.35, color: INK, marginTop: 30}}>
          <Words text="सूर्योदय से 96 मिनट पहले शुरू," start={40} style={{}} />
          <Words text="48 मिनट तक।" start={58} style={{}} />
        </div>
        <div style={{fontFamily: BODY, fontSize: 36, color: MUTED, marginTop: 24, opacity: pop(frame, fps, 72)}}>उदाहरण: सूर्योदय 6:00 बजे, तो 4:24 से 5:12</div>
      </Box>
    </Paper>
  );
};

const Why: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const items = ['मन सबसे शांत', 'ध्यान और पढ़ाई के लिए उत्तम', 'बिना भागदौड़ के दिन की शुरुआत'];
  return (
    <Paper>
      <Box>
        <div style={{fontFamily: BODY, fontSize: 56, color: MUTED}}><Words text="आयुर्वेद कहता है, इस समय —" style={{}} /></div>
        <div style={{marginTop: 70, display: 'flex', flexDirection: 'column', gap: 40, alignItems: 'stretch', width: 860}}>
          {items.map((it, i) => {
            const s = pop(frame, fps, 10 + i * 36);
            return (
              <div key={it} style={{opacity: s, translate: `${interpolate(s, [0, 1], [-60, 0])}px 0`, display: 'flex', alignItems: 'center', gap: 30, padding: '26px 34px',
                background: 'rgba(255,250,235,0.7)', border: `4px solid ${INK}`, borderRadius: 22, boxShadow: '0 8px 0 rgba(42,26,16,0.85)'}}>
                <div style={{fontFamily: DISPLAY, fontSize: 72, color: RED, width: 70, textAlign: 'center'}}>{['१', '२', '३'][i]}</div>
                <div style={{fontFamily: DISPLAY, fontSize: 56, color: INK, textAlign: 'left', lineHeight: 1.15}}>{it}</div>
              </div>
            );
          })}
        </div>
      </Box>
    </Paper>
  );
};

const How: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const m = Math.round(interpolate(frame, [20, 70], [30, 15], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return (
    <Paper>
      <Box>
        <div style={{fontFamily: DISPLAY, fontSize: 104, color: INK}}><Words text="शुरुआत कैसे करें?" style={{}} /></div>
        <div style={{marginTop: 50}}><AlarmClock h={6} m={m} size={300} shake={0} ring={false} /></div>
        <div style={{fontFamily: DISPLAY, fontSize: 64, lineHeight: 1.25, color: RED, marginTop: 40, width: '100%'}}><Words text="हर कुछ दिन में 15 मिनट पहले उठें।" start={16} style={{}} /></div>
        <div style={{fontFamily: BODY, fontSize: 50, lineHeight: 1.35, color: INK, marginTop: 30}}><Words text="एक झटके में नहीं — शरीर धीरे-धीरे ख़ुद ढल जाएगा।" start={40} stagger={2} style={{}} /></div>
      </Box>
    </Paper>
  );
};

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pulse = 1 + 0.03 * Math.sin(frame / 5);
  return (
    <Paper>
      <Box>
        <div style={{fontFamily: DISPLAY, fontSize: 112, color: INK, opacity: pop(frame, fps, 0)}}>Save करें।</div>
        <div style={{fontFamily: DISPLAY, fontSize: 64, lineHeight: 1.25, color: INK, marginTop: 40, width: '100%'}}>
          <Words text="और भेजें उसे" start={8} style={{}} />
          <Words text="जो रोज़ alarm snooze करता है।" start={16} style={{}} color={(w) => (w === 'snooze' || w === 'alarm' ? RED : undefined)} />
        </div>
        <div style={{marginTop: 80, scale: String(pop(frame, fps, 34) * pulse), padding: '26px 46px', borderRadius: 999, border: `5px solid ${RED}`, background: 'rgba(255,250,235,0.75)',
          fontFamily: BODY, fontSize: 48, color: RED}}>आप कितने बजे उठते हैं? कमेंट करें</div>
      </Box>
    </Paper>
  );
};

export const BrahmaMuhurta: React.FC<{hook: HookVariant; audio: string}> = ({hook, audio}) => {
  useFonts();
  const seq = (k: keyof typeof S) => ({from: S[k][0], durationInFrames: S[k][1] - S[k][0]});
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <Sequence {...seq('hook')}><Hook v={hook} /></Sequence>
      <Sequence {...seq('source')}><Source /></Sequence>
      <Sequence {...seq('shloka')}><Shloka /></Sequence>
      <Sequence {...seq('when')}><When /></Sequence>
      <Sequence {...seq('why')}><Why /></Sequence>
      <Sequence {...seq('how')}><How /></Sequence>
      <Sequence {...seq('cta')}><Cta /></Sequence>
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};

export const BM_ACCENTS = [2.2, 4.6, 6.6, 8.6, 12.93, 14.13, 15.33, 17.0, 20.4].join(',');
