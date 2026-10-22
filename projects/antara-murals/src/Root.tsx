import React from 'react';
import {Composition} from 'remotion';
import {RamNaam} from './RamNaam';
import {ShivStone} from './ShivStone';
import {Pichwai} from './Pichwai';
import {Kashi} from './Kashi';
import {Mandala} from './Mandala';
import {Rangoli} from './Rangoli';
import {RamTile} from './RamTile';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="RamNaam" component={RamNaam} width={1920} height={1080} fps={24} durationInFrames={240} />
    <Composition id="ShivStone" component={ShivStone} width={1920} height={1080} fps={24} durationInFrames={240} />
    <Composition id="Pichwai" component={Pichwai} width={1920} height={1080} fps={24} durationInFrames={240} />
    <Composition id="Kashi" component={Kashi} width={1920} height={1080} fps={24} durationInFrames={360} />
    <Composition id="Mandala" component={Mandala} width={1920} height={1080} fps={24} durationInFrames={240} />
    <Composition id="Rangoli" component={Rangoli} width={1920} height={1080} fps={24} durationInFrames={240} />
    <Composition id="RangoliLettered" component={Rangoli} width={1920} height={1080} fps={24} durationInFrames={240} defaultProps={{lettering: true}} />
    <Composition id="RamTile" component={RamTile} width={1920} height={1080} fps={24} durationInFrames={1} />
  </>
);
