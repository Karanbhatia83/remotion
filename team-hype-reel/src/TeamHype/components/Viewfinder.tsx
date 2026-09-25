import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {body} from '../fonts';

const Corner: React.FC<{style: React.CSSProperties}> = ({style}) => (
	<div style={{position: 'absolute', width: 90, height: 90, borderColor: 'white', borderStyle: 'solid', borderWidth: 0, ...style}} />
);

// Camcorder-style overlay: REC dot, running timecode and corner brackets.
export const Viewfinder: React.FC<{startFrame?: number}> = ({startFrame = 0}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const f = frame + startFrame;
	const secs = Math.floor(f / fps);
	const timecode = `00:00:${String(secs).padStart(2, '0')}:${String(f % fps).padStart(2, '0')}`;
	const label: React.CSSProperties = {
		position: 'absolute',
		top: 130,
		fontFamily: body,
		fontWeight: 800,
		fontSize: 44,
		color: 'white',
		textShadow: '0 3px 10px rgba(0,0,0,0.6)',
		letterSpacing: 2,
	};
	return (
		<AbsoluteFill>
			<Corner style={{left: 70, top: 100, borderLeftWidth: 8, borderTopWidth: 8}} />
			<Corner style={{right: 70, top: 100, borderRightWidth: 8, borderTopWidth: 8}} />
			<Corner style={{left: 70, bottom: 100, borderLeftWidth: 8, borderBottomWidth: 8}} />
			<Corner style={{right: 70, bottom: 100, borderRightWidth: 8, borderBottomWidth: 8}} />
			<div style={{...label, left: 110, display: 'flex', alignItems: 'center', gap: 14}}>
				<div
					style={{
						width: 30,
						height: 30,
						borderRadius: 15,
						backgroundColor: '#FF1F3D',
						opacity: Math.floor(frame / 15) % 2 === 0 ? 1 : 0.2,
					}}
				/>
				REC
			</div>
			<div style={{...label, right: 110}}>{timecode}</div>
		</AbsoluteFill>
	);
};
