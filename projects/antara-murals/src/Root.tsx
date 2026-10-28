import React from 'react';
import {Composition} from 'remotion';
import {RamNaam} from './RamNaam';
import {ShivStone} from './ShivStone';
import {Pichwai} from './Pichwai';
import {Kashi} from './Kashi';
import {Mandala} from './Mandala';
import {Rangoli} from './Rangoli';
import {RamTile} from './RamTile';
import {Reel, TOTAL_FRAMES} from './Reel';
import {KashiEndCard, TOTAL_FRAMES as KASHI_FRAMES, FPS as KASHI_FPS} from './KashiEndCard';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="RamNaam" component={RamNaam} width={1920} height={1080} fps={24} durationInFrames={240} />
    <Composition id="ShivStone" component={ShivStone} width={1920} height={1080} fps={24} durationInFrames={240} />
    <Composition id="Pichwai" component={Pichwai} width={1920} height={1080} fps={24} durationInFrames={240} />
    <Composition id="Kashi" component={Kashi} width={1920} height={1080} fps={24} durationInFrames={360} />
    <Composition id="Mandala" component={Mandala} width={1920} height={1080} fps={24} durationInFrames={240} />
    <Composition id="Rangoli" component={Rangoli} width={1920} height={1080} fps={24} durationInFrames={240} />
    <Composition id="RangoliLettered" component={Rangoli} width={1920} height={1080} fps={24} durationInFrames={240} defaultProps={{lettering: true}} />
    <Composition id="ThankYouReel" component={Reel} width={1080} height={1920} fps={30} durationInFrames={TOTAL_FRAMES} defaultProps={{music: true}} />
    <Composition id="ThankYouReelNoMusic" component={Reel} width={1080} height={1920} fps={30} durationInFrames={TOTAL_FRAMES} defaultProps={{music: false}} />
    <Composition id="ThankYouReelCover" component={Reel} width={1080} height={1920} fps={30} durationInFrames={TOTAL_FRAMES} defaultProps={{music: false, cover: true}} />
    <Composition id="KashiEndCard" component={KashiEndCard} width={1080} height={1920} fps={KASHI_FPS} durationInFrames={KASHI_FRAMES} />
    <Composition id="RamTile" component={RamTile} width={1920} height={1080} fps={24} durationInFrames={1} />
  </>
);
