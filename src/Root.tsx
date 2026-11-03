import React from 'react';
import {Composition} from 'remotion';
import {Overlay} from './Overlay';
import {Props} from './types';

const demo: Props = {
  width: 1920, height: 1080, fps: 30, duration: 12,
  theme: {primary: '#ffffff', secondary: '#16181d', accent: '#ff5c5c', style: 'cam'},
  events: [
    {type: 'search', start: 0.5, dur: 3, query: 'yapay zeka ile video edit'},
    {type: 'counter', start: 4, dur: 3, to: 3000, suffix: ' abone', label: '15 videoda'},
    {type: 'text', start: 8, dur: 3, text: 'Dikkat: kişisel bilgi', tone: 'uyari', pos: 'alt'}
  ]
};

export const Root: React.FC = () => (
  <Composition
    id="Overlay"
    component={Overlay}
    width={demo.width}
    height={demo.height}
    fps={demo.fps}
    durationInFrames={demo.duration * demo.fps}
    defaultProps={demo}
    calculateMetadata={({props}) => ({
      width: props.width, height: props.height, fps: props.fps,
      durationInFrames: Math.max(1, Math.round(props.duration * props.fps))
    })}
  />
);
