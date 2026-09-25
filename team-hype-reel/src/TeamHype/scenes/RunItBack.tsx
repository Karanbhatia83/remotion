import {Video} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {PopCaption} from '../components/PopCaption';
import {display} from '../fonts';
import {BEAT, beatPulse, colors} from '../theme';

const Tile: React.FC<{
	at: number;
	x: number;
	y: number;
	border: string;
	filter: string;
	trimBefore: number;
	beatOffset: number;
}> = ({at, x, y, border, filter, trimBefore, beatOffset}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const enter = spring({frame: frame - at, fps, config: {damping: 10, stiffness: 170}});
	// Alternate tiles bounce on alternating beats
	const bounce = beatPulse(frame - beatOffset * BEAT, BEAT * 2, 5);
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: 488,
				height: 868,
				borderRadius: 36,
				border: `10px solid ${border}`,
				overflow: 'hidden',
				boxShadow: `0 20px 0 ${colors.ink}`,
				scale: String(enter * (1 + bounce * 0.05)),
				rotate: `${(1 - enter) * 25 + Math.sin((frame + at * 5) / 10) * 2}deg`,
			}}
		>
			<Video
				src={staticFile('team.mp4')}
				trimBefore={trimBefore}
				playbackRate={1.5}
				loop
				muted
				objectFit="cover"
				style={{width: '100%', height: '100%', filter}}
			/>
		</div>
	);
};

// 8-12s: four remixed copies of the clip in a bouncing grid.
export const RunItBack: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const badge = spring({frame: frame - 14, fps, config: {damping: 9, stiffness: 160}});

	return (
		<AbsoluteFill
			style={{
				background: `repeating-linear-gradient(135deg, #1B0038 0px, #1B0038 60px, #2A0055 60px, #2A0055 120px)`,
				backgroundPosition: `${frame * 4}px 0px`,
				overflow: 'hidden',
			}}
		>
			<Tile at={0} x={40} y={80} border={colors.pink} filter="saturate(1.7) contrast(1.1)" trimBefore={0} beatOffset={0} />
			<Tile at={4} x={552} y={80} border={colors.cyan} filter="hue-rotate(160deg) saturate(2)" trimBefore={45} beatOffset={1} />
			<Tile at={8} x={40} y={972} border={colors.lime} filter="grayscale(1) contrast(1.5)" trimBefore={90} beatOffset={1} />
			<Tile at={12} x={552} y={972} border={colors.yellow} filter="sepia(0.6) hue-rotate(-40deg) saturate(2.4)" trimBefore={30} beatOffset={0} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<div
					style={{
						width: 520,
						height: 520,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						scale: String(badge * (1 + beatPulse(frame) * 0.07)),
						rotate: `${-12 + Math.sin(frame / 8) * 5}deg`,
					}}
				>
					<svg viewBox="-100 -100 200 200" style={{position: 'absolute', width: '100%', height: '100%', rotate: `${frame * 1.5}deg`}}>
						<polygon
							points={new Array(32)
								.fill(0)
								.map((_, i) => {
									const r = i % 2 === 0 ? 98 : 80;
									const a = (i / 32) * Math.PI * 2;
									return `${Math.cos(a) * r},${Math.sin(a) * r}`;
								})
								.join(' ')}
							fill={colors.yellow}
							stroke={colors.ink}
							strokeWidth={6}
						/>
					</svg>
					<div style={{fontFamily: display, fontSize: 120, lineHeight: 0.95, textAlign: 'center', color: colors.ink, position: 'relative'}}>
						RUN IT
						<br />
						BACK 🔁
					</div>
				</div>
			</AbsoluteFill>
			<Sequence name="Caption" from={40} durationInFrames={80} layout="none">
				<PopCaption text="tell me your team is fun without telling me 🤫" top={1480} fontSize={74} highlight={colors.pink} />
			</Sequence>
			<AbsoluteFill
				style={{
					backgroundColor: 'white',
					opacity: interpolate(frame, [0, 6], [0.9, 0], {extrapolateRight: 'clamp'}),
				}}
			/>
		</AbsoluteFill>
	);
};
