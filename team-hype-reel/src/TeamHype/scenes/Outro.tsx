import {Video} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Confetti} from '../components/Confetti';
import {Sunburst} from '../components/Sunburst';
import {body, display} from '../fonts';
import {beatPulse, colors, outlined} from '../theme';

const FINAL_HIT = 90;

// 16-20s: "one team, one vibe" + CTA, ending on the final hit of the track.
export const Outro: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const line1 = spring({frame, fps, config: {damping: 11, stiffness: 220}});
	const line2 = spring({frame: frame - 15, fps, config: {damping: 11, stiffness: 220}});
	const card = spring({frame: frame - 28, fps, config: {damping: 13, stiffness: 120}});
	const cta = spring({frame: frame - 60, fps, config: {damping: 10, stiffness: 180}});
	const hit = spring({frame: frame - FINAL_HIT, fps, config: {damping: 8, stiffness: 200}});
	const pulse = beatPulse(frame);

	return (
		<AbsoluteFill
			style={{
				background: `linear-gradient(${160 + frame}deg, ${colors.purple} 0%, ${colors.pink} 55%, ${colors.orange} 100%)`,
				overflow: 'hidden',
			}}
		>
			<Sunburst color="white" opacity={0.14} />
			<div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center', fontFamily: display, fontSize: 170, lineHeight: 1.02, color: 'white'}}>
				<div style={{scale: String(interpolate(line1, [0, 1], [2.4, 1])), opacity: line1 > 0 ? 1 : 0, rotate: '-3deg', ...outlined(14)}}>ONE TEAM.</div>
				<div
					style={{
						scale: String(interpolate(line2, [0, 1], [2.4, 1])),
						opacity: frame >= 15 ? 1 : 0,
						rotate: '2deg',
						color: colors.yellow,
						...outlined(14),
					}}
				>
					ONE VIBE.
				</div>
			</div>
			<div
				style={{
					position: 'absolute',
					left: 540 - 300,
					top: 580,
					width: 600,
					height: 820,
					borderRadius: 48,
					overflow: 'hidden',
					border: '12px solid white',
					boxShadow: `0 24px 0 ${colors.ink}`,
					translate: `0px ${(1 - card) * 1400}px`,
					rotate: `${(1 - card) * 30 - 4 + Math.sin(frame / 10) * 2}deg`,
					scale: String(1 + pulse * 0.03),
				}}
			>
				<Video src={staticFile('team.mp4')} trimBefore={105} loop muted objectFit="cover" style={{width: '100%', height: '100%', filter: 'saturate(1.5) contrast(1.1)'}} />
			</div>
			<div
				style={{
					position: 'absolute',
					top: 1520,
					width: '100%',
					display: 'flex',
					justifyContent: 'center',
				}}
			>
				<div
					style={{
						fontFamily: body,
						fontWeight: 900,
						fontSize: 62,
						color: colors.ink,
						backgroundColor: 'white',
						padding: '18px 44px',
						borderRadius: 999,
						border: `6px solid ${colors.ink}`,
						boxShadow: `0 10px 0 ${colors.ink}`,
						scale: String(cta * (1 + pulse * 0.04)),
						rotate: '-2deg',
					}}
				>
					tag your work bestie 👇
				</div>
			</div>
			<Sequence name="Confetti" from={FINAL_HIT} layout="none">
				<Confetti originX={540} originY={950} count={120} />
			</Sequence>
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingTop: 60}}>
				<div
					style={{
						fontFamily: display,
						fontSize: 190,
						lineHeight: 0.95,
						textAlign: 'center',
						color: colors.yellow,
						opacity: frame >= FINAL_HIT ? 1 : 0,
						scale: String(interpolate(hit, [0, 1], [3, 1])),
						rotate: '-7deg',
						...outlined(18),
					}}
				>
					SQUAD
					<br />
					GOALS 🔥
				</div>
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					backgroundColor: 'white',
					opacity: Math.max(
						interpolate(frame, [0, 6], [0.8, 0], {extrapolateRight: 'clamp'}),
						frame >= FINAL_HIT ? interpolate(frame, [FINAL_HIT, FINAL_HIT + 8], [1, 0], {extrapolateRight: 'clamp'}) : 0,
					),
				}}
			/>
		</AbsoluteFill>
	);
};
