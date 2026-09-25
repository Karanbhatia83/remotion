import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

// Rotating rays behind titles.
export const Sunburst: React.FC<{color: string; opacity?: number}> = ({color, opacity = 0.22}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{overflow: 'hidden', justifyContent: 'center', alignItems: 'center'}}>
			<div
				style={{
					width: 3200,
					height: 3200,
					flexShrink: 0,
					opacity,
					rotate: `${frame * 0.8}deg`,
					background: `repeating-conic-gradient(${color} 0deg 10deg, transparent 10deg 20deg)`,
				}}
			/>
		</AbsoluteFill>
	);
};
