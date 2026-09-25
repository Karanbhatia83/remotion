import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {colors} from '../theme';

const palette = [colors.yellow, colors.pink, colors.cyan, colors.lime, colors.orange, 'white'];

// A deterministic confetti burst from (originX, originY), starting at frame 0 of its Sequence.
export const Confetti: React.FC<{
	originX: number;
	originY: number;
	count?: number;
	seed?: string;
}> = ({originX, originY, count = 90, seed = 'confetti'}) => {
	const frame = useCurrentFrame();

	return (
		<>
			{new Array(count).fill(true).map((_, i) => {
				const angle = random(`${seed}-a-${i}`) * Math.PI * 2;
				const speed = 25 + random(`${seed}-s-${i}`) * 45;
				const vx = Math.cos(angle) * speed;
				const vy = Math.sin(angle) * speed - 30;
				const t = frame;
				const drag = 1 - Math.exp(-t / 14);
				const x = originX + vx * 14 * drag;
				const y = originY + vy * 14 * drag + 0.9 * t * t * 0.5;
				const w = 18 + random(`${seed}-w-${i}`) * 22;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x,
							top: y,
							width: w,
							height: w * 0.55,
							borderRadius: 4,
							backgroundColor: palette[i % palette.length],
							rotate: `${(random(`${seed}-r-${i}`) - 0.5) * 60 * t}deg`,
							scale: `1 ${Math.cos(t / 3 + i)}`,
						}}
					/>
				);
			})}
		</>
	);
};
