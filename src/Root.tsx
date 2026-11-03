import React from 'react';
import {Composition} from 'remotion';
import {Overlay} from './Overlay';
import {Props, DikeyProps} from './types';
import {Dikey} from './Dikey';

const demo: Props = {
  width: 1920, height: 1080, fps: 30, duration: 12,
  theme: {primary: '#ffffff', secondary: '#16181d', accent: '#ff5c5c', style: 'cam'},
  events: [
    {type: 'search', start: 0.5, dur: 3, query: 'yapay zeka ile video edit'},
    {type: 'counter', start: 4, dur: 3, to: 3000, suffix: ' abone', label: '15 videoda'},
    {type: 'text', start: 8, dur: 3, text: 'Dikkat: kişisel bilgi', tone: 'uyari', pos: 'alt'}
  ]
};

const dikeyDemo: DikeyProps = {
  ...demo, width: 1080, height: 1920, duration: 6,
  video: 'ornek.mp4', srcW: 1920, srcH: 1080,
  face: {x: 80, y: 62, w: 18, h: 34}, faceShow: [[0, 2]],
  kadraj: [{t: 0, cx: 50, cy: 50, w: 100}, {t: 3, cx: 35, cy: 40, w: 45}],
  events: []
};

export const Root: React.FC = () => (
  <>
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
  <Composition
    id="Dikey"
    component={Dikey}
    width={1080}
    height={1920}
    fps={dikeyDemo.fps}
    durationInFrames={dikeyDemo.duration * dikeyDemo.fps}
    defaultProps={dikeyDemo}
    calculateMetadata={({props}) => ({
      width: 1080, height: 1920, fps: props.fps,
      durationInFrames: Math.max(1, Math.round(props.duration * props.fps))
    })}
  />
  </>
);
