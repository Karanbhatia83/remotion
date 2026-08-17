import React from 'react';
import { Composition } from 'remotion';
import { Reel, FPS, WIDTH, HEIGHT, totalDurationInFrames } from './Reel';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Reel"
      component={Reel}
      durationInFrames={totalDurationInFrames()}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
