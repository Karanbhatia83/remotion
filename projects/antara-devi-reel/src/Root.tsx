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
	matteSoftness: 1.5,
	// Flat plate -> contrast; grey skin -> saturation; cold key light -> sepia.
	subjectFilter:
		'contrast(1.1) saturate(1.2) sepia(0.16) saturate(1.1) brightness(1.03)',
	narratorScale: 1,
	haloStrength: 0,
	haloRadius: 520,
	haloCenterX: 540,
	haloCenterY: 620,
	haloColor: 'rgba(255,243,217,1)',
	glowIntensity: 0,
	glowRadius: 28,
	glowThreshold: 0.65,
	glowColor: '#fff6e2',
	vignetteStrength: 0,
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
	// Chroma-denoised plate (hqdn3d=2:4:3:10). Chroma lives at half resolution in
	// 4:2:0, so a 1-2px hair strand's chroma jitters frame to frame and flips
	// across the key threshold -- that is the hair flicker. Denoising chroma
	// before the key cut chattering boundary pixels by 61% and shrank the
	// semi-transparent boundary itself from 5998 to 5015 px, while retaining
	// 87.5% of facial detail.
	narratorSrc: 'narrator-library-denoised.mp4',
	// Halo is baked into this plate. It sits behind her, so baking is exactly
	// equivalent to drawing it live and costs nothing per frame.
	backgroundSrc: 'library-halo.jpg',
	keyer: 'chroma',
	// Measured off this plate: an even flatter olive than the temple shoot.
	keyColor: '#858c72',
	// Backing sits at a chroma distance of 0.0019 and is exceptionally uniform;
	// hair is 0.0207 and skin 0.0301, so 0.011 clears the backing with a wide
	// margin on both sides.
	// Hair measures 0.0207, backing 0.0019. Widening the feather to chase the
	// flicker made it worse (more semi-transparent pixels to wobble: 51 -> 89
	// chattering px), so these are back to the values that measured best.
	similarity: 0.011,
	smoothness: 0.006,
	spillSuppression: 0.5,
	// 0, not 1.5. The 3x3 chroma average costs 2.45x render time (3.63 vs 1.48
	// s/frame measured on an idle machine) and buys almost nothing here: the
	// denoised plate already takes chattering boundary pixels from 51 to 23,
	// and this only reaches 20.
	matteSoftness: 0,
	// This plate is badly flat: across 24 samples spanning the whole film the
	// subject's luma never leaves 55-217 of 0-255, and SATAVG sits at 14.5.
	// brightness/contrast here is an exact levels stretch of 0.235-0.850 onto
	// 0.02-0.98 -- not a taste adjustment. Saturation then only needs a nudge,
	// because the stretch already scales chroma by ~1.56x.
	// The brightness term lifts her face to where the glow() shader reached
	// (face luma 134.2 against the shader's 133.9) while leaving the contrast
	// term of the levels stretch intact, so local contrast holds at 2.27 --
	// above the ungraded 2.24 rather than below it. Lowering contrast to
	// brighten instead reached only 126 with local contrast 2.01, which is the
	// flatness this grade exists to remove. glow() itself is not used: it costs
	// roughly 3.1s/frame on software GL here, i.e. hours across 4292 frames.
	subjectFilter: 'brightness(1.019) contrast(1.694) saturate(1.10)',
	narratorScale: 1,
	// Head centre measured across 10 frames spanning the film: x 448, y 620,
	// moving by only ~30px, so a gradient this soft will not visibly drift.
	haloStrength: 0,
	haloRadius: 540,
	haloCenterX: 448,
	haloCenterY: 620,
	haloColor: 'rgba(255,244,222,1)',
	glowIntensity: 0,
	glowRadius: 18,
	glowThreshold: 0.4,
	glowColor: '#fff4de',
	vignetteStrength: 0.3,
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
