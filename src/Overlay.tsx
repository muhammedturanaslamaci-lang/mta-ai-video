import React from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {useVC} from './box';
import {Ev, Props, Theme} from './types';
import {bright, fontFor, panel, place, readable} from './theme';

// Giriş ve çıkış: 0 -> 1 -> 0
const useLife = (dur: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVC();
  const inn = spring({frame, fps, config: {damping: 200}, durationInFrames: Math.round(fps * 0.35)});
  const out = interpolate(frame, [dur - Math.round(fps * 0.25), dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return {p: Math.min(inn, out), frame, fps};
};

const Wrap: React.FC<{ev: Ev & {pos?: any}; dur: number; theme: Theme; children: React.ReactNode}> = ({ev, dur, theme, children}) => {
  const {width, height} = useVC();
  const {p} = useLife(dur);
  return (
    <div style={{...place(ev.pos, width, height), opacity: p, transform: `translateY(${(1 - p) * 24}px)`, fontFamily: fontFor(theme)}}>
      {children}
    </div>
  );
};


const Logo: React.FC<{ev: Extract<Ev, {type: 'logo'}>; dur: number; theme: Theme}> = ({ev, dur, theme}) => {
  const {width} = useVC();
  const u = useVC().u;
  return (
    <Wrap ev={{...ev, pos: ev.pos ?? 'sag-ust'}} dur={dur} theme={theme}>
      <div style={{...panel(theme, u), display: 'flex', alignItems: 'center', gap: 16 * u}}>
        <Img src={staticFile('m/' + ev.file)} style={{height: 92 * u, maxWidth: 260 * u, objectFit: 'contain'}} />
        {ev.label ? <span style={{fontSize: 34 * u}}>{ev.label}</span> : null}
      </div>
    </Wrap>
  );
};

const Counter: React.FC<{ev: Extract<Ev, {type: 'counter'}>; dur: number; theme: Theme}> = ({ev, dur, theme}) => {
  const {width} = useVC();
  const frame = useCurrentFrame();
  const u = useVC().u;
  const t = interpolate(frame, [0, Math.min(dur * 0.7, 60)], [0, 1], {extrapolateRight: 'clamp'});
  const eased = 1 - Math.pow(1 - t, 3);
  const from = ev.from ?? 0;
  const v = from + (ev.to - from) * eased;
  const dec = Number.isInteger(ev.to) ? 0 : 1;
  const text = v.toLocaleString('tr-TR', {minimumFractionDigits: dec, maximumFractionDigits: dec});
  return (
    <Wrap ev={{...ev, pos: ev.pos ?? 'orta'}} dur={dur} theme={theme}>
      <div style={{...panel(theme, u), textAlign: 'center'}}>
        <div style={{fontSize: 150 * u, lineHeight: 1, fontWeight: 800, fontVariantNumeric: 'tabular-nums'}}>
          {ev.prefix ?? ''}{text}{ev.suffix ?? ''}
        </div>
        {ev.label ? <div style={{fontSize: 38 * u, marginTop: 10 * u, opacity: 0.9}}>{ev.label}</div> : null}
      </div>
    </Wrap>
  );
};

const Search: React.FC<{ev: Extract<Ev, {type: 'search'}>; dur: number; theme: Theme}> = ({ev, dur, theme}) => {
  const {width} = useVC();
  const frame = useCurrentFrame();
  const u = useVC().u;
  const typed = Math.min(ev.query.length, Math.floor(frame / 2.2));
  const caret = Math.floor(frame / 12) % 2 === 0 ? '|' : ' ';
  return (
    <Wrap ev={{...ev, pos: ev.pos ?? 'orta'}} dur={dur} theme={theme}>
      <div style={{width: 1000 * u, background: '#ffffff', borderRadius: 14 * u, boxShadow: `0 ${20 * u}px ${60 * u}px rgba(0,0,0,.35)`, overflow: 'hidden', color: '#202124'}}>
        <div style={{background: '#eceff3', padding: `${12 * u}px ${18 * u}px`, display: 'flex', alignItems: 'center', gap: 10 * u}}>
          {['#ff5f57', '#febc2e', '#28c840'].map(c => <i key={c} style={{width: 14 * u, height: 14 * u, borderRadius: '50%', background: c}} />)}
          <div style={{marginLeft: 14 * u, flex: 1, background: '#fff', borderRadius: 20 * u, padding: `${6 * u}px ${16 * u}px`, fontSize: 22 * u, color: '#5f6368'}}>{ev.site ?? 'google.com'}</div>
        </div>
        <div style={{padding: `${44 * u}px ${48 * u}px`}}>
          <div style={{border: `${2 * u}px solid #dadce0`, borderRadius: 40 * u, padding: `${16 * u}px ${28 * u}px`, fontSize: 36 * u}}>
            {ev.query.slice(0, typed)}{caret}
          </div>
        </div>
      </div>
    </Wrap>
  );
};

// Vurgulanacak alanı çerçeveye alır. Koordinatlar yüzde.
const Frame: React.FC<{ev: Extract<Ev, {type: 'frame'}>; dur: number; theme: Theme}> = ({ev, dur, theme}) => {
  const {width, height} = useVC();
  const {p} = useLife(dur);
  const u = useVC().u;
  const x = (ev.x / 100) * width, y = (ev.y / 100) * height, w = (ev.w / 100) * width, h = (ev.h / 100) * height;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: p, fontFamily: fontFor(theme)}}>
      <div style={{position: 'absolute', inset: 0, border: `${4 * u}px solid ${theme.primary}`, borderRadius: (theme.style === 'cam' ? 18 : 6) * u, transform: `scale(${1.04 - 0.04 * p})`}} />
      <div style={{position: 'absolute', left: 0, bottom: -10 * u, height: 6 * u, width: `${p * 100}%`, background: theme.primary, borderRadius: 3 * u}} />
      {ev.label ? <div style={{position: 'absolute', left: 0, top: -58 * u, ...panel(theme, u * 0.7), fontSize: 30 * u}}>{ev.label}</div> : null}
    </div>
  );
};

const Card: React.FC<{ev: Extract<Ev, {type: 'card'}>; dur: number; theme: Theme}> = ({ev, dur, theme}) => {
  const {width} = useVC();
  const u = useVC().u;
  return (
    <Wrap ev={{...ev, pos: ev.pos ?? 'orta'}} dur={dur} theme={theme}>
      <div style={{...panel(theme, u), maxWidth: 1100 * u}}>
        <div style={{fontSize: 60 * u, fontWeight: 800, lineHeight: 1.1}}>{ev.title}</div>
        {ev.body ? <div style={{fontSize: 36 * u, marginTop: 14 * u, lineHeight: 1.35, opacity: 0.92}}>{ev.body}</div> : null}
      </div>
    </Wrap>
  );
};

// Ekran görüntüsünü pencere çerçevesi içinde gösterir
const Shot: React.FC<{ev: Extract<Ev, {type: 'shot'}>; dur: number; theme: Theme}> = ({ev, dur, theme}) => {
  const {width, height} = useVC();
  const u = useVC().u;
  return (
    <Wrap ev={{...ev, pos: ev.pos ?? 'orta'}} dur={dur} theme={theme}>
      <div style={{background: '#fff', borderRadius: 14 * u, overflow: 'hidden', boxShadow: `0 ${24 * u}px ${70 * u}px rgba(0,0,0,.4)`}}>
        <div style={{background: '#eceff3', padding: `${10 * u}px ${16 * u}px`, display: 'flex', gap: 8 * u}}>
          {['#ff5f57', '#febc2e', '#28c840'].map(c => <i key={c} style={{width: 12 * u, height: 12 * u, borderRadius: '50%', background: c}} />)}
        </div>
        <Img src={staticFile('m/' + ev.file)} style={{display: 'block', maxWidth: width * 0.62, maxHeight: height * 0.62}} />
      </div>
      {ev.caption ? <div style={{...panel(theme, u * 0.7), position: 'absolute', bottom: -70 * u, fontSize: 30 * u}}>{ev.caption}</div> : null}
    </Wrap>
  );
};

const Text: React.FC<{ev: Extract<Ev, {type: 'text'}>; dur: number; theme: Theme}> = ({ev, dur, theme}) => {
  const {width} = useVC();
  const u = useVC().u;
  const warn = ev.tone === 'uyari';
  return (
    <Wrap ev={ev} dur={dur} theme={theme}>
      <div style={{...panel(theme, u), fontSize: 52 * u, fontWeight: 700, textAlign: 'center', ...(warn ? {textDecoration: `underline ${theme.accent} ${5 * u}px`, textUnderlineOffset: 10 * u} : {})}}>
        {ev.text}
      </div>
    </Wrap>
  );
};

type E<T extends Ev['type']> = Extract<Ev, {type: T}>;
type CP<T extends Ev['type']> = {ev: E<T>; dur: number; theme: Theme};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Title: React.FC<CP<'title'>> = ({ev, dur, theme}) => {
  const {width} = useVC();
  const u = useVC().u;
  return (
    <Wrap ev={{...ev, pos: ev.pos ?? 'orta'}} dur={dur} theme={theme}>
      <div style={{...panel(theme, u), textAlign: 'center', maxWidth: 1300 * u}}>
        <div style={{fontSize: 92 * u, fontWeight: 800, lineHeight: 1.05}}>{ev.title}</div>
        {ev.sub ? <div style={{fontSize: 42 * u, marginTop: 16 * u, opacity: 0.9}}>{ev.sub}</div> : null}
      </div>
    </Wrap>
  );
};

const LowerThird: React.FC<CP<'lowerthird'>> = ({ev, dur, theme}) => {
  const {width} = useVC();
  const u = useVC().u;
  return (
    <Wrap ev={{...ev, pos: 'sol-alt'}} dur={dur} theme={theme}>
      <div style={panel(theme, u)}>
        <div style={{fontSize: 52 * u, fontWeight: 800, lineHeight: 1.1}}>{ev.name}</div>
        {ev.role ? <div style={{fontSize: 32 * u, marginTop: 6 * u, opacity: 0.9}}>{ev.role}</div> : null}
      </div>
    </Wrap>
  );
};

const List: React.FC<CP<'list'>> = ({ev, dur, theme}) => {
  const {width, fps} = useVC();
  const frame = useCurrentFrame();
  const u = useVC().u;
  return (
    <Wrap ev={{...ev, pos: ev.pos ?? 'orta'}} dur={dur} theme={theme}>
      <div style={{...panel(theme, u), maxWidth: 1200 * u}}>
        {ev.items.map((it, i) => {
          const t0 = 8 + i * fps * 0.5;
          const p = interpolate(frame, [t0, t0 + 10], [0, 1], clamp);
          return (
            <div key={i} style={{opacity: p, transform: `translateX(${(1 - p) * 30 * u}px)`, fontSize: 46 * u, lineHeight: 1.3, marginTop: i ? 10 * u : 0}}>
              • {it}
            </div>
          );
        })}
      </div>
    </Wrap>
  );
};

const Cursor: React.FC<CP<'cursor'>> = ({ev, dur, theme}) => {
  const {width, height} = useVC();
  const frame = useCurrentFrame();
  const u = useVC().u;
  const {p} = useLife(dur);
  const move = ev.ring ? 0 : Math.max(6, Math.round(dur * 0.55));
  const t = 1 - Math.pow(1 - interpolate(frame, [0, move], [0, 1], clamp), 3);
  const fx = ev.fromX ?? Math.max(0, ev.x - 18), fy = ev.fromY ?? Math.min(100, ev.y + 18);
  const x = ((fx + (ev.x - fx) * t) / 100) * width, y = ((fy + (ev.y - fy) * t) / 100) * height;
  const r = interpolate(frame, [move, move + 14], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: p}}>
      {ev.click !== false ? (
        <div style={{position: 'absolute', left: (ev.x / 100) * width - 40 * u, top: (ev.y / 100) * height - 40 * u, width: 80 * u, height: 80 * u, borderRadius: '50%', border: `${4 * u}px solid ${theme.primary}`, opacity: r > 0 ? 1 - r : 0, transform: `scale(${0.3 + r})`}} />
      ) : null}
      {ev.ring ? null : <svg width={44 * u} height={44 * u} viewBox="0 0 24 24" style={{position: 'absolute', left: x - 3 * u, top: y - 2 * u, filter: `drop-shadow(0 ${3 * u}px ${5 * u}px rgba(0,0,0,.5))`}}>
        <path d="M3 2l7 19 3-8 8-3z" fill="#ffffff" stroke="#111111" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>}
    </div>
  );
};

const Keys: React.FC<CP<'keys'>> = ({ev, dur, theme}) => {
  const {width} = useVC();
  const u = useVC().u;
  return (
    <Wrap ev={{...ev, pos: ev.pos ?? 'alt'}} dur={dur} theme={theme}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14 * u}}>
        {ev.keys.map((k, i) => (
          <React.Fragment key={i}>
            {i ? <span style={{fontSize: 40 * u, color: '#fff', textShadow: '0 2px 6px rgba(0,0,0,.6)'}}>+</span> : null}
            <span style={{background: '#2a2d34', color: '#fff', border: `${2 * u}px solid #555`, borderBottom: `${7 * u}px solid #111`, borderRadius: 12 * u, padding: `${10 * u}px ${24 * u}px`, fontSize: 46 * u, fontWeight: 700, fontFamily: 'Consolas, monospace'}}>{k}</span>
          </React.Fragment>
        ))}
      </div>
    </Wrap>
  );
};

const Progress: React.FC<CP<'progress'>> = ({dur, theme}) => {
  const {width} = useVC();
  const frame = useCurrentFrame();
  const u = useVC().u;
  return <div style={{position: 'absolute', left: 0, top: 0, height: 10 * u, width: `${(frame / dur) * 100}%`, background: theme.primary, boxShadow: `0 0 ${10 * u}px rgba(0,0,0,.4)`}} />;
};

const Compare: React.FC<CP<'compare'>> = ({ev, dur, theme}) => {
  const {width, height} = useVC();
  const u = useVC().u;
  const box = (file: string, label: string) => (
    <div style={{position: 'relative', borderRadius: 14 * u, overflow: 'hidden', boxShadow: `0 ${20 * u}px ${60 * u}px rgba(0,0,0,.4)`, background: '#fff'}}>
      <Img src={staticFile('m/' + file)} style={{display: 'block', maxWidth: width * 0.38, maxHeight: height * 0.6}} />
      <div style={{position: 'absolute', left: 14 * u, top: 14 * u, ...panel(theme, u * 0.6), fontSize: 30 * u}}>{label}</div>
    </div>
  );
  return (
    <Wrap ev={{...ev, pos: 'orta'}} dur={dur} theme={theme}>
      <div style={{display: 'flex', gap: 28 * u}}>
        {box(ev.before, ev.beforeLabel ?? 'Önce')}
        {box(ev.after, ev.afterLabel ?? 'Sonra')}
      </div>
    </Wrap>
  );
};

const Chart: React.FC<CP<'chart'>> = ({ev, dur, theme}) => {
  const {width, fps} = useVC();
  const frame = useCurrentFrame();
  const u = useVC().u;
  const max = Math.max(...ev.bars, 1);
  return (
    <Wrap ev={{...ev, pos: ev.pos ?? 'orta'}} dur={dur} theme={theme}>
      <div style={{...panel(theme, u), width: 820 * u}}>
        {ev.title ? <div style={{fontSize: 40 * u, fontWeight: 800, marginBottom: 18 * u}}>{ev.title}</div> : null}
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 16 * u, height: 300 * u}}>
          {ev.bars.map((v, i) => {
            const g = spring({frame: frame - 6 - i * 4, fps, config: {damping: 18}});
            return (
              <div key={i} style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%'}}>
                <div style={{height: `${(v / max) * 100 * Math.max(0, g)}%`, background: 'currentColor', opacity: 0.9, borderRadius: `${6 * u}px ${6 * u}px 0 0`}} />
              </div>
            );
          })}
        </div>
        {ev.labels ? (
          <div style={{display: 'flex', gap: 16 * u, marginTop: 10 * u}}>
            {ev.labels.map((l, i) => <div key={i} style={{flex: 1, textAlign: 'center', fontSize: 26 * u}}>{l}</div>)}
          </div>
        ) : null}
      </div>
    </Wrap>
  );
};

const Spotlight: React.FC<CP<'spotlight'>> = ({ev, dur, theme}) => {
  const {width, height} = useVC();
  const {p} = useLife(dur);
  const u = useVC().u;
  return (
    <div style={{position: 'absolute', left: (ev.x / 100) * width, top: (ev.y / 100) * height, width: (ev.w / 100) * width, height: (ev.h / 100) * height, borderRadius: 16 * u, boxShadow: `0 0 0 ${Math.max(width, height)}px rgba(0,0,0,${0.7 * p})`, border: `${3 * u}px solid ${theme.primary}`, opacity: p > 0 ? 1 : 0}} />
  );
};

const Marker: React.FC<CP<'marker'>> = ({ev, dur, theme}) => {
  const {width, height} = useVC();
  const frame = useCurrentFrame();
  const {p} = useLife(dur);
  const grow = interpolate(frame, [0, 14], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: (ev.x / 100) * width, top: (ev.y / 100) * height, width: (ev.w / 100) * width, height: (ev.h / 100) * height, background: theme.accent, opacity: 0.42 * (p > 0 ? 1 : 0), borderRadius: 6 * useVC().u, transform: `scaleX(${grow})`, transformOrigin: 'left center'}} />
  );
};

const Arrow: React.FC<CP<'arrow'>> = ({ev, dur, theme}) => {
  const {width, height} = useVC();
  const frame = useCurrentFrame();
  const {p} = useLife(dur);
  const u = useVC().u;
  const from = ev.from ?? 'sag';
  const rot = {sol: 0, sag: 180, ust: 90, alt: -90}[from];
  const tr = {sol: 'translate(-100%,-50%)', sag: 'translate(0,-50%)', ust: 'translate(-50%,-100%)', alt: 'translate(-50%,0)'}[from];
  const bob = Math.sin(frame / 5) * 10 * u;
  const dx = from === 'sol' ? bob : from === 'sag' ? -bob : 0;
  const dy = from === 'ust' ? bob : from === 'alt' ? -bob : 0;
  return (
    <div style={{position: 'absolute', left: (ev.x / 100) * width, top: (ev.y / 100) * height, transform: `${tr} translate(${dx}px,${dy}px)`, opacity: p, display: 'flex', flexDirection: from === 'ust' || from === 'alt' ? 'column' : 'row', alignItems: 'center', gap: 10 * u, fontFamily: fontFor(theme)}}>
      <svg width={120 * u} height={70 * u} viewBox="0 0 120 70" style={{transform: `rotate(${rot}deg)`, filter: `drop-shadow(0 ${3 * u}px ${6 * u}px rgba(0,0,0,.5))`}}>
        <path d="M4 26h64V6l48 29-48 29V44H4z" fill={bright(theme.primary, theme.accent)} stroke="#111" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      {ev.label ? <div style={{...panel(theme, u * 0.7), fontSize: 32 * u}}>{ev.label}</div> : null}
    </div>
  );
};

const Subscribe: React.FC<CP<'subscribe'>> = ({ev, dur, theme}) => {
  const {width} = useVC();
  const frame = useCurrentFrame();
  const u = useVC().u;
  const pulse = 1 + 0.06 * Math.max(0, Math.sin(frame / 4));
  return (
    <Wrap ev={{...ev, pos: ev.pos ?? 'sol-alt'}} dur={dur} theme={theme}>
      <div style={{...panel(theme, u), fontSize: 46 * u, fontWeight: 800, transform: `scale(${pulse})`, transformOrigin: 'left bottom'}}>{ev.text ?? 'Abone ol'}</div>
    </Wrap>
  );
};

const Chapter: React.FC<CP<'chapter'>> = ({ev, dur, theme}) => {
  const {width} = useVC();
  const u = useVC().u;
  return (
    <Wrap ev={{...ev, pos: 'sol-ust'}} dur={dur} theme={theme}>
      <div style={{...panel(theme, u * 0.75), fontSize: 34 * u, fontWeight: 700}}>{ev.index ? `${ev.index} · ` : ''}{ev.label}</div>
    </Wrap>
  );
};

const Countdown: React.FC<CP<'countdown'>> = ({ev, dur, theme}) => {
  const {width, fps} = useVC();
  const frame = useCurrentFrame();
  const u = useVC().u;
  const n = Math.max(0, ev.from - Math.floor(frame / fps));
  const k = interpolate(frame % fps, [0, 8, fps], [1.25, 1, 1], clamp);
  return (
    <Wrap ev={{...ev, pos: ev.pos ?? 'orta'}} dur={dur} theme={theme}>
      <div style={{...panel(theme, u), fontSize: 150 * u, fontWeight: 800, lineHeight: 1, minWidth: 220 * u, textAlign: 'center', transform: `scale(${k})`}}>{n}</div>
    </Wrap>
  );
};

const Caption: React.FC<CP<'caption'>> = ({ev, dur, theme}) => {
  const {width} = useVC();
  const frame = useCurrentFrame();
  const u = useVC().u;
  const words = ev.text.split(/\s+/);
  const idx = Math.min(words.length - 1, Math.floor((frame / dur) * words.length));
  const hi = bright(theme.primary, theme.accent);
  return (
    <Wrap ev={{...ev, pos: ev.pos ?? 'alt'}} dur={dur} theme={theme}>
      <div style={{textAlign: 'center', fontSize: 58 * u, fontWeight: 800, lineHeight: 1.2, color: '#fff', textShadow: `0 ${2 * u}px ${8 * u}px rgba(0,0,0,.85), 0 0 ${2 * u}px #000`, maxWidth: 1500 * u}}>
        {words.map((w, i) => (
          <span key={i} style={{color: ev.karaoke && i === idx ? hi : '#fff', marginRight: 14 * u, display: 'inline-block'}}>{w}</span>
        ))}
      </div>
    </Wrap>
  );
};

export const One: React.FC<{ev: Ev; dur: number; theme: Theme}> = ({ev, dur, theme}) => {
  switch (ev.type) {
    case 'logo': return <Logo ev={ev} dur={dur} theme={theme} />;
    case 'counter': return <Counter ev={ev} dur={dur} theme={theme} />;
    case 'search': return <Search ev={ev} dur={dur} theme={theme} />;
    case 'frame': return <Frame ev={ev} dur={dur} theme={theme} />;
    case 'card': return <Card ev={ev} dur={dur} theme={theme} />;
    case 'shot': return <Shot ev={ev} dur={dur} theme={theme} />;
    case 'text': return <Text ev={ev} dur={dur} theme={theme} />;
    case 'title': return <Title ev={ev} dur={dur} theme={theme} />;
    case 'lowerthird': return <LowerThird ev={ev} dur={dur} theme={theme} />;
    case 'list': return <List ev={ev} dur={dur} theme={theme} />;
    case 'cursor': return <Cursor ev={ev} dur={dur} theme={theme} />;
    case 'keys': return <Keys ev={ev} dur={dur} theme={theme} />;
    case 'progress': return <Progress ev={ev} dur={dur} theme={theme} />;
    case 'compare': return <Compare ev={ev} dur={dur} theme={theme} />;
    case 'chart': return <Chart ev={ev} dur={dur} theme={theme} />;
    case 'spotlight': return <Spotlight ev={ev} dur={dur} theme={theme} />;
    case 'marker': return <Marker ev={ev} dur={dur} theme={theme} />;
    case 'arrow': return <Arrow ev={ev} dur={dur} theme={theme} />;
    case 'subscribe': return <Subscribe ev={ev} dur={dur} theme={theme} />;
    case 'chapter': return <Chapter ev={ev} dur={dur} theme={theme} />;
    case 'countdown': return <Countdown ev={ev} dur={dur} theme={theme} />;
    case 'caption': return <Caption ev={ev} dur={dur} theme={theme} />;
  }
};

export const Overlay: React.FC<Props> = ({events, theme, fps}) => {
  return (
    <AbsoluteFill style={{background: 'transparent'}}>
      {events.map((ev, i) => {
        const from = Math.round(ev.start * fps);
        const dur = Math.max(1, Math.round(ev.dur * fps));
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <One ev={ev} dur={dur} theme={theme} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
