import React from 'react';
import {AbsoluteFill} from 'remotion';
import {rng} from './loop';
import {useFonts} from './fonts';

// A 1920x1080 tile of handwritten "राम", laid on a grid whose rows divide the
// tile height exactly, so it tiles seamlessly when scrolled with the paper.
// Rendered once to public/plates/ram-tile.png.
const W = 1920;
const H = 1080;
const ROWS = 24;
const COLS = 23;
const CH = H / ROWS;      // 45
const CW = W / COLS;      // ~83.5

const r = rng(108108);
const WORDS = Array.from({length: ROWS * COLS}, (_, i) => {
  const row = Math.floor(i / COLS), col = i % COLS;
  const stagger = row % 2 ? CW / 2 : 0;
  return {
    x: col * CW + stagger + CW / 2 + (r() - 0.5) * 14,
    y: row * CH + CH / 2 + (r() - 0.5) * 4,
    size: 27 + r() * 7,
    rot: (r() - 0.5) * 12,
    op: 0.55 + r() * 0.4,
    ink: r() < 0.7 ? '#3a1c08' : '#5c1a10',
  };
});

export const RamTile: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{background: 'transparent', overflow: 'hidden'}}>
      {WORDS.map((w, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', left: w.x, top: w.y, translate: '-50% -50%', rotate: `${w.rot}deg`,
            fontFamily: "'Kalam', sans-serif", fontWeight: 700, fontSize: w.size, lineHeight: 1, color: w.ink, opacity: w.op,
            whiteSpace: 'nowrap',
          }}
        >
          राम
        </div>
      ))}
    </AbsoluteFill>
  );
};
