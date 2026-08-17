import { useEffect, useState } from 'react';
import { staticFile, delayRender, continueRender } from 'remotion';

/**
 * Fonts are self-hosted from public/fonts rather than pulled from the Google
 * Fonts CDN at render time: the render browser has no trusted route to
 * fonts.gstatic.com, and a render that depends on the network is fragile
 * regardless.
 *
 * delayRender has to be called from inside a component — at module scope it
 * runs during webpack bootstrap, before anything has mounted — so this is a
 * hook rather than a top-level side effect.
 */

const LATIN =
  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';

const DEVANAGARI =
  'U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B09';

export const MUKTA = 'Mukta';
export const POPPINS = 'Poppins';

type Face = {
  family: string;
  weight: string;
  file: string;
  unicodeRange: string;
};

const FACES: Face[] = [
  { family: MUKTA, weight: '600', file: 'Mukta-600-latin.woff2', unicodeRange: LATIN },
  { family: MUKTA, weight: '600', file: 'Mukta-600-devanagari.woff2', unicodeRange: DEVANAGARI },
  { family: MUKTA, weight: '700', file: 'Mukta-700-latin.woff2', unicodeRange: LATIN },
  { family: MUKTA, weight: '700', file: 'Mukta-700-devanagari.woff2', unicodeRange: DEVANAGARI },
  { family: MUKTA, weight: '800', file: 'Mukta-800-latin.woff2', unicodeRange: LATIN },
  { family: MUKTA, weight: '800', file: 'Mukta-800-devanagari.woff2', unicodeRange: DEVANAGARI },
  { family: POPPINS, weight: '500', file: 'Poppins-500-latin.woff2', unicodeRange: LATIN },
  { family: POPPINS, weight: '600', file: 'Poppins-600-latin.woff2', unicodeRange: LATIN },
];

const loadAll = () =>
  Promise.all(
    FACES.map(async ({ family, weight, file, unicodeRange }) => {
      const face = new FontFace(
        family,
        `url(${staticFile(`fonts/${file}`)}) format('woff2')`,
        { weight, unicodeRange, style: 'normal' },
      );
      document.fonts.add(await face.load());
    }),
  );

/** Holds the render until every face is ready, so no frame captures in a fallback. */
export const useFonts = () => {
  const [handle] = useState(() => delayRender('Loading local fonts'));

  useEffect(() => {
    loadAll()
      .then(() => continueRender(handle))
      .catch((err) => {
        // Never hang the render on a font problem — fail loudly, keep going.
        console.error('Font loading failed:', err);
        continueRender(handle);
      });
  }, [handle]);
};
