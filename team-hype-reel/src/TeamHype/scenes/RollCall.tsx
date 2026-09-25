import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {body, display} from '../fonts';
import {beatPulse, colors, outlined} from '../theme';

const W = 1080;
const H = 1920;

// Face position (fx, fy) and label position (tx, ty) as fractions of the frame.
const NameTag: React.FC<{
	at: number;
	fx: number;
	fy: number;
	tx: number;
	ty: number;
	label: string;
	bg: string;
	fg: string;
	fontSize?: number;
}> = ({at, fx, fy, tx, ty, label, bg, fg, fontSize = 50}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const local = frame - at;
	const line = interpolate(local, [0, 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const pop = spring({frame: local - 3, fps, config: {damping: 9, stiffness: 200}});
	const ring = spring({frame: local, fps, config: {damping: 12}});
	const [x1, y1, x2, y2] = [fx * W, fy * H, tx * W, ty * H];
	if (local < 0) return null;

	return (
		<>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
				<circle cx={x1} cy={y1} r={85 * ring} fill="none" stroke={bg} strokeWidth={9} strokeDasharray="22 12" style={{rotate: `${frame * 3}deg`, transformOrigin: `${x1}px ${y1}px`}} />
				<line x1={x1} y1={y1} x2={x1 + (x2 - x1) * line} y2={y1 + (y2 - y1) * line} stroke={bg} strokeWidth={9} strokeLinecap="round" />
			</svg>
			<div
				style={{
					position: 'absolute',
					left: x2,
					top: y2,
					translate: '-50% -50%',
					scale: String(pop),
					rotate: `${(fx < tx ? 1 : -1) * 3}deg`,
					backgroundColor: bg,
					color: fg,
					fontFamily: body,
					fontWeight: 900,
					fontSize,
					padding: '10px 28px',
					borderRadius: 999,
					whiteSpace: 'nowrap',
					border: `6px solid ${colors.ink}`,
					boxShadow: `0 10px 0 ${colors.ink}`,
				}}
			>
				{label}
			</div>
		</>
	);
};

// 12-16s: freeze-frame "roll call" with animated name tags.
export const RollCall: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const title = spring({frame: frame - 84, fps, config: {damping: 10, stiffness: 180}});

	return (
		<AbsoluteFill style={{backgroundColor: colors.ink, overflow: 'hidden'}}>
			<AbsoluteFill
				style={{
					scale: String(interpolate(frame, [0, 120], [1.02, 1.12]) + beatPulse(frame) * 0.012),
					transformOrigin: '58% 40%',
				}}
			>
				<Img
					src={staticFile('freeze.jpg')}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						filter: `grayscale(${interpolate(frame, [0, 14], [1, 0], {extrapolateRight: 'clamp'})}) saturate(1.4) contrast(1.1) brightness(0.92)`,
					}}
				/>
				<NameTag at={12} fx={0.58} fy={0.5} tx={0.5} ty={0.66} label="CHIEF WAVING OFFICER 👋" bg={colors.yellow} fg={colors.ink} fontSize={58} />
				<NameTag at={27} fx={0.54} fy={0.32} tx={0.62} ty={0.135} label="HYPE MAN 📣" bg={colors.pink} fg="white" />
				<NameTag at={42} fx={0.27} fy={0.33} tx={0.36} ty={0.205} label="SNACK SUPPLIER 🍕" bg={colors.cyan} fg={colors.ink} fontSize={44} />
				<NameTag at={57} fx={0.83} fy={0.355} tx={0.73} ty={0.275} label="THE CHILL ONE 😎" bg={colors.lime} fg={colors.ink} fontSize={42} />
				<NameTag at={72} fx={0.04} fy={0.365} tx={0.25} ty={0.45} label="THE OG 👑" bg={colors.orange} fg="white" fontSize={42} />
			</AbsoluteFill>
			<AbsoluteFill style={{border: '26px solid white', boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5)'}} />
			<div
				style={{
					position: 'absolute',
					top: 1560,
					width: '100%',
					textAlign: 'center',
					fontFamily: display,
					fontSize: 128,
					whiteSpace: 'nowrap',
					color: 'white',
					scale: String(title),
					rotate: '-4deg',
					...outlined(14),
				}}
			>
				MEET THE <span style={{color: colors.yellow}}>LEGENDS</span> 🏆
			</div>
			<AbsoluteFill
				style={{
					backgroundColor: 'white',
					opacity: interpolate(frame, [0, 10], [1, 0], {extrapolateRight: 'clamp'}),
				}}
			/>
		</AbsoluteFill>
	);
};
