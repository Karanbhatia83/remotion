import {Video} from '@remotion/media';
import {colorKey} from '@remotion/effects/color-key';
import React from 'react';
import {AbsoluteFill, CanvasImage, staticFile} from 'remotion';
import {chromaKey} from './effects/chroma-key';

export type DeviTempleReelProps = {
	/** Green-screen plate, relative to `public/`. */
	readonly narratorSrc: string;
	/** Temple plate, relative to `public/`. */
	readonly backgroundSrc: string;
	/**
	 * `chroma` keys on hue alone and is the one that works on this footage.
	 * `colorKey` is `@remotion/effects`' RGB-distance keyer, kept so the two can
	 * be compared side by side in Studio. See `src/effects/chroma-key.ts`.
	 */
	readonly keyer: 'chroma' | 'colorKey';
	/** Colour of the backing, measured off the plate. */
	readonly keyColor: string;
	/** Everything closer to the key colour than this goes transparent. */
	readonly similarity: number;
	/** Width of the feathered band at the edge of the matte. */
	readonly smoothness: number;
	/** How hard to pull the key colour out of the pixels that survive. */
	readonly spillSuppression: number;
	/** Grade applied to the keyed subject so it sits in the lamplight. */
	readonly subjectFilter: string;
	/** Uniform scale of the narrator. 1 = fills the frame as shot. */
	readonly narratorScale: number;
};

export const DeviTempleReel: React.FC<DeviTempleReelProps> = ({
	narratorSrc,
	backgroundSrc,
	keyer,
	keyColor,
	similarity,
	smoothness,
	spillSuppression,
	subjectFilter,
	narratorScale,
}) => {
	return (
		<AbsoluteFill name="Composite" style={{backgroundColor: '#000000'}}>
			<CanvasImage
				name="Temple"
				src={staticFile(backgroundSrc)}
				fit="cover"
				style={{width: '100%', height: '100%'}}
			/>
			<AbsoluteFill
				name="Narrator"
				style={{scale: narratorScale, transformOrigin: 'center center'}}
			>
				<Video
					src={staticFile(narratorSrc)}
					objectFit="cover"
					effects={[
						keyer === 'chroma'
							? chromaKey({
									keyColor,
									similarity,
									smoothness,
									spillSuppression,
								})
							: colorKey({
									keyColor,
									similarity,
									smoothness,
									spillSuppression,
								}),
					]}
					style={{
						width: '100%',
						height: '100%',
						filter: subjectFilter,
					}}
				/>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
