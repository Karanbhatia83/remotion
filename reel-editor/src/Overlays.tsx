import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { PALETTE, SAFE, OVERLAYS } from './edit.config';
import { useEnvelope, wordSpring, LEGIBILITY_SHADOW } from './anim';
import { MUKTA as mukta, POPPINS as poppins } from './fonts';

/**
 * A word that wipes up behind a mask instead of just fading. Reads as
 * deliberate at reel speed, where a plain fade tends to look like a glitch.
 */
const RevealWord: React.FC<{
  children: React.ReactNode;
  index: number;
  style?: React.CSSProperties;
}> = ({ children, index, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = wordSpring({ frame, fps, index });

  return (
    <span
      style={{
        display: 'inline-block',
        overflow: 'hidden',
        verticalAlign: 'bottom',
        paddingBottom: '0.12em',
        marginBottom: '-0.12em',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          transform: `translateY(${interpolate(p, [0, 1], [110, 0])}%)`,
          opacity: interpolate(p, [0, 0.35], [0, 1], {
            extrapolateRight: 'clamp',
          }),
          ...style,
        }}
      >
        {children}
      </span>
    </span>
  );
};

/** Splits on spaces so each word gets its own stagger index. */
const RevealLine: React.FC<{
  text: string;
  startIndex?: number;
  style?: React.CSSProperties;
}> = ({ text, startIndex = 0, style }) => (
  <>
    {text.split(' ').map((word, i) => (
      <React.Fragment key={`${word}-${i}`}>
        <RevealWord index={startIndex + i} style={style}>
          {word}
        </RevealWord>
        {i < text.split(' ').length - 1 ? ' ' : null}
      </React.Fragment>
    ))}
  </>
);

/**
 * Soft darkening behind top-placed type. The footage runs bright (marigold,
 * daylight garden, white walls), and a drop shadow alone isn't enough to keep
 * light text readable over it.
 */
const TopScrim: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <AbsoluteFill
    style={{
      height: '42%',
      background:
        'linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.34) 55%, rgba(0,0,0,0) 100%)',
      opacity,
    }}
  />
);

/** Gold rule that wipes open from the left under the hook. */
const GoldRule: React.FC<{ delay: number; width: number }> = ({
  delay,
  width,
}) => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame, [delay, delay + 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        width: width * grow,
        height: 6,
        marginTop: 26,
        borderRadius: 3,
        background: `linear-gradient(90deg, ${PALETTE.saffron}, ${PALETTE.gold})`,
        boxShadow: `0 0 24px ${PALETTE.saffron}88`,
      }}
    />
  );
};

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { presence } = useEnvelope({ frame, fps, durationInFrames });
  const { lineOne, lineTwo } = OVERLAYS.hook;

  return (
    <AbsoluteFill
      style={{
        paddingTop: SAFE.top + 60,
        paddingLeft: SAFE.left,
        paddingRight: SAFE.right,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        opacity: presence,
      }}
    >
      <div
        style={{
          fontFamily: mukta,
          fontWeight: 800,
          fontSize: 108,
          lineHeight: 1.04,
          color: PALETTE.cream,
          letterSpacing: '-0.02em',
          textShadow: LEGIBILITY_SHADOW,
        }}
      >
        <div>
          <RevealLine text={lineOne} startIndex={0} />
        </div>
        <div>
          <RevealLine
            text={lineTwo}
            startIndex={lineOne.split(' ').length}
            style={{
              background: `linear-gradient(100deg, ${PALETTE.marigold}, ${PALETTE.gold})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          />
        </div>
        <GoldRule delay={10} width={260} />
      </div>
    </AbsoluteFill>
  );
};

export const LowerThird: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { enter, presence } = useEnvelope({ frame, fps, durationInFrames });
  const { name, subtitle, handle } = OVERLAYS.lowerThird;

  return (
    <AbsoluteFill
      style={{
        paddingLeft: SAFE.left,
        paddingRight: SAFE.right,
        paddingBottom: SAFE.bottom,
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        opacity: presence,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 22,
          transform: `translateX(${interpolate(enter, [0, 1], [-60, 0])}px)`,
        }}
      >
        {/* Saffron accent bar that grows to full height on entry. */}
        <div
          style={{
            width: 8,
            borderRadius: 4,
            transformOrigin: 'bottom center',
            transform: `scaleY(${enter})`,
            background: `linear-gradient(180deg, ${PALETTE.marigold}, ${PALETTE.saffron})`,
            boxShadow: `0 0 20px ${PALETTE.saffron}77`,
          }}
        />
        <div>
          <div
            style={{
              fontFamily: mukta,
              fontWeight: 800,
              fontSize: 76,
              lineHeight: 1.1,
              color: PALETTE.cream,
              textShadow: LEGIBILITY_SHADOW,
            }}
          >
            <RevealLine text={name} />
          </div>
          <div
            style={{
              fontFamily: mukta,
              fontWeight: 600,
              fontSize: 36,
              marginTop: 6,
              color: PALETTE.gold,
              textShadow: LEGIBILITY_SHADOW,
              opacity: interpolate(frame, [8, 20], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            {subtitle}
          </div>
          <div
            style={{
              fontFamily: poppins,
              fontWeight: 500,
              fontSize: 30,
              marginTop: 14,
              letterSpacing: '0.06em',
              color: PALETTE.cream,
              opacity: interpolate(frame, [14, 26], [0, 0.92], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
              textShadow: LEGIBILITY_SHADOW,
            }}
          >
            {handle}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const MidCallout: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { presence } = useEnvelope({ frame, fps, durationInFrames });

  return (
    <>
      <TopScrim opacity={presence * 0.9} />
      <AbsoluteFill
        style={{
          paddingTop: SAFE.top,
          paddingLeft: SAFE.left,
          paddingRight: SAFE.right,
          alignItems: 'center',
          justifyContent: 'flex-start',
          opacity: presence,
        }}
      >
        <div
          style={{
            fontFamily: mukta,
            fontWeight: 800,
            fontSize: 82,
            lineHeight: 1.08,
            textAlign: 'center',
            color: PALETTE.cream,
            textShadow: LEGIBILITY_SHADOW,
          }}
        >
          <RevealLine text={OVERLAYS.midCallout.text} />
        </div>
      </AbsoluteFill>
    </>
  );
};

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { enter, presence } = useEnvelope({ frame, fps, durationInFrames });
  const { headline, handle } = OVERLAYS.endCard;

  return (
    <>
      <TopScrim opacity={presence * 0.95} />
      <AbsoluteFill
        style={{
          paddingLeft: SAFE.left,
          paddingRight: SAFE.right,
          // Sits high rather than centred: the closing shots frame the subject
          // dead centre, and a centred CTA lands straight across her face.
          paddingTop: SAFE.top,
          alignItems: 'center',
          justifyContent: 'flex-start',
          opacity: presence,
        }}
      >
        <div
          style={{
            transform: `scale(${interpolate(enter, [0, 1], [0.88, 1])})`,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: poppins,
              fontWeight: 600,
              fontSize: 40,
              letterSpacing: '0.22em',
              color: PALETTE.gold,
              textShadow: LEGIBILITY_SHADOW,
            }}
          >
            <RevealLine text={headline} />
          </div>
          <div
            style={{
              fontFamily: mukta,
              fontWeight: 800,
              fontSize: 96,
              marginTop: 14,
              color: PALETTE.cream,
              textShadow: LEGIBILITY_SHADOW,
              opacity: interpolate(frame, [10, 24], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            {handle}
          </div>
          <div
            style={{
              width: interpolate(frame, [16, 34], [0, 320], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.cubic),
              }),
              height: 6,
              borderRadius: 3,
              margin: '30px auto 0',
              background: `linear-gradient(90deg, ${PALETTE.saffron}, ${PALETTE.gold})`,
              boxShadow: `0 0 24px ${PALETTE.saffron}88`,
            }}
          />
        </div>
      </AbsoluteFill>
    </>
  );
};

export const HandleBug: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { presence } = useEnvelope({ frame, fps, durationInFrames });

  return (
    <AbsoluteFill
      style={{
        paddingTop: SAFE.top - 60,
        paddingLeft: SAFE.left,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        opacity: presence * 0.85,
      }}
    >
      <div
        style={{
          fontFamily: poppins,
          fontWeight: 500,
          fontSize: 28,
          letterSpacing: '0.08em',
          color: PALETTE.cream,
          padding: '10px 22px',
          borderRadius: 999,
          border: `1.5px solid ${PALETTE.gold}66`,
          background: 'rgba(0,0,0,0.28)',
          backdropFilter: 'blur(6px)',
        }}
      >
        {OVERLAYS.handleBug.text}
      </div>
    </AbsoluteFill>
  );
};
