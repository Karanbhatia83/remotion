import React from 'react';
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  Series,
  interpolate,
  staticFile,
  useVideoConfig,
} from 'remotion';
import { CLIPS, MUSIC, OVERLAYS } from './edit.config';
import { Hook, LowerThird, MidCallout, EndCard, HandleBug } from './Overlays';
import { useFonts } from './fonts';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

const secToFrames = (seconds: number) => Math.round(seconds * FPS);

/** Total timeline length, derived from the clip list so adding a clip just works. */
export const totalDurationInFrames = () =>
  CLIPS.reduce((sum, clip) => sum + secToFrames(clip.duration ?? 10), 0);

const Music: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const fadeIn = secToFrames(MUSIC.fadeIn);
  const fadeOut = secToFrames(MUSIC.fadeOut);

  return (
    <Audio
      src={staticFile(MUSIC.src)}
      volume={(f) =>
        interpolate(
          f,
          [0, fadeIn, durationInFrames - fadeOut, durationInFrames],
          [0, MUSIC.volume, MUSIC.volume, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        )
      }
    />
  );
};

/** Wraps an overlay in a Sequence built from its seconds-based config. */
const Timed: React.FC<{
  config: { enabled: boolean; from: number; to: number };
  children: React.ReactNode;
}> = ({ config, children }) => {
  if (!config.enabled) {
    return null;
  }

  return (
    <Sequence
      from={secToFrames(config.from)}
      durationInFrames={secToFrames(config.to - config.from)}
      layout="none"
    >
      {children}
    </Sequence>
  );
};

export const Reel: React.FC = () => {
  useFonts();

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Series>
        {CLIPS.map((clip, i) => (
          <Series.Sequence
            key={`${clip.src}-${i}`}
            durationInFrames={secToFrames(clip.duration ?? 10)}
          >
            <OffthreadVideo
              src={staticFile(clip.src)}
              trimBefore={
                clip.trimStart ? secToFrames(clip.trimStart) : undefined
              }
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Series.Sequence>
        ))}
      </Series>

      {MUSIC.enabled ? <Music /> : null}

      <Timed config={OVERLAYS.hook}>
        <Hook />
      </Timed>
      <Timed config={OVERLAYS.lowerThird}>
        <LowerThird />
      </Timed>
      <Timed config={OVERLAYS.midCallout}>
        <MidCallout />
      </Timed>
      <Timed config={OVERLAYS.endCard}>
        <EndCard />
      </Timed>
      <Timed config={OVERLAYS.handleBug}>
        <HandleBug />
      </Timed>
    </AbsoluteFill>
  );
};
