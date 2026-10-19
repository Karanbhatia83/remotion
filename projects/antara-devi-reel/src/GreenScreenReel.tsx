import {Video} from '@remotion/media';
import {colorKey} from '@remotion/effects/color-key';
import {glow} from '@remotion/effects/glow';
import React from 'react';
import {AbsoluteFill, CanvasImage, staticFile} from 'remotion';
import {chromaKey} from './effects/chroma-key';

export type GreenScreenReelProps = {
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
	/** Radius in texels over which chroma is averaged before deciding alpha. */
	readonly matteSoftness: number;
	/** Grade applied to the keyed subject so it sits in the lamplight. */
	readonly subjectFilter: string;
	/** Uniform scale of the narrator. 1 = fills the frame as shot. */
	readonly narratorScale: number;
	/**
	 * Soft light placed *behind* the subject, centred on the head. Drawn between
	 * background and subject so it reads as light in the room rather than a
	 * shape laid over her. 0 disables it.
	 */
	readonly haloStrength: number;
	readonly haloRadius: number;
	readonly haloCenterX: number;
	readonly haloCenterY: number;
	readonly haloColor: string;
	/**
	 * Bloom on the subject. Only pixels above `glowThreshold` bloom, so the
	 * light comes off her own highlights the way a diffusion filter behaves,
	 * instead of brightening the whole figure. 0 disables it.
	 */
	readonly glowIntensity: number;
	readonly glowRadius: number;
	readonly glowThreshold: number;
	readonly glowColor: string;
	/**
	 * Gentle darkening of the frame edges. Not decoration: it gives the halo
	 * something to separate against on a bright background, and pulls the eye
	 * to her. 0 disables it.
	 */
	readonly vignetteStrength: number;
};

export const GreenScreenReel: React.FC<GreenScreenReelProps> = ({
	narratorSrc,
	backgroundSrc,
	keyer,
	keyColor,
	similarity,
	smoothness,
	spillSuppression,
	matteSoftness,
	subjectFilter,
	narratorScale,
	haloStrength,
	haloRadius,
	haloCenterX,
	haloCenterY,
	haloColor,
	glowIntensity,
	glowRadius,
	glowThreshold,
	glowColor,
	vignetteStrength,
}) => {
	const effects = [
		keyer === 'chroma'
			? chromaKey({
					keyColor,
					similarity,
					smoothness,
					spillSuppression,
					matteSoftness,
				})
			: colorKey({keyColor, similarity, smoothness, spillSuppression}),
	];

	if (glowIntensity > 0) {
		effects.push(
			glow({
				radius: glowRadius,
				intensity: glowIntensity,
				threshold: glowThreshold,
				color: glowColor,
			}),
		);
	}
	return (
		<AbsoluteFill name="Composite" style={{backgroundColor: '#000000'}}>
			<CanvasImage
				name="Temple"
				src={staticFile(backgroundSrc)}
				fit="cover"
				style={{width: '100%', height: '100%'}}
			/>
			{haloStrength > 0 ? (
				<AbsoluteFill name="Halo">
					<div
						style={{
							position: 'absolute',
							left: haloCenterX - haloRadius,
							top: haloCenterY - haloRadius,
							width: haloRadius * 2,
							height: haloRadius * 2,
							borderRadius: '50%',
							background: `radial-gradient(circle, ${haloColor} 0%, transparent 72%)`,
							opacity: haloStrength,
							filter: 'blur(40px)',
						}}
					/>
				</AbsoluteFill>
			) : null}
			<AbsoluteFill
				name="Narrator"
				style={{scale: narratorScale, transformOrigin: 'center center'}}
			>
				<Video
					src={staticFile(narratorSrc)}
					objectFit="cover"
					effects={effects}
					style={{
						width: '100%',
						height: '100%',
						filter: subjectFilter,
					}}
				/>
			</AbsoluteFill>
			{vignetteStrength > 0 ? (
				<AbsoluteFill
					name="Vignette"
					style={{
						background: `radial-gradient(ellipse 72% 58% at 50% 42%, rgba(0,0,0,0) 45%, rgba(0,0,0,${vignetteStrength}) 100%)`,
					}}
				/>
			) : null}
		</AbsoluteFill>
	);
};
