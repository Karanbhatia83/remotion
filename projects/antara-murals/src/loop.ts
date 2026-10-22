// Helpers that make every motion exactly periodic in the clip length.
// All functions take t in [0, 1) (frame / durationInFrames) and an integer
// cycle count, so value(0) === value(1) by construction.

export const TAU = Math.PI * 2;

/** Sine with an integer number of cycles per loop. phase in turns. */
export const cyc = (t: number, cycles: number, phase = 0) =>
  Math.sin(TAU * (cycles * t + phase));

/** 0..1 "breath": 1 at t=0, dips to 0, back to 1 — `cycles` times per loop. */
export const breath = (t: number, cycles: number) =>
  0.5 * (1 + Math.cos(TAU * cycles * t));

/** 0..1 hump: 0 at t=0, peak 1 mid-cycle, 0 at t=1 — `cycles` per loop. */
export const hump = (t: number, cycles: number) =>
  0.5 * (1 - Math.cos(TAU * cycles * t));

/** Fractional part, always in [0,1). */
export const frac = (x: number) => x - Math.floor(x);

/** Deterministic PRNG (mulberry32) so particles are stable across renders. */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Organic flicker: a sum of sines at integer cycle counts. Periodic in the
 * loop, but the mix of primes reads as candle-like rather than mechanical.
 * Returns roughly -1..1.
 */
export const flicker = (t: number, seed = 0) =>
  (cyc(t, 7, seed * 0.13) * 0.45 +
    cyc(t, 11, seed * 0.29) * 0.3 +
    cyc(t, 23, seed * 0.47) * 0.15 +
    cyc(t, 37, seed * 0.71) * 0.1);

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const smooth = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
