import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';

// An emoji sticker that springs in, wiggles, and pops out at the end of its Sequence.
export const Sticker: React.FC<{
	emoji: string;
	x: number;
	y: number;
	size?: number;
	tilt?: number;
}> = ({emoji, x, y, size = 190, tilt = 0}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const enter = spring({frame, fps, config: {damping: 8, stiffness: 180}});
	const exit = spring({frame: frame - (durationInFrames - 6), fps, config: {damping: 200}, durationInFrames: 6});

	return (
		<div
			style={{
				position: 'absolute',
				left: x - size / 2,
				top: y - size / 2,
				width: size,
				height: size,
				fontSize: size * 0.82,
				lineHeight: `${size}px`,
				textAlign: 'center',
				scale: String(Math.max(0, enter - exit)),
				rotate: `${tilt + Math.sin(frame / 4) * 12}deg`,
				filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.45))',
			}}
		>
			{emoji}
		</div>
	);
};
