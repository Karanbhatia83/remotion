import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {body} from '../fonts';
import {colors, outlined} from '../theme';

// TikTok-style caption: words pop in one after another, the newest word is highlighted.
export const PopCaption: React.FC<{
	text: string;
	top: number;
	wordGap?: number;
	fontSize?: number;
	highlight?: string;
}> = ({text, top, wordGap = 4, fontSize = 84, highlight = colors.yellow}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const words = text.split(' ');
	const activeIndex = Math.min(words.length - 1, Math.floor(frame / wordGap));
	const exit = spring({frame: frame - (durationInFrames - 5), fps, config: {damping: 200}, durationInFrames: 5});

	return (
		<div
			style={{
				position: 'absolute',
				top,
				left: 80,
				right: 80,
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: 'center',
				columnGap: 34,
				rowGap: 4,
				scale: String(1 - exit * 0.3),
				opacity: 1 - exit,
			}}
		>
			{words.map((word, i) => {
				const local = frame - i * wordGap;
				const enter = spring({frame: local, fps, config: {damping: 11, stiffness: 260}});
				const isActive = i === activeIndex;
				return (
					<span
						key={i}
						style={{
							fontFamily: body,
							fontWeight: 900,
							fontSize,
							lineHeight: 1.15,
							textTransform: 'uppercase',
							color: isActive ? highlight : 'white',
							opacity: local < 0 ? 0 : 1,
							scale: String((isActive ? 1.12 : 1) * (0.4 + 0.6 * enter)),
							translate: `0px ${(1 - enter) * 30}px`,
							rotate: isActive ? '-3deg' : '0deg',
							...outlined(14),
						}}
					>
						{word}
					</span>
				);
			})}
		</div>
	);
};
