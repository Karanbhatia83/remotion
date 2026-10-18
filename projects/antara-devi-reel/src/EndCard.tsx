import React from 'react';
import {
	AbsoluteFill,
	CanvasImage,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export type EndCardProps = {
	/** Small line above the headline. */
	readonly eyebrow: string;
	/** The two headline lines, set large. */
	readonly headlineTop: string;
	readonly headlineBottom: string;
	/** Background plate, relative to `public/`. */
	readonly backgroundSrc: string;
	/** Seconds of fade-in. 0 = hard cut, fully static. */
	readonly fadeInSeconds: number;
};

const CREAM = '#F6E7C8';

// Inter Display ExtraBold uppercase renders at ~0.60 x fontSize per character
// (calibrated: "YOU CHERISH", 11 chars at 132px, measured 866px of ink).
// Size the headline off the longest line so copy can change without overflowing.
const SIDE_PADDING = 90;
const USABLE_WIDTH = 1080 - SIDE_PADDING * 2;
// 0.60 is the measured average; 0.64 buys a safety margin so a wide glyph run
// never pushes a line past the edge and triggers a wrap.
const CHAR_WIDTH_RATIO = 0.64;
const MAX_HEADLINE_SIZE = 150;
const MIN_HEADLINE_SIZE = 76;

const headlineFontSize = (lines: string[]): number => {
	const longest = Math.max(...lines.map((l) => l.length), 1);
	const fitted = USABLE_WIDTH / (longest * CHAR_WIDTH_RATIO);
	return Math.max(MIN_HEADLINE_SIZE, Math.min(MAX_HEADLINE_SIZE, fitted));
};

// The eyebrow is tracked out wide, so letter-spacing dominates its width.
const EYEBROW_MAX_SIZE = 50;
const EYEBROW_TRACKING_RATIO = 0.26;

const eyebrowFontSize = (text: string): number => {
	const chars = Math.max(text.length, 1);
	const fitted =
		USABLE_WIDTH / (chars * (0.52 + EYEBROW_TRACKING_RATIO));
	return Math.min(EYEBROW_MAX_SIZE, fitted);
};

export const EndCard: React.FC<EndCardProps> = ({
	eyebrow,
	headlineTop,
	headlineBottom,
	backgroundSrc,
	fadeInSeconds,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const fontSize = headlineFontSize([headlineTop, headlineBottom]);
	const eyebrowSize = eyebrowFontSize(eyebrow);

	const opacity =
		fadeInSeconds <= 0
			? 1
			: interpolate(frame, [0, fadeInSeconds * fps], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				});

	return (
		<AbsoluteFill name="End card" style={{backgroundColor: '#140b06'}}>
			{/* Same temple plate as the reel, pushed down and defocused so the
			    type carries the frame. */}
			<CanvasImage
				name="Plate"
				src={staticFile(backgroundSrc)}
				fit="cover"
				style={{
					width: '100%',
					height: '100%',
					filter: 'brightness(0.34) saturate(1.1) blur(6px)',
				}}
			/>
			{/* Warm centre glow, so the lamplight still reads behind the words. */}
			<AbsoluteFill
				name="Glow"
				style={{
					background:
						'radial-gradient(60% 42% at 50% 46%, rgba(255,176,74,0.20) 0%, rgba(20,11,6,0) 70%)',
				}}
			/>
			<AbsoluteFill
				name="Type"
				style={{
					opacity,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					textAlign: 'center',
					fontFamily: '"Inter Display", "Inter", sans-serif',
					color: CREAM,
					padding: `0 ${SIDE_PADDING}px`,
				}}
			>
				<div
					style={{
						fontSize: eyebrowSize,
						fontWeight: 600,
						letterSpacing: eyebrowSize * EYEBROW_TRACKING_RATIO,
						whiteSpace: 'nowrap',
						textTransform: 'uppercase',
						opacity: 0.82,
						marginBottom: 54,
					}}
				>
					{eyebrow}
				</div>
				<div
					style={{
						fontSize,
						fontWeight: 800,
						lineHeight: 1.04,
						letterSpacing: -1,
						textTransform: 'uppercase',
						whiteSpace: 'nowrap',
					}}
				>
					{headlineTop}
				</div>
				<div
					style={{
						fontSize,
						fontWeight: 800,
						lineHeight: 1.04,
						letterSpacing: -1,
						textTransform: 'uppercase',
						whiteSpace: 'nowrap',
					}}
				>
					{headlineBottom}
				</div>
				<div
					style={{
						marginTop: 60,
						width: 150,
						height: 3,
						backgroundColor: CREAM,
						opacity: 0.5,
					}}
				/>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
