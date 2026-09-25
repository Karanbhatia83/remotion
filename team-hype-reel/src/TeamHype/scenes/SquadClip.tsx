import {Video} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Freeze, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {PopCaption} from '../components/PopCaption';
import {Sticker} from '../components/Sticker';
import {Viewfinder} from '../components/Viewfinder';
import {display} from '../fonts';
import {BAR, beatPulse, colors, outlined} from '../theme';

const REWIND_AT = 165;

const grade: React.CSSProperties = {
	width: '100%',
	height: '100%',
	filter: 'saturate(1.45) contrast(1.12) brightness(1.06)',
};

// Plays the footage in reverse, fast, like a tape rewinding.
const Rewind: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<AbsoluteFill style={{translate: `${Math.sin(frame * 3) * 24}px 0px`, scale: '1.08', filter: 'saturate(0.3) contrast(1.4)'}}>
				<Freeze frame={Math.max(0, Math.round(REWIND_AT - frame * 10))}>
					<Video src={staticFile('team.mp4')} muted objectFit="cover" style={grade} />
				</Freeze>
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 3px, transparent 3px, transparent 7px)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					top: 260 + ((frame * 97) % 1300),
					left: 0,
					right: 0,
					height: 60,
					backgroundColor: 'rgba(255,255,255,0.25)',
				}}
			/>
			<AbsoluteFill
				style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 10, scale: String(1 + beatPulse(frame, 5, 2) * 0.08)}}
			>
				<svg width={300} height={150} viewBox="0 0 200 100" style={{filter: `drop-shadow(0 8px 0 ${colors.ink})`}}>
					<polygon points="100,5 100,95 10,50" fill="white" stroke={colors.ink} strokeWidth={8} strokeLinejoin="round" />
					<polygon points="190,5 190,95 100,50" fill="white" stroke={colors.ink} strokeWidth={8} strokeLinejoin="round" />
				</svg>
				<div style={{fontFamily: display, fontSize: 180, color: 'white', ...outlined(14)}}>REWIND</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// 2-8s: the original clip with beat zooms, viewfinder UI, captions and stickers.
export const SquadClip: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{backgroundColor: colors.ink, overflow: 'hidden'}}>
			<Sequence name="Clip" durationInFrames={REWIND_AT}>
				<AbsoluteFill
					style={{
						scale: String(1.06 + beatPulse(frame) * 0.06),
						rotate: `${Math.sin(frame / 9) * 1.2}deg`,
					}}
				>
					<Video src={staticFile('team.mp4')} trimBefore={0} volume={0.35} objectFit="cover" style={grade} />
				</AbsoluteFill>
				<AbsoluteFill
					style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)'}}
				/>
				<Viewfinder />
				<Sequence name="Caption 1" durationInFrames={33} layout="none">
					<PopCaption text="meet the squad 👋" top={1320} />
				</Sequence>
				<Sequence name="Caption 2" from={33} durationInFrames={33} layout="none">
					<PopCaption text="the energy? UNMATCHED ⚡" top={1320} highlight={colors.cyan} />
				</Sequence>
				<Sequence name="Caption 3" from={66} durationInFrames={33} layout="none">
					<PopCaption text="waving like it's farewell day 😭" top={1320} highlight={colors.pink} />
				</Sequence>
				<Sequence name="Caption 4" from={99} durationInFrames={33} layout="none">
					<PopCaption text="main character energy ✨" top={1320} highlight={colors.lime} />
				</Sequence>
				<Sequence name="Caption 5" from={132} durationInFrames={33} layout="none">
					<PopCaption text="nobody's working today 😂" top={1320} />
				</Sequence>
				<Sequence name="Sticker wave" from={4} durationInFrames={40} layout="none">
					<Sticker emoji="👋" x={840} y={480} tilt={10} />
				</Sequence>
				<Sequence name="Sticker bolt" from={36} durationInFrames={34} layout="none">
					<Sticker emoji="⚡" x={230} y={560} tilt={-12} />
				</Sequence>
				<Sequence name="Sticker cry" from={70} durationInFrames={32} layout="none">
					<Sticker emoji="😭" x={850} y={1080} size={170} />
				</Sequence>
				<Sequence name="Sticker sparkle 1" from={100} durationInFrames={34} layout="none">
					<Sticker emoji="✨" x={220} y={420} tilt={-8} />
				</Sequence>
				<Sequence name="Sticker sparkle 2" from={106} durationInFrames={28} layout="none">
					<Sticker emoji="🌟" x={870} y={760} size={150} tilt={14} />
				</Sequence>
				<Sequence name="Sticker fire" from={134} durationInFrames={31} layout="none">
					<Sticker emoji="🔥" x={850} y={430} tilt={8} />
				</Sequence>
				<Sequence name="Sticker 100" from={142} durationInFrames={23} layout="none">
					<Sticker emoji="💯" x={220} y={1100} size={170} tilt={-10} />
				</Sequence>
			</Sequence>
			<Sequence name="Rewind" from={REWIND_AT} durationInFrames={15}>
				<Rewind />
			</Sequence>
			<AbsoluteFill
				style={{
					backgroundColor: 'white',
					pointerEvents: 'none',
					opacity: Math.max(
						interpolate(frame, [0, 8], [1, 0], {extrapolateRight: 'clamp'}),
						frame % BAR < 5 && frame < REWIND_AT ? 0.35 * (1 - (frame % BAR) / 5) : 0,
					),
				}}
			/>
		</AbsoluteFill>
	);
};
