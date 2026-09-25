import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Sequence, staticFile} from 'remotion';
import {Hook} from './scenes/Hook';
import {Outro} from './scenes/Outro';
import {RollCall} from './scenes/RollCall';
import {RunItBack} from './scenes/RunItBack';
import {SquadClip} from './scenes/SquadClip';

// Scene boundaries sit on bar lines of the 120 BPM soundtrack (60 frames per bar).
export const TeamHype: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<Sequence name="Hook" durationInFrames={60}>
				<Hook />
			</Sequence>
			<Sequence name="Squad clip" from={60} durationInFrames={180}>
				<SquadClip />
			</Sequence>
			<Sequence name="Run it back" from={240} durationInFrames={120}>
				<RunItBack />
			</Sequence>
			<Sequence name="Roll call" from={360} durationInFrames={120}>
				<RollCall />
			</Sequence>
			<Sequence name="Outro" from={480} durationInFrames={120}>
				<Outro />
			</Sequence>

			<Audio name="Music" src={staticFile('music.wav')} volume={0.9} />

			<Audio name="Pop POV" src={staticFile('pop.wav')} volume={0.5} />
			<Audio name="Pop you" src={staticFile('pop.wav')} from={8} volume={0.5} />
			<Audio name="Pop best" src={staticFile('pop.wav')} from={23} volume={0.5} />
			<Audio name="Pop team" src={staticFile('pop.wav')} from={38} volume={0.5} />
			<Audio name="Whoosh drop" src={staticFile('whoosh.wav')} from={46} volume={0.6} />

			<Audio name="Pop wave" src={staticFile('pop.wav')} from={64} volume={0.4} />
			<Audio name="Pop bolt" src={staticFile('pop.wav')} from={96} volume={0.4} />
			<Audio name="Pop cry" src={staticFile('pop.wav')} from={130} volume={0.4} />
			<Audio name="Pop sparkle" src={staticFile('pop.wav')} from={160} volume={0.4} />
			<Audio name="Pop fire" src={staticFile('pop.wav')} from={194} volume={0.4} />
			<Audio name="Rewind" src={staticFile('rewind.wav')} from={225} volume={0.7} />
			<Audio name="Whoosh grid" src={staticFile('whoosh.wav')} from={236} volume={0.5} />

			<Audio name="Shutter" src={staticFile('shutter.wav')} from={360} volume={0.6} />
			<Audio name="Pop tag 1" src={staticFile('pop.wav')} from={375} volume={0.3} />
			<Audio name="Pop tag 2" src={staticFile('pop.wav')} from={390} volume={0.3} />
			<Audio name="Pop tag 3" src={staticFile('pop.wav')} from={405} volume={0.3} />
			<Audio name="Pop tag 4" src={staticFile('pop.wav')} from={420} volume={0.3} />
			<Audio name="Pop tag 5" src={staticFile('pop.wav')} from={435} volume={0.3} />
			<Audio name="Pop legends" src={staticFile('pop.wav')} from={444} volume={0.5} />

			<Audio name="Whoosh card" src={staticFile('whoosh.wav')} from={505} volume={0.5} />
			<Audio name="Pop CTA" src={staticFile('pop.wav')} from={540} volume={0.45} />
		</AbsoluteFill>
	);
};
