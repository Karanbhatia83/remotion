import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';

export type VideoMetadata = {
	durationInSeconds: number;
	fps: number;
};

export const getVideoMetadata = async (
	src: string,
): Promise<VideoMetadata> => {
	const input = new Input({
		formats: ALL_FORMATS,
		source: new UrlSource(src, {getRetryDelay: () => null}),
	});

	const [durationInSeconds, videoTrack] = await Promise.all([
		input.computeDuration(),
		input.getPrimaryVideoTrack(),
	]);

	const packetStats = await videoTrack?.computePacketStats(1000);

	return {
		durationInSeconds,
		fps: packetStats?.averagePacketRate ?? 30,
	};
};
