/**
 * ─────────────────────────────────────────────────────────────
 *  EDIT THIS FILE — everything you'd want to change lives here.
 *  Times are in SECONDS. Text supports Devanagari and Latin
 *  (the font is Mukta, so Hindi copy works without changes).
 * ─────────────────────────────────────────────────────────────
 */

export type Clip = {
  /** File inside public/ */
  src: string;
  /** Trim from the start of the source file, in seconds. */
  trimStart?: number;
  /** How long to play, in seconds. Omit to play to the end. */
  duration?: number;
};

/**
 * Clips play back-to-back in order. Today there is one.
 * To join a second clip: drop it in public/ and add a line here —
 * the composition length recalculates itself.
 */
export const CLIPS: Clip[] = [{ src: 'source.mp4', duration: 10 }];

/**
 * Background music. The supplied footage has NO audio track, so this
 * is the only sound the render will have. Put a file in public/ and
 * set `enabled: true`.
 */
export const MUSIC = {
  enabled: false,
  src: 'music.mp3',
  /** 0–1. Sits low so narration (if you add any) stays on top. */
  volume: 0.7,
  /** Seconds of fade at the head and tail. */
  fadeIn: 0.5,
  fadeOut: 1.2,
};

/** Warm devotional palette, pulled from the marigold/saffron in the footage. */
export const PALETTE = {
  saffron: '#FF8A1F',
  marigold: '#FFB627',
  gold: '#F7DA8C',
  maroon: '#3D0A1B',
  cream: '#FFF6E6',
};

/**
 * Overlays. Set `enabled: false` on any of these to drop it.
 * `from`/`to` are seconds on the finished timeline.
 */
export const OVERLAYS = {
  /** Opening hook, over the stage-narration shot. */
  hook: {
    enabled: true,
    from: 0.25,
    to: 2.45,
    lineOne: 'YOUR HOOK LINE',
    lineTwo: 'GOES HERE',
  },

  /** Name + handle, over the temple puja / fans section. */
  lowerThird: {
    enabled: true,
    from: 2.6,
    to: 5.4,
    name: 'ARTIST NAME',
    subtitle: 'Kathavachak · Storyteller',
    handle: '@yourhandle',
  },

  /** Mid callout, over the gali walk and mala close-up. */
  midCallout: {
    enabled: true,
    from: 5.8,
    to: 7.6,
    text: 'YOUR SECOND LINE',
  },

  /**
   * End CTA. Ends at 9.05s on purpose — the closing shot carries its own
   * comment overlays from ~9.1s, and the CTA has to be gone before they
   * land or the two stack on top of each other.
   */
  endCard: {
    enabled: true,
    from: 8.0,
    to: 9.05,
    headline: 'FOLLOW FOR MORE',
    handle: '@yourhandle',
  },

  /** Small persistent handle in the corner. Off by default — it's a lot with the rest. */
  handleBug: {
    enabled: false,
    from: 1.0,
    to: 9.9,
    text: '@yourhandle',
  },
};

/**
 * Instagram Reels chrome eats the edges: the caption block and action
 * rail sit over the bottom and right. Overlays stay inside this box.
 */
export const SAFE = {
  top: 170,
  bottom: 430,
  left: 80,
  right: 170,
};
