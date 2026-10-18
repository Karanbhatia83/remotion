import React from 'react';
import {Composition, staticFile, type CalculateMetadataFunction} from 'remotion';
import {DeviTempleReel, type DeviTempleReelProps} from './DeviTempleReel';
import {EndCard, type EndCardProps} from './EndCard';
import {getVideoMetadata} from './get-video-metadata';

const NARRATOR_SRC = 'narrator-green.mp4';

const defaultProps: DeviTempleReelProps = {
	narratorSrc: NARRATOR_SRC,
	backgroundSrc: 'temple.jpg',
	keyer: 'chroma',
	// Measured off the plate, not guessed: the backing is a desaturated olive,
	// nowhere near #00ff00.
	keyColor: '#8ea371',
	// Backing sits at a chroma distance of ~0.016, skin at ~0.092. 0.042 clears
	// the backing including its dim corners with roughly 2x headroom either way.
	similarity: 0.042,
	smoothness: 0.018,
	spillSuppression: 0.5,
	// Flat plate -> contrast; grey skin -> saturation; cold key light -> sepia.
	subjectFilter:
		'contrast(1.1) saturate(1.2) sepia(0.16) saturate(1.1) brightness(1.03)',
	narratorScale: 1,
};

// Duration and frame rate come from the plate itself, so swapping the file in
// public/ is all it takes to re-cut this.
const calculateMetadata: CalculateMetadataFunction<DeviTempleReelProps> = async ({
	props,
}) => {
	const {durationInSeconds, fps} = await getVideoMetadata(
		staticFile(props.narratorSrc),
	);
	const roundedFps = Math.round(fps);

	return {
		fps: roundedFps,
		durationInFrames: Math.round(durationInSeconds * roundedFps),
	};
};

const END_CARD_DURATION_SECONDS = 3;

const endCardProps: EndCardProps = {
	eyebrow: 'Share this with',
	headlineTop: 'the woman',
	headlineBottom: 'you cherish',
	backgroundSrc: 'temple.jpg',
	// A short fade reads as polish; set to 0 for a hard cut.
	fadeInSeconds: 0.3,
};

export const RemotionRoot: React.FC = () => {
	return (
		<>
		<Composition
			id="DeviTempleReel"
			component={DeviTempleReel}
			// Overwritten by calculateMetadata; these are only the fallbacks shown
			// before the plate has been probed.
			durationInFrames={3699}
			fps={30}
			width={1080}
			height={1920}
			defaultProps={defaultProps}
			calculateMetadata={calculateMetadata}
		/>
		<Composition
			id="EndCard"
			component={EndCard}
			durationInFrames={END_CARD_DURATION_SECONDS * 30}
			fps={30}
			width={1080}
			height={1920}
			defaultProps={endCardProps}
		/>
		</>
	);
};
