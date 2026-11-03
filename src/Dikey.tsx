import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DikeyProps} from './types';
import {BoxProvider} from './box';
import {One} from './Overlay';
import {CH, CW, FACE_H, FACE_Y, faceAmount, kadrajAt, windowRect} from './layout';

const Screen: React.FC<DikeyProps> = (p) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const win = windowRect(t, p.faceShow);
  // Yuz gizliyken kayit gorunmez: ekran penceresi duz sayfa olur, uzerine tam sayfa
  // edit sahneleri (sayfa) gelir. Yuz gorunurken kayit kucultulerek gorunur.
  const fa = faceAmount(t, p.faceShow);
  const k = kadrajAt(t, p.kadraj);
  const s = win.w / ((k.w / 100) * p.srcW);
  const scaledW = p.srcW * s, scaledH = p.srcH * s;
  let left = win.w / 2 - (k.cx / 100) * scaledW;
  left = Math.max(win.w - scaledW, Math.min(0, left));
  let top = win.h / 2 - (k.cy / 100) * scaledH;
  top = scaledH >= win.h ? Math.max(win.h - scaledH, Math.min(0, top)) : (win.h - scaledH) / 2;
  return (
    <div style={{position: 'absolute', left: win.x, top: win.y, width: win.w, height: win.h, overflow: 'hidden', background: p.bg ?? '#000'}}>
      {p.ekran === false ? null : (
        <OffthreadVideo
          src={staticFile('m/' + p.video)}
          muted
          style={{position: 'absolute', left: 0, top: 0, width: p.srcW, height: p.srcH, transformOrigin: '0 0', transform: `translate(${left}px, ${top}px) scale(${s})`, opacity: fa}}
        />
      )}
    </div>
  );
};

const Face: React.FC<DikeyProps & {from: number}> = (p) => {
  const frame = useCurrentFrame() + p.from;
  const {fps} = useVideoConfig();
  const a = faceAmount(frame / fps, p.faceShow);
  const f = p.face!;
  const fw = (f.w / 100) * p.srcW, fh = (f.h / 100) * p.srcH;
  const h = FACE_H, w = Math.min(CW * 0.85, h * (fw / fh));
  const sc = w / fw;
  return (
    <div style={{position: 'absolute', left: (CW - w) / 2, top: FACE_Y + (1 - a) * 50, width: w, height: h, overflow: 'hidden', opacity: a, borderRadius: 0}}>
      <OffthreadVideo
        src={staticFile('m/' + p.video)}
        muted
        startFrom={p.from}
        style={{position: 'absolute', left: 0, top: 0, width: p.srcW, height: p.srcH, transformOrigin: '0 0', transform: `translate(${-(f.x / 100) * p.srcW * sc}px, ${-(f.y / 100) * p.srcH * sc}px) scale(${sc})`}}
      />
    </div>
  );
};

export const Dikey: React.FC<DikeyProps> = (p) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: p.bg ?? '#000'}}>
      <Screen {...p} />
      {p.face
        ? p.faceShow.map(([s, e], i) => {
            const from = Math.max(0, Math.floor((s - 0.5) * fps));
            const to = Math.ceil((e + 0.5) * fps);
            return (
              <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)}>
                <Face {...p} from={from} />
              </Sequence>
            );
          })
        : null}
      {p.events.map((ev, i) => {
        const from = Math.round(ev.start * fps);
        const dur = Math.max(1, Math.round(ev.dur * fps));
        const inWin = ev.ref === 'ekran';
        const win = windowRect(ev.start + ev.dur / 2, p.faceShow);
        const box = inWin ? {width: win.w, height: win.h, u: win.w / 1400} : {width: CW, height: CH, u: CW / 1400};
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <div style={inWin ? {position: 'absolute', left: win.x, top: win.y, width: win.w, height: win.h} : {position: 'absolute', inset: 0}}>
              <BoxProvider box={box}>
                <One ev={ev} dur={dur} theme={p.theme} />
              </BoxProvider>
            </div>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
