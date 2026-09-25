import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Sunburst} from '../components/Sunburst';
import {body, display} from '../fonts';
import {colors, outlined} from '../theme';

const Slam: React.FC<{
	at: number;
	children: React.ReactNode;
	style: React.CSSProperties;
	tilt: number;
}> = ({at, children, style, tilt}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - at, fps, config: {damping: 12, stiffness: 220}});
	return (
		<div
			style={{
				opacity: frame < at ? 0 : 1,
				scale: String(interpolate(s, [0, 1], [2.6, 1])),
				rotate: `${interpolate(s, [0, 1], [tilt * 3, tilt])}deg`,
				...style,
			}}
		>
			{children}
		</div>
	);
};

// 0-2s: text slams on 8th notes over the build-up, then zooms into the drop.
export const Hook: React.FC = () => {
	const frame = useCurrentFrame();
	const slams = [0, 8, 23, 38];
	const last = Math.max(...slams.filter((s) => s <= frame));
	const shake = Math.exp(-(frame - last) / 3) * 18;

	return (
		<AbsoluteFill
			style={{
				background: `linear-gradient(160deg, ${colors.pink} 0%, ${colors.orange} 100%)`,
				overflow: 'hidden',
			}}
		>
			<Sunburst color={colors.yellow} />
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					flexDirection: 'column',
					gap: 10,
					translate: `${Math.sin(frame * 2.1) * shake}px ${Math.cos(frame * 1.7) * shake}px`,
					scale: String(
						interpolate(frame, [50, 60], [1, 4], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.in(Easing.cubic),
						}),
					),
					opacity: interpolate(frame, [54, 60], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
				}}
			>
				<Slam at={0} tilt={-6} style={{fontFamily: display, fontSize: 150, color: colors.yellow, ...outlined(12)}}>
					POV:
				</Slam>
				<Slam at={8} tilt={3} style={{fontFamily: body, fontWeight: 900, fontSize: 96, color: 'white', ...outlined(12)}}>
					you work with
				</Slam>
				<Slam
					at={23}
					tilt={-4}
					style={{fontFamily: display, fontSize: 230, lineHeight: 1.05, color: 'white', ...outlined(16)}}
				>
					THE BEST
				</Slam>
				<Slam
					at={38}
					tilt={4}
					style={{
						fontFamily: display,
						fontSize: 170,
						lineHeight: 1.1,
						whiteSpace: 'nowrap',
						color: colors.ink,
						backgroundColor: colors.yellow,
						padding: '0 40px',
						borderRadius: 24,
						boxShadow: `0 16px 0 ${colors.ink}`,
					}}
				>
					TEAM EVER 🔥
				</Slam>
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					backgroundColor: 'white',
					opacity: interpolate(frame, [55, 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
				}}
			/>
		</AbsoluteFill>
	);
};
