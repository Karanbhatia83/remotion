import type React from 'react';

// 120 BPM at 30fps: one beat is exactly 15 frames, one bar is 60 frames.
export const FPS = 30;
export const BEAT = 15;
export const BAR = BEAT * 4;

export const colors = {
	yellow: '#FFE600',
	pink: '#FF2E93',
	cyan: '#00E5FF',
	lime: '#B6FF00',
	orange: '#FF7A00',
	purple: '#7B2CFF',
	ink: '#0B0B12',
};

// 1 on the beat, decaying quickly until the next beat
export const beatPulse = (frame: number, every = BEAT, sharpness = 4) =>
	Math.exp(-(((frame % every) + every) % every) / sharpness);

export const outlined = (width: number, color = colors.ink): React.CSSProperties => ({
	WebkitTextStroke: `${width}px ${color}`,
	paintOrder: 'stroke fill',
	textShadow: `0 ${width}px 0 ${color}`,
});
