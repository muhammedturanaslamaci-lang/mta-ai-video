import React from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Video} from 'remotion';
import {One} from './Overlay';
import {BoxProvider} from './box';
import {Ev, Theme} from './types';

// ------------------------------------------------------------------ tipler
export type GirisEv = {
  type: 'giris'; start: number; dur: number;
  logo: string; title: string; sub: string;
  cTo: number; cSuffix: string; cLabel: string;
};
export type SohbetEv = {
  type: 'sohbet'; start: number; dur: number;
  prompt: string; cmd: string; reply: string;
};
export type PanelEv = {
  type: 'panel'; start: number; dur: number;
  kind: 'humanize' | 'dashboard' | 'study' | 'el5' | 'torch';
  baslik: string;
};
export type CtaEv = {
  type: 'cta'; start: number; dur: number;
  cTo: number; cSuffix: string; cLabel: string;
  subscribe: string; note: string;
};
export type GEv = Ev | GirisEv | SohbetEv | PanelEv | CtaEv;

export type GProps = {
  width: number; height: number; fps: number; duration: number;
  theme: Theme;
  faceShow: [number, number][];
  faceIntro: string;
  faceCta: string;
  adimBas: number[];
  events: GEv[];
};

// ------------------------------------------------------------------ sabitler
const U = 1080 / 1400;
const BG = '#05080a';
const TEAL = '#1bbdc0';
const MONO = 'Consolas, Cascadia Mono, monospace';
const SANS = 'Segoe UI, system-ui, Arial, sans-serif';
const PANEL = {x: 60, y: 840, w: 960, h: 1040};
const FACE = {w: 300, h: 410, x: 390, y: 1455};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const fade = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

// ------------------------------------------------------------------ arka plan
const ArkaPlan: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const per = 2.6 * fps;
  const p = (frame % per) / per;
  const bandY = -420 + p * (1920 + 840);
  const gx = 50 + 26 * Math.sin(frame / 110);
  const gy = 34 + 14 * Math.cos(frame / 140);
  return (
    <AbsoluteFill style={{background: BG}}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(62% 46% at ' + gx + '% ' + gy + '%, rgba(27,189,192,0.16), transparent 72%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: bandY, height: 520, background: 'linear-gradient(180deg, rgba(27,189,192,0) 0%, rgba(27,189,192,0.10) 50%, rgba(27,189,192,0) 100%)'}} />
      <div style={{position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.022) 0px, rgba(255,255,255,0.022) 1px, transparent 1px, transparent 4px)'}} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ ust bar
const UstBar: React.FC<{p: GProps}> = ({p}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const aktif = Math.max(0, p.adimBas.filter((b) => b <= t).length - 1);
  const adimlar = ['/humanize', '/dashboard', '/study', '/el5', '/torch'];
  const cur = Math.floor(frame / 12) % 2 === 0;
  const basla = t > p.adimBas[0] - 0.4;
  return (
    <div style={{position: 'absolute', left: 56, right: 56, top: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <Img src={staticFile('m/yp-chatgpt.svg')} style={{height: 38, width: 38, borderRadius: 9}} />
        <span style={{fontFamily: MONO, fontSize: 22, color: cur ? TEAL : 'rgba(27,189,192,0.25)', fontWeight: 700}}>_</span>
      </div>
      <div style={{display: 'flex', gap: 10, opacity: basla ? 1 : 0}}>
        {adimlar.map((a, i) => {
          const on = i === aktif && basla;
          return (
            <div key={a} style={{fontFamily: MONO, fontSize: 17, padding: '7px 12px', borderRadius: 9, color: on ? '#04191a' : 'rgba(255,255,255,0.42)', background: on ? TEAL : 'rgba(255,255,255,0.05)', border: '1px solid ' + (on ? TEAL : 'rgba(255,255,255,0.12)'), fontWeight: 700}}>
              {a}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ yuz kamerasi
const Yuz: React.FC<{p: GProps}> = ({p}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  let op = 0;
  for (const [s, e] of p.faceShow) op = Math.max(op, Math.min(fade(t, s, s + 0.5), 1 - fade(t, e - 0.5, e)));
  if (op <= 0) return null;
  const kutu: React.CSSProperties = {position: 'absolute', left: FACE.x, top: FACE.y, width: FACE.w, height: FACE.h, borderRadius: 22, overflow: 'hidden', border: '2px solid ' + TEAL, boxShadow: '0 0 40px rgba(27,189,192,0.28)'};
  return (
    <>
    <div style={{position: 'absolute', left: 0, right: 0, top: 1330, bottom: 0, background: 'linear-gradient(180deg, rgba(5,8,10,0) 0%, rgba(5,8,10,0.92) 34%, #05080a 62%)', opacity: op}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, opacity: op}}>
      <div style={kutu}>
        <Sequence from={0} durationInFrames={Math.round((p.faceShow[0][1] + 0.7) * fps)}>
          <Video src={staticFile('m/' + p.faceIntro)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </Sequence>
      </div>
      <Sequence from={Math.round(p.faceShow[1][0] * fps)} durationInFrames={Math.round((p.faceShow[1][1] - p.faceShow[1][0] + 0.7) * fps)}>
        <div style={kutu}>
          <Video src={staticFile('m/' + p.faceCta)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>
      </Sequence>
    </div>
    </>
  );
};

// ------------------------------------------------------------------ sohbet
const Sohbet: React.FC<{ev: SohbetEv}> = ({ev}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const cmdAt = 1.0;
  const typed = Math.max(0, Math.min(ev.cmd.length, Math.floor((t - cmdAt) / 0.07)));
  const replyAt = cmdAt + ev.cmd.length * 0.07 + 0.55;
  const rTyped = Math.max(0, Math.min(ev.reply.length, Math.floor((t - replyAt) / 0.055)));
  const p1 = fade(t, 0, 0.4);
  const p2 = fade(t, cmdAt - 0.3, cmdAt + 0.2);
  const p3 = fade(t, replyAt - 0.1, replyAt + 0.35);
  const cur = Math.floor(frame / 11) % 2 === 0;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, fontFamily: SANS}}>
      <div style={{position: 'absolute', right: 56, top: 190, maxWidth: 760, padding: '20px 26px', borderRadius: '18px 18px 6px 18px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.16)', fontSize: 30, lineHeight: 1.35, color: '#ffffff', opacity: p1, transform: 'translateY(' + ((1 - p1) * 18) + 'px)'}}>
        {ev.prompt}
      </div>

      <div style={{position: 'absolute', left: 56, right: 56, top: 400, height: 92, borderRadius: 16, background: '#0b1114', border: '2px solid ' + TEAL, display: 'flex', alignItems: 'center', padding: '0 30px', gap: 16, opacity: p2, boxShadow: '0 0 34px rgba(27,189,192,0.20)'}}>
        <span style={{fontFamily: MONO, fontSize: 38, color: TEAL, fontWeight: 700}}>&gt;</span>
        <span style={{fontFamily: MONO, fontSize: 38, color: '#ffffff', fontWeight: 700}}>{ev.cmd.slice(0, typed)}</span>
        <span style={{fontFamily: MONO, fontSize: 38, color: TEAL, opacity: typed < ev.cmd.length && cur ? 1 : 0}}>_</span>
      </div>

      <div style={{position: 'absolute', left: 56, top: 545, maxWidth: 880, padding: '22px 28px', borderRadius: '6px 18px 18px 18px', background: 'rgba(27,189,192,0.10)', border: '1px solid rgba(27,189,192,0.45)', fontSize: 30, lineHeight: 1.4, color: '#ffffff', opacity: p3, transform: 'translateY(' + ((1 - p3) * 18) + 'px)'}}>
        {ev.reply.slice(0, rTyped)}
        <span style={{opacity: rTyped < ev.reply.length && cur ? 1 : 0, color: TEAL}}>_</span>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ alt panel
const Panel: React.FC<{ev: PanelEv}> = ({ev}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  return (
    <div style={{position: 'absolute', left: PANEL.x, top: PANEL.y, width: PANEL.w, height: PANEL.h, borderRadius: 22, background: '#0a0f12', border: '2px solid rgba(27,189,192,0.40)', overflow: 'hidden', opacity: fade(t, 0.2, 0.8), fontFamily: SANS}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 74, display: 'flex', alignItems: 'center', gap: 14, padding: '0 28px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.10)'}}>
        <i style={{width: 12, height: 12, borderRadius: '50%', background: TEAL, display: 'block'}} />
        <span style={{fontFamily: MONO, fontSize: 24, color: 'rgba(255,255,255,0.75)', fontWeight: 700, letterSpacing: 1.5}}>{ev.baslik}</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 74, bottom: 0, padding: '34px 44px'}}>
        {ev.kind === 'humanize' ? <IlHumanize t={t} /> : null}
        {ev.kind === 'dashboard' ? <IlDashboard fps={fps} frame={frame} /> : null}
        {ev.kind === 'study' ? <IlStudy t={t} /> : null}
        {ev.kind === 'el5' ? <IlEl5 t={t} /> : null}
        {ev.kind === 'torch' ? <IlTorch t={t} /> : null}
      </div>
    </div>
  );
};

const IlHumanize: React.FC<{t: number}> = ({t}) => {
  const swap = fade(t, 3.2, 4.0);
  return (
    <div>
      <div style={{position: 'absolute', left: 44, right: 44, top: 70, opacity: 1 - swap, transform: 'translateY(' + (-swap * 30) + 'px)'}}>
        <div style={{fontFamily: MONO, fontSize: 24, color: 'rgba(255,255,255,0.45)', letterSpacing: 3, marginBottom: 18}}>ÖNCE</div>
        <div style={{fontSize: 38, lineHeight: 1.35, color: 'rgba(255,255,255,0.55)'}}>Bu çalışma yöntemi oldukça verimli bir yaklaşımdır.</div>
      </div>
      <div style={{position: 'absolute', left: 44, right: 44, top: 500, opacity: swap, transform: 'translateY(' + ((1 - swap) * 30) + 'px)'}}>
        <div style={{fontFamily: MONO, fontSize: 24, color: TEAL, letterSpacing: 3, marginBottom: 18}}>SONRA</div>
        <div style={{fontSize: 38, lineHeight: 1.35, color: '#ffffff'}}>Bu yöntem çok işe yarar.</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 320, display: 'flex', justifyContent: 'center', opacity: 0.55}}>
        <svg width={54} height={64} viewBox='0 0 24 24'>
          <path d='M12 3v13m0 0l-5-5m5 5l5-5' fill='none' stroke={TEAL} strokeWidth={1.8} strokeLinecap='round' strokeLinejoin='round' />
        </svg>
      </div>
      <div style={{position: 'absolute', left: 44, right: 44, top: 800, fontSize: 28, color: 'rgba(255,255,255,0.45)'}}>Metnini yapıştır, ardından komutu yaz.</div>
    </div>
  );
};

const IlDashboard: React.FC<{fps: number; frame: number}> = ({fps, frame}) => {
  const vals = [0.42, 0.66, 0.55, 0.88, 0.74];
  return (
    <div style={{position: 'absolute', left: 44, right: 44, top: 130, bottom: 90}}>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: 'rgba(255,255,255,0.25)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around'}}>
        {vals.map((v, i) => {
          const g = spring({frame: frame - i * 9, fps, config: {damping: 16}});
          return <div key={i} style={{width: 96, height: (v * 100 * Math.max(0, g)) + '%', background: i === vals.length - 1 ? TEAL : 'rgba(27,189,192,0.42)', borderRadius: '10px 10px 0 0'}} />;
        })}
      </div>
    </div>
  );
};

const IlStudy: React.FC<{t: number}> = ({t}) => {
  const adimlar = ['Seviyeni sorar', 'Adım adım anlatır', 'Sana test eder'];
  return (
    <div style={{position: 'absolute', left: 44, right: 44, top: 140, display: 'flex', flexDirection: 'column', gap: 130}}>
      {adimlar.map((a, i) => {
        const g = fade(t, 1.2 + i * 1.1, 1.9 + i * 1.1);
        return (
          <div key={a} style={{display: 'flex', alignItems: 'center', gap: 26, opacity: g, transform: 'translateX(' + ((1 - g) * 24) + 'px)'}}>
            <div style={{width: 62, height: 62, borderRadius: '50%', border: '3px solid ' + TEAL, color: TEAL, fontFamily: MONO, fontSize: 30, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>{i + 1}</div>
            <div style={{fontSize: 38, color: '#ffffff'}}>{a}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 44, right: 44, top: 700, fontSize: 28, color: 'rgba(255,255,255,0.45)'}}>Sınav çalışırken tam da bu lazım.</div>
    </div>
  );
};

const IlEl5: React.FC<{t: number}> = ({t}) => {
  const seviyeler = ['5 yaş', '12 yaş', '25 yaş'];
  return (
    <div style={{position: 'absolute', left: 44, right: 44, top: 280, display: 'flex', gap: 26, justifyContent: 'center'}}>
      {seviyeler.map((s, i) => {
        const on = i === 0;
        const g = fade(t, 1.4 + i * 0.45, 2.0 + i * 0.45);
        return (
          <div key={s} style={{fontFamily: MONO, fontSize: 34, fontWeight: 700, padding: '24px 30px', borderRadius: 14, color: on ? '#04191a' : 'rgba(255,255,255,0.55)', background: on ? TEAL : 'rgba(255,255,255,0.05)', border: '2px solid ' + (on ? TEAL : 'rgba(255,255,255,0.16)'), opacity: g, transform: 'translateY(' + ((1 - g) * 20) + 'px)', boxShadow: on ? '0 0 34px rgba(27,189,192,0.32)' : 'none'}}>
            {s}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 44, right: 44, top: 580, textAlign: 'center', fontFamily: MONO, fontSize: 34, color: '#ffffff'}}>&gt; /el5 5</div>
      <div style={{position: 'absolute', left: 44, right: 44, top: 690, textAlign: 'center', fontSize: 28, color: 'rgba(255,255,255,0.45)'}}>Seviyeyi sen yazarsın.</div>
    </div>
  );
};

const IlTorch: React.FC<{t: number}> = ({t}) => {
  const g = fade(t, 1.2, 1.9);
  return (
    <div style={{position: 'absolute', left: 44, right: 44, top: 120, display: 'flex', flexDirection: 'column', gap: 60}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 24, opacity: 1 - g * 0.6}}>
        <div style={{width: 56, height: 56, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.30)'}} />
        <div style={{fontSize: 32, color: 'rgba(255,255,255,0.55)', textDecoration: 'line-through'}}>Eski veri</div>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 24, opacity: g, transform: 'translateY(' + ((1 - g) * 20) + 'px)'}}>
        <svg width={56} height={56} viewBox='0 0 24 24' style={{flexShrink: 0}}>
          <circle cx={12} cy={12} r={10} fill='none' stroke={TEAL} strokeWidth={2.4} />
          <path d='M7 12.4l3.2 3.2L17 8.8' fill='none' stroke={TEAL} strokeWidth={2.6} strokeLinecap='round' strokeLinejoin='round' />
        </svg>
        <div style={{fontSize: 32, fontWeight: 700, color: TEAL, background: 'rgba(27,189,192,0.16)', border: '1px solid rgba(27,189,192,0.5)', padding: '6px 16px', borderRadius: 10}}>Güncel veri</div>
      </div>
      <div style={{position: 'absolute', left: 44, right: 44, top: 700, textAlign: 'center', fontFamily: MONO, fontSize: 34, color: '#ffffff'}}>&gt; /torch</div>
      <div style={{position: 'absolute', left: 44, right: 44, top: 800, textAlign: 'center', fontSize: 28, color: 'rgba(255,255,255,0.45)'}}>Eski veri değil, güncel veri.</div>
    </div>
  );
};

// ------------------------------------------------------------------ giris / cta
const Giris: React.FC<{ev: GirisEv; theme: Theme}> = ({ev, theme}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const l = fade(t, 0.2, 0.9);
  const ti = fade(t, 0.7, 1.4);
  const counter: Ev = {type: 'counter', start: ev.start, dur: ev.dur, to: ev.cTo, suffix: ev.cSuffix, label: ev.cLabel, pos: 'orta'};
  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: SANS, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <Img src={staticFile('m/' + ev.logo)} style={{height: 132, width: 132, borderRadius: 30, marginTop: 230, opacity: l, transform: 'scale(' + (0.85 + 0.15 * l) + ')'}} />
      <div style={{marginTop: 56, fontSize: 66, lineHeight: 1.15, fontWeight: 800, color: '#ffffff', textAlign: 'center', maxWidth: 960, opacity: ti, transform: 'translateY(' + ((1 - ti) * 22) + 'px)'}}>{ev.title}</div>
      <div style={{marginTop: 24, fontFamily: MONO, fontSize: 30, color: TEAL, letterSpacing: 1, opacity: ti}}>{ev.sub}</div>
      <div style={{position: 'absolute', top: 900, left: 0, width: 1080, height: 1400, opacity: fade(t, 3.0, 3.6)}}>
        <BoxProvider box={{width: 1080, height: 1920, u: U}}>
          <One ev={{...counter, pos: 'ust'}} dur={Math.round(3 * fps)} theme={theme} />
        </BoxProvider>
      </div>
    </div>
  );
};

const Cta: React.FC<{ev: CtaEv; theme: Theme}> = ({ev, theme}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const counter: Ev = {type: 'counter', start: ev.start, dur: ev.dur, to: ev.cTo, suffix: ev.cSuffix, label: ev.cLabel, pos: 'orta'};
  const sub: Ev = {type: 'subscribe', start: ev.start, dur: ev.dur, text: ev.subscribe, pos: 'orta'};
  const note: Ev = {type: 'text', start: ev.start, dur: ev.dur, text: ev.note, pos: 'orta'};
  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: SANS}}>
      <div style={{position: 'absolute', top: 240, left: 0, width: 1080, height: 1400, opacity: fade(t, 0, 0.6)}}>
        <BoxProvider box={{width: 1080, height: 1920, u: U}}>
          <One ev={{...counter, pos: 'ust'}} dur={Math.round(2.2 * fps)} theme={theme} />
        </BoxProvider>
      </div>
      <div style={{position: 'absolute', top: 640, left: 0, width: 1080, height: 1400, opacity: fade(t, 1.6, 2.2)}}>
        <BoxProvider box={{width: 1080, height: 1920, u: U}}>
          <One ev={{...sub, pos: 'ust'}} dur={Math.round(3.4 * fps)} theme={theme} />
        </BoxProvider>
      </div>
      <div style={{position: 'absolute', top: 1000, left: 0, width: 1080, height: 1400, opacity: fade(t, 3.2, 3.8)}}>
        <BoxProvider box={{width: 1080, height: 1920, u: U}}>
          <One ev={{...note, pos: 'ust'}} dur={Math.round(2.4 * fps)} theme={theme} />
        </BoxProvider>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ kompozisyon
const STANDART = ['title', 'counter', 'logo', 'text', 'subscribe', 'progress', 'list', 'frame', 'spotlight', 'marker', 'arrow', 'keys', 'card', 'chapter'];

export const Grafik: React.FC<GProps> = (p) => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const t = frame / fps;
  const yuzVar = p.faceShow.some(([s, e]) => t >= s - 0.45 && t <= e + 0.45);
  const kutu = {width: 1080, height: yuzVar ? 1400 : 1920, u: U};
  return (
    <AbsoluteFill style={{background: BG, fontFamily: SANS}}>
      <ArkaPlan />
      <UstBar p={p} />
      {p.events.map((ev, i) => {
        const from = Math.round(ev.start * fps);
        const dur = Math.max(1, Math.round(ev.dur * fps));
        const ic = ev as any;
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            {ic.type === 'giris' ? <Giris ev={ic} theme={p.theme} /> : null}
            {ic.type === 'sohbet' ? <Sohbet ev={ic} /> : null}
            {ic.type === 'panel' ? <Panel ev={ic} /> : null}
            {ic.type === 'cta' ? <Cta ev={ic} theme={p.theme} /> : null}
            {STANDART.includes(ic.type) ? (
              <BoxProvider box={kutu}>
                <One ev={ic as Ev} dur={dur} theme={p.theme} />
              </BoxProvider>
            ) : null}
          </Sequence>
        );
      })}
      <Yuz p={p} />
    </AbsoluteFill>
  );
};
