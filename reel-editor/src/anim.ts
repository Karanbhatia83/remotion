import { interpolate, spring, Easing } from 'remotion';

/**
 * Entrance/exit envelope for an overlay that lives between two frames.
 * `enter` springs 0→1 on arrival, `exit` eases 1→0 on the way out, and
 * `presence` is the two multiplied — the thing you actually animate on.
 */
export const useEnvelope = ({
  frame,
  fps,
  durationInFrames,
  exitFrames = 12,
}: {
  frame: number;
  fps: number;
  durationInFrames: number;
  exitFrames?: number;
}) => {
  const enter = spring({
    frame,
    fps,
    config: { damping: 200, mass: 0.6, stiffness: 110 },
  });

  const exit = interpolate(
    frame,
    [durationInFrames - exitFrames, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.in(Easing.cubic),
    },
  );

  return { enter, exit, presence: enter * exit };
};

/**
 * Per-word stagger. Word `i` starts `stepFrames` after the one before it,
 * so a line assembles rather than popping in as a block.
 */
export const wordSpring = ({
  frame,
  fps,
  index,
  stepFrames = 3,
}: {
  frame: number;
  fps: number;
  index: number;
  stepFrames?: number;
}) =>
  spring({
    frame: frame - index * stepFrames,
    fps,
    config: { damping: 200, mass: 0.5, stiffness: 130 },
  });

/** Text shadow that keeps light type legible over bright, busy footage. */
export const LEGIBILITY_SHADOW =
  '0 2px 12px rgba(0,0,0,0.55), 0 0 40px rgba(0,0,0,0.35)';
