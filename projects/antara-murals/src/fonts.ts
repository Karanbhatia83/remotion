import {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

// Real Devanagari fonts (Google Fonts, bundled in public/fonts). Loaded with
// FontFace + delayRender so no frame renders before the glyphs are available.
const DEV = 'U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+25CC, U+A830-A839, U+A8E0-A8FF';
const LAT = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const FONTS: Array<[string, string, string]> = [
  ['Kalam', 'fonts/Kalam-devanagari.woff2', DEV],
  ['Kalam', 'fonts/Kalam-latin.woff2', LAT],
  ['Rozha One', 'fonts/RozhaOne-devanagari.woff2', DEV],
  ['Rozha One', 'fonts/RozhaOne-latin.woff2', LAT],
  ['Tiro Devanagari Hindi', 'fonts/TiroDevanagariHindi-devanagari.woff2', DEV],
  ['Tiro Devanagari Hindi', 'fonts/TiroDevanagariHindi-latin.woff2', LAT],
  ['Yatra One', 'fonts/YatraOne-devanagari.woff2', DEV],
  ['Yatra One', 'fonts/YatraOne-latin.woff2', LAT],
];

let pending: Promise<void> | null = null;
export const loadFonts = () => {
  if (!pending) {
    pending = Promise.all(
      FONTS.map(([family, file, range]) => {
        const face = new FontFace(family, `url(${staticFile(file)})`, {unicodeRange: range, weight: family === 'Kalam' ? '700' : '400'});
        return face.load().then((f) => { document.fonts.add(f); });
      }),
    ).then(() => undefined);
  }
  return pending;
};

export const useFonts = () => {
  const [handle] = useState(() => delayRender('Devanagari fonts'));
  useEffect(() => {
    loadFonts().then(() => continueRender(handle)).catch((e) => { console.error(e); continueRender(handle); });
  }, [handle]);
};
