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

export const EndCard: React.FC<EndCardProps> = ({
	eyebrow,
	headlineTop,
	headlineBottom,
	backgroundSrc,
	fadeInSeconds,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

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
					padding: '0 90px',
				}}
			>
				<div
					style={{
						fontSize: 50,
						fontWeight: 600,
						letterSpacing: 13,
						textTransform: 'uppercase',
						opacity: 0.82,
						marginBottom: 54,
					}}
				>
					{eyebrow}
				</div>
				<div
					style={{
						fontSize: 132,
						fontWeight: 800,
						lineHeight: 1.04,
						letterSpacing: -1,
						textTransform: 'uppercase',
					}}
				>
					{headlineTop}
				</div>
				<div
					style={{
						fontSize: 132,
						fontWeight: 800,
						lineHeight: 1.04,
						letterSpacing: -1,
						textTransform: 'uppercase',
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
