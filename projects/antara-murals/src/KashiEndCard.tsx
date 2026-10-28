import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// Source reel: 720x1280 @ 25 fps, 51.45 s. Composition: 1080x1920 @ 25 fps.
export const FPS = 25;
export const SRC_SECONDS = 51.452562;
export const CARD_SECONDS = 3.5;
export const FADE_SECONDS = 0.4;
export const TOTAL_FRAMES = Math.round((SRC_SECONDS + CARD_SECONDS) * FPS); // 1374

const SPRING = {damping: 14, stiffness: 120};
const SAFFRON = '#F59E0B';
const SOFT_GOLD = '#FDE68A';

// Load Inter Black / SemiBold from public/ so the render never falls back to a system face.
const useInter = () => {
  const [handle] = useState(() => delayRender('Inter fonts'));
  useEffect(() => {
    Promise.all([
      new FontFace('Inter Black', `url(${staticFile('endcard/Inter-Black.otf')})`, {weight: '900'}).load(),
      new FontFace('Inter SemiBold', `url(${staticFile('endcard/Inter-SemiBold.otf')})`, {weight: '600'}).load(),
    ]).then((faces) => { faces.forEach((f) => document.fonts.add(f)); continueRender(handle); })
      .catch((e) => { console.error(e); continueRender(handle); });
  }, [handle]);
};

export const KashiEndCard: React.FC = () => {
  useInter();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const srcFrames = Math.round(SRC_SECONDS * fps);
  const fadeFrames = Math.round(FADE_SECONDS * fps);
  const cardStart = srcFrames - fadeFrames; // card fades in under the last 0.4 s of the reel

  // video fades to the charcoal card over the final 0.4 s
  const videoOpacity = interpolate(frame, [cardStart, srcFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{backgroundColor: '#0D0907'}}>
      {/* End card sits underneath; the reel fades out on top of it */}
      <Sequence from={cardStart} layout="none">
        <Card />
      </Sequence>
      <AbsoluteFill style={{opacity: videoOpacity}}>
        <OffthreadVideo src={staticFile('endcard/src.mp4')} muted style={{width: 1080, height: 1920, objectFit: 'cover'}} />
      </AbsoluteFill>
      {/* Original soundtrack, extended by its own last seconds and faded out under the card */}
      <Audio src={staticFile('endcard/audio_full.wav')} />
    </AbsoluteFill>
  );
};

const Card: React.FC = () => {
  const frame = useCurrentFrame(); // 0 at card start
  const {fps} = useVideoConfig();
  const fadeIn = interpolate(frame, [0, Math.round(FADE_SECONDS * fps)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // slow-pulsing radial glow behind the text (3 s period)
  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * (2 * Math.PI / 3));
  const glowScale = 1 + 0.12 * pulse;
  const glowOpacity = 0.22 * (0.8 + 0.4 * pulse);

  // spring entrances: headline from frame 0, trishul + sub from frame 8, CTA from frame 14
  const sHead = spring({frame, fps, config: SPRING, durationInFrames: 10});
  const sMid = spring({frame: frame - 8, fps, config: SPRING, durationInFrames: 12});
  const sCta = spring({frame: frame - 14, fps, config: SPRING, durationInFrames: 12});
  const headScale = interpolate(sHead, [0, 1], [0.88, 1]);
  const midY = interpolate(sMid, [0, 1], [22, 0]);
  const ctaScale = interpolate(sCta, [0, 1], [0.7, 1]);
  // continuous scale pulse on the CTA, 1.0 -> 1.06, once the pop-in has landed
  const ctaPulse = 1 + 0.03 * (1 + Math.sin((frame / fps) * (2 * Math.PI / 1.4) - Math.PI / 2));

  const shadow = '0 4px 18px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.9)';

  return (
    <AbsoluteFill style={{opacity: fadeIn, backgroundColor: '#0D0907'}}>
      {/* radial amber glow, centred on the text block */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{width: 1300, height: 1300, borderRadius: '50%', scale: String(glowScale), opacity: glowOpacity,
          background: 'radial-gradient(circle, #D97706 0%, rgba(217,119,6,0.55) 28%, rgba(217,119,6,0) 68%)', translate: '0 -80px'}} />
      </AbsoluteFill>

      {/* Safe zone: 110px sides, 260px top, 420px bottom -> content box 860 x 1240 */}
      <div style={{position: 'absolute', left: 110, right: 110, top: 260, bottom: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
        <div style={{fontFamily: 'Inter Black, Inter, sans-serif', fontWeight: 900, fontSize: 72, lineHeight: 1.15, textTransform: 'uppercase', color: '#FFFFFF',
          letterSpacing: '0.01em', textShadow: shadow, scale: String(headScale), opacity: sHead}}>
          <span style={{color: SAFFRON}}>Share this</span> with someone you want to witness the <span style={{color: SAFFRON}}>10:15 PM Shayan Aarti</span> with
        </div>

        <div style={{marginTop: 36, marginBottom: 36, fontSize: 68, lineHeight: 1, opacity: sMid, translate: `0 ${midY}px`,
          filter: 'drop-shadow(0 0 18px rgba(245,158,11,0.9)) drop-shadow(0 0 40px rgba(245,158,11,0.5))'}}>🔱</div>

        <div style={{fontFamily: 'Inter SemiBold, Inter, sans-serif', fontWeight: 600, fontSize: 54, lineHeight: 1.25, color: SOFT_GOLD, textShadow: shadow,
          opacity: sMid, translate: `0 ${midY}px`}}>When Baba calls, we go together.</div>

        <div style={{marginTop: 64, opacity: sCta, scale: String(ctaScale * ctaPulse), display: 'inline-flex', alignItems: 'center', gap: 18,
          padding: '26px 56px', borderRadius: 999, border: `3px solid ${SAFFRON}`, background: 'rgba(13,9,7,0.72)',
          boxShadow: '0 0 34px rgba(245,158,11,0.35), 0 10px 30px rgba(0,0,0,0.6)'}}>
          <span style={{fontFamily: 'Inter Black, Inter, sans-serif', fontWeight: 900, fontSize: 44, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF', textShadow: shadow}}>Send this to them ↗</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
