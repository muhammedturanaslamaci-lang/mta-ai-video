import {DikeyProps, Kadraj} from './types';

export const CW = 1080;
export const CH = 1920;
export const TR = 0.7; // kadraj geçiş süresi (sn)
export const FACE_RAMP = 0.4;

const smooth = (x: number) => { const c = Math.max(0, Math.min(1, x)); return c * c * (3 - 2 * c); };

// yüz ne kadar görünür: 0..1
export const faceAmount = (t: number, show: [number, number][]) => {
  let a = 0;
  for (const [s, e] of show) {
    const up = smooth((t - s) / FACE_RAMP), down = smooth((e - t) / FACE_RAMP);
    a = Math.max(a, Math.min(up, down));
  }
  return a;
};

export const TOP = 100;
export const H_FULL = 1720;  // yüz yokken ekran penceresi
export const H_FACE = 1290;  // yüz varken ekran penceresi
export const FACE_Y = 1430;
export const FACE_H = 400;

export const windowRect = (t: number, show: [number, number][]) => {
  const a = faceAmount(t, show);
  return {x: 0, y: TOP, w: CW, h: H_FULL + (H_FACE - H_FULL) * a, a};
};

// kadraj: bir önceki değeri tutar, sonraki noktaya TR saniye kala geçişe başlar ve tam o noktada varır
export const kadrajAt = (t: number, k: Kadraj[]) => {
  if (!k.length) return {cx: 50, cy: 50, w: 100};
  if (t <= k[0].t) return k[0];
  for (let i = 0; i < k.length - 1; i++) {
    const a = k[i], b = k[i + 1];
    if (t >= a.t && t <= b.t) {
      const tr = Math.min(TR, b.t - a.t);
      const p = smooth((t - (b.t - tr)) / tr);
      return {cx: a.cx + (b.cx - a.cx) * p, cy: a.cy + (b.cy - a.cy) * p, w: a.w + (b.w - a.w) * p};
    }
  }
  return k[k.length - 1];
};

// görünen kaynak dikdörtgeni (kaynağın yüzdesi). Doğrulama betiği de bunu kullanır.
export const visibleRect = (k: {cx: number; cy: number; w: number}, p: Pick<DikeyProps, 'srcW' | 'srcH'>, winW: number, winH: number) => {
  const s = winW / ((k.w / 100) * p.srcW);
  const vw = winW / s, vh = winH / s; // kaynak pikseli
  const cx = (k.cx / 100) * p.srcW, cy = (k.cy / 100) * p.srcH;
  const x = Math.max(0, Math.min(p.srcW - vw, cx - vw / 2));
  const y = vh >= p.srcH ? 0 : Math.max(0, Math.min(p.srcH - vh, cy - vh / 2));
  return {x: (x / p.srcW) * 100, y: (y / p.srcH) * 100, w: (Math.min(vw, p.srcW) / p.srcW) * 100, h: (Math.min(vh, p.srcH) / p.srcH) * 100, s};
};
