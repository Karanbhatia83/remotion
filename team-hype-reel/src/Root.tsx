import './index.css';
import {Composition, Folder} from 'remotion';
import {TeamHype} from './TeamHype/TeamHype';
import {Hook} from './TeamHype/scenes/Hook';
import {Outro} from './TeamHype/scenes/Outro';
import {RollCall} from './TeamHype/scenes/RollCall';
import {RunItBack} from './TeamHype/scenes/RunItBack';
import {SquadClip} from './TeamHype/scenes/SquadClip';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition id="TeamHypeReel" component={TeamHype} durationInFrames={600} fps={30} width={1080} height={1920} />
			<Folder name="TeamHypeReel-Scenes">
				<Composition id="Hook" component={Hook} durationInFrames={60} fps={30} width={1080} height={1920} />
				<Composition id="SquadClip" component={SquadClip} durationInFrames={180} fps={30} width={1080} height={1920} />
				<Composition id="RunItBack" component={RunItBack} durationInFrames={120} fps={30} width={1080} height={1920} />
				<Composition id="RollCall" component={RollCall} durationInFrames={120} fps={30} width={1080} height={1920} />
				<Composition id="Outro" component={Outro} durationInFrames={120} fps={30} width={1080} height={1920} />
			</Folder>
		</>
	);
};
