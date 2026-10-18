import React from 'react';
import {Composition, staticFile, type CalculateMetadataFunction} from 'remotion';
import {GreenScreenReel, type GreenScreenReelProps} from './GreenScreenReel';
import {EndCard, type EndCardProps} from './EndCard';
import {getVideoMetadata} from './get-video-metadata';

const TEMPLE_NARRATOR_SRC = 'narrator-green.mp4';

const templeProps: GreenScreenReelProps = {
	narratorSrc: TEMPLE_NARRATOR_SRC,
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
const calculateMetadata: CalculateMetadataFunction<GreenScreenReelProps> = async ({
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

const libraryProps: GreenScreenReelProps = {
	narratorSrc: 'narrator-library-green.mp4',
	backgroundSrc: 'library.jpg',
	keyer: 'chroma',
	// Measured off this plate: an even flatter olive than the temple shoot.
	keyColor: '#858c72',
	// Backing sits at a chroma distance of 0.0019 and is exceptionally uniform;
	// hair is 0.0207 and skin 0.0301, so 0.011 clears the backing with a wide
	// margin on both sides.
	similarity: 0.011,
	smoothness: 0.006,
	spillSuppression: 0.5,
	// This plate is badly flat: across 24 samples spanning the whole film the
	// subject's luma never leaves 55-217 of 0-255, and SATAVG sits at 14.5.
	// brightness/contrast here is an exact levels stretch of 0.235-0.850 onto
	// 0.02-0.98 -- not a taste adjustment. Saturation then only needs a nudge,
	// because the stretch already scales chroma by ~1.56x.
	subjectFilter: 'brightness(0.921) contrast(1.694) saturate(1.08)',
	narratorScale: 1,
};

const END_CARD_DURATION_SECONDS = 3;

const endCardProps: EndCardProps = {
	// Withholding the reason is the hook: the viewer supplies the meaning, and
	// "she'll know" implies something private between sender and recipient.
	eyebrow: 'Send it to her',
	headlineTop: "She'll know",
	headlineBottom: 'why',
	backgroundSrc: 'temple.jpg',
	// A short fade reads as polish; set to 0 for a hard cut.
	fadeInSeconds: 0.3,
};

export const RemotionRoot: React.FC = () => {
	return (
		<>
		<Composition
			id="DeviTempleReel"
			component={GreenScreenReel}
			// Overwritten by calculateMetadata; these are only the fallbacks shown
			// before the plate has been probed.
			durationInFrames={3699}
			fps={30}
			width={1080}
			height={1920}
			defaultProps={templeProps}
			calculateMetadata={calculateMetadata}
		/>
		<Composition
			id="LibraryReel"
			component={GreenScreenReel}
			durationInFrames={4292}
			fps={30}
			width={1080}
			height={1920}
			defaultProps={libraryProps}
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
