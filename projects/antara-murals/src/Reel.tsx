import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {useFonts} from './fonts';
import captions from '../public/reel/captions_final.json';

// Timeline (30 fps): the keyed video is trimmed by HEAD frames; the main part runs
// MAIN_S seconds, then a 2.5 s end card over the background while the music swells.
export const HEAD = 9;            // 0.3 s trimmed off the front of the raw take
export const MAIN_S = 52.3;
export const TAIL_S = 2.5;
export const TOTAL_FRAMES = Math.round((MAIN_S + TAIL_S) * 30);

const GOLD = 'linear-gradient(180deg,#F5D77F 0%,#E9C860 45%,#C59B27 100%)';
const gold: React.CSSProperties = {backgroundImage: GOLD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};

type Cue = {start: number; end: number; text: string};
const CUES = captions as Cue[];

export const Reel: React.FC<{music: boolean; cover?: boolean}> = ({music, cover = false}) => {
  useFonts();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const mainEnd = MAIN_S * fps;
  const u = Math.min(frame / TOTAL_FRAMES, 1);           // 0..1 over the whole piece

  // slow push-in with parallax: background moves more than the subject
  const bgScale = 1.08 + 0.07 * u;
  const fgScale = 1.0 + 0.035 * u;
  const fgOut = interpolate(frame, [mainEnd - 14, mainEnd + 4], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cardIn = interpolate(frame, [mainEnd - 2, mainEnd + 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});

  return (
    <AbsoluteFill style={{backgroundColor: '#0D0708', overflow: 'hidden'}}>
      {/* Layer 1: background painting, blurred, with a slow push */}
      <AbsoluteFill style={{scale: String(bgScale), transformOrigin: '50% 42%'}}>
        <Img src={staticFile('reel/bg_shiva.png')} style={{width: 1080, height: 1920, objectFit: 'cover', filter: 'saturate(0.9) brightness(0.84)'}} />
      </AbsoluteFill>
      {/* darken the zone behind the head so the face carries the frame */}
      <AbsoluteFill style={{background: 'radial-gradient(60% 38% at 50% 34%, rgba(10,4,2,0.42) 0%, rgba(10,4,2,0.18) 55%, rgba(10,4,2,0) 100%)'}} />

      {/* Layer 2: keyed subject (VP9 with alpha), slightly smaller push for parallax */}
      <AbsoluteFill style={{scale: String(fgScale), transformOrigin: '50% 100%', opacity: fgOut}}>
        <OffthreadVideo src={staticFile('reel/fg_alpha.webm')} transparent muted startFrom={HEAD} style={{width: 1080, height: 1920}} />
      </AbsoluteFill>

      {/* Layer 3: warm key-light wash from the top right + vignette, tying both layers together */}
      <AbsoluteFill style={{background: 'radial-gradient(55% 40% at 78% 8%, rgba(255,214,160,0.10) 0%, rgba(255,214,160,0) 70%)', mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 260px 110px rgba(13,7,8,0.72)'}} />

      {/* Hook, first 3 seconds */}
      <Hook frame={cover ? 40 : frame} />

      {/* City callouts while she names the two shows */}
      {!cover && <Callouts t={t} />}

      {/* Captions */}
      {!cover && CUES.map((c, i) => <Caption key={i} cue={c} t={t} fps={fps} />)}

      {/* End card */}
      {!cover && <EndCard opacity={cardIn} frame={frame - mainEnd} />}

      <Audio src={staticFile(music ? 'reel/mix_music.wav' : 'reel/mix_voice_only.wav')} />
    </AbsoluteFill>
  );
};

const Hook: React.FC<{frame: number}> = ({frame}) => {
  const o = interpolate(frame, [4, 18, 78, 92], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const y = interpolate(frame, [4, 18], [14, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{alignItems: 'center', opacity: o}}>
      <div style={{position: 'absolute', top: 180, translate: `0 ${y}px`, textAlign: 'center'}}>
        <div style={{fontFamily: 'Rozha One, serif', fontSize: 22, letterSpacing: '0.42em', color: '#F5D77F', textTransform: 'uppercase', textShadow: '0 2px 18px rgba(0,0,0,.8)'}}>A thank you from</div>
        <div style={{fontFamily: 'Rozha One, serif', fontSize: 74, lineHeight: 1.05, marginTop: 6, ...gold, filter: 'drop-shadow(0 3px 20px rgba(0,0,0,.7))'}}>Anshu Goyal</div>
        <div style={{fontFamily: 'Tiro Devanagari Hindi, serif', fontSize: 30, color: '#FFFDF9', marginTop: 10, letterSpacing: '0.06em', textShadow: '0 2px 14px rgba(0,0,0,.8)'}}>Delhi &nbsp;·&nbsp; Chandigarh</div>
      </div>
    </AbsoluteFill>
  );
};

const Pill: React.FC<{label: string; tag: string; sold: boolean; o: number; dx: number}> = ({label, tag, sold, o, dx}) => (
  <div style={{opacity: o, translate: `${dx}px 0`, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 26px', borderRadius: 999,
    background: 'rgba(13,7,8,0.62)', boxShadow: '0 0 0 1.6px #E9C860, 0 0 24px rgba(245,215,127,0.35)', backdropFilter: 'blur(6px)'}}>
    <span style={{fontFamily: 'Rozha One, serif', fontSize: 30, color: '#FFFDF9', letterSpacing: '0.04em'}}>{label}</span>
    <span style={{fontFamily: 'Rozha One, serif', fontSize: 18, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 999,
      color: sold ? '#0D0708' : '#F5D77F', background: sold ? GOLD : 'transparent', boxShadow: sold ? 'none' : '0 0 0 1.2px rgba(245,215,127,.7)'}}>{tag}</span>
  </div>
);

const Callouts: React.FC<{t: number}> = ({t}) => {
  const IN = 6.5, SWAP = 12.4, OUT = 17.3;
  if (t < IN - 0.3 || t > OUT + 0.4) return null;
  const o = interpolate(t, [IN - 0.3, IN, OUT, OUT + 0.4], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const dx = interpolate(t, [IN - 0.3, IN], [24, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const sold = t >= SWAP;
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 1270, display: 'flex', gap: 18}}>
        <Pill label="Delhi" tag={sold ? 'House full' : '23 Oct'} sold={sold} o={o} dx={-dx} />
        <Pill label="Chandigarh" tag={sold ? 'Sold out' : '25 Oct'} sold={sold} o={o} dx={dx} />
      </div>
    </AbsoluteFill>
  );
};

const Caption: React.FC<{cue: Cue; t: number; fps: number}> = ({cue, t}) => {
  const FADE = 0.22;
  if (t < cue.start - 0.05 || t > cue.end + 0.1) return null;
  const o = interpolate(t, [cue.start, cue.start + FADE, cue.end - 0.12, cue.end + 0.08], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const y = interpolate(t, [cue.start, cue.start + FADE], [10, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const lines = cue.text.split('\n');
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end'}}>
      <div style={{position: 'absolute', bottom: 262, opacity: o, translate: `0 ${y}px`, maxWidth: 940, textAlign: 'center', padding: '18px 34px', borderRadius: 22,
        background: 'rgba(13,7,8,0.50)', backdropFilter: 'blur(5px)', boxShadow: '0 10px 40px rgba(0,0,0,.35)'}}>
        {lines.map((l, i) => (
          <div key={i} style={{fontFamily: 'Tiro Devanagari Hindi, serif', fontSize: 50, lineHeight: 1.42, color: i === lines.length - 1 && lines.length > 1 ? '#F5D77F' : '#FFFDF9',
            textShadow: '0 2px 12px rgba(0,0,0,.75)'}}>{l}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{opacity: number; frame: number}> = ({opacity, frame}) => {
  if (opacity <= 0) return null;
  const rise = interpolate(frame, [0, 22], [26, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{opacity, alignItems: 'center', justifyContent: 'center'}}>
      <AbsoluteFill style={{background: 'rgba(13,7,8,0.38)'}} />
      <div style={{position: 'relative', textAlign: 'center', translate: `0 ${rise}px`}}>
        <div style={{fontFamily: 'Tiro Devanagari Hindi, serif', fontSize: 112, lineHeight: 1.1, ...gold, filter: 'drop-shadow(0 4px 24px rgba(0,0,0,.7))'}}>धन्यवाद</div>
        <div style={{fontFamily: 'Rozha One, serif', fontSize: 40, color: '#FFFDF9', marginTop: 14, letterSpacing: '0.04em', textShadow: '0 2px 16px rgba(0,0,0,.8)'}}>Thank you, Delhi &amp; Chandigarh</div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 46, marginTop: 54}}>
          <Img src={staticFile('reel/catapultt.png')} style={{height: 170, filter: 'drop-shadow(0 2px 12px rgba(0,0,0,.7))'}} />
          <div style={{width: 1.5, height: 110, background: 'rgba(245,215,127,.6)'}} />
          <Img src={staticFile('reel/antara.png')} style={{height: 200, filter: 'brightness(1.15) contrast(1.1) drop-shadow(0 2px 12px rgba(0,0,0,.7))'}} />
        </div>
        <div style={{fontFamily: 'Rozha One, serif', fontSize: 22, letterSpacing: '0.34em', color: '#F5D77F', marginTop: 46, textTransform: 'uppercase'}}>bhajanjamming.com</div>
      </div>
    </AbsoluteFill>
  );
};
