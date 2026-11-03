// dikey.json uretir: kaynak yuzde koordinatlarini ekran penceresi koordinatlarina cevirir.
import fs from 'node:fs';

const SRCW = 1920, SRCH = 1080, CW = 1080, H_FULL = 1720, H_FACE = 1290;
const DUR = 58.51, HIZ = 1.1, FPS = 30;
const FACE = {x: 83, y: 32, w: 15.5, h: 38};
const FACE_SHOW = [[0, 6.4], [52.6, DUR]];

const faceOn = (t) => FACE_SHOW.some(([s, e]) => t >= s - 0.4 && t <= e + 0.4);
const winH = (t) => (faceOn(t) ? H_FACE : H_FULL);

// srcW/srcH yuzde kutusu -> ekran penceresi yuzde kutusu
const toWin = (k, box, t) => {
  const wh = winH(t);
  const s = CW / ((k.w / 100) * SRCW);
  const vw = CW / s, vh = wh / s;
  const cxp = (k.cx / 100) * SRCW, cyp = (k.cy / 100) * SRCH;
  const X0 = Math.max(0, Math.min(SRCW - vw, cxp - vw / 2));
  const Y0 = vh >= SRCH ? 0 : Math.max(0, Math.min(SRCH - vh, cyp - vh / 2));
  const f = (a, b) => (((a / 100) * SRCW - X0) * s / CW) * 100;
  const g = (a) => (((a / 100) * SRCH - Y0) * s / wh) * 100;
  return {x: f(box.x), y: g(box.y), w: f(box.x + box.w) - f(box.x), h: g(box.y + box.h) - g(box.y)};
};
const r2 = (n) => Math.round(n * 100) / 100;

// --- kadraj (kaynak yuzde) ---
const K = [
  {t: 0.0, cx: 25, cy: 50, w: 78},   // genel plan: uygulamanin tamami (kisisel bilgiler bulanik)
  {t: 1.9, cx: 57, cy: 24, w: 34},   // kanca cumlesi
  {t: 5.6, cx: 52, cy: 27, w: 32},
  {t: 8.4, cx: 44, cy: 28, w: 30},   // /humanize detay
  {t: 11.2, cx: 57, cy: 30, w: 34},
  {t: 14.0, cx: 50, cy: 29, w: 33},
  {t: 16.8, cx: 52, cy: 34, w: 33},
  {t: 19.6, cx: 45, cy: 35, w: 30},  // /dashboard detay
  {t: 22.4, cx: 57, cy: 36, w: 34},
  {t: 25.2, cx: 54, cy: 39, w: 32},
  {t: 28.0, cx: 46, cy: 41, w: 30},  // /study detay
  {t: 30.8, cx: 57, cy: 41, w: 34},
  {t: 33.6, cx: 50, cy: 45, w: 32},
  {t: 36.4, cx: 58, cy: 46, w: 30},  // "5 yasindaki" detay
  {t: 39.2, cx: 57, cy: 47, w: 34},
  {t: 42.0, cx: 52, cy: 50, w: 32},
  {t: 44.8, cx: 58, cy: 52, w: 30},  // "eski bilgisinden" detay
  {t: 47.6, cx: 57, cy: 53, w: 34},
  {t: 50.4, cx: 54, cy: 57, w: 32},
  {t: 53.2, cx: 57, cy: 65, w: 36},
  {t: 56.0, cx: 57, cy: 68, w: 34},
  {t: 57.9, cx: 57, cy: 67, w: 35},
];
const at = (t) => K.reduce((a, k) => (k.t <= t ? k : a), K[0]);

// --- ekrandaki hedef bolgeler (kaynak yuzde) ---
const SRC = {
  humanize: {x: 41.6, y: 25.5, w: 4.3, h: 2.2},   // /humanize
  dashboard: {x: 41.6, y: 33.5, w: 4.7, h: 2.2},  // /dashboard
  study: {x: 42.8, y: 39.3, w: 2.7, h: 2.2},      // /study
  yas5: {x: 55.4, y: 44.3, w: 4.1, h: 2.4},       // "5 yasindaki"
  eski: {x: 54.2, y: 50.0, w: 6.6, h: 2.4},       // "eski bilgisinden"
};

const box = (name, t) => {
  const b = toWin(at(t), SRC[name], t);
  return {x: r2(b.x), y: r2(b.y), w: r2(b.w), h: r2(b.h)};
};

const ev = [];
// giris / kanca
ev.push({type: 'logo', start: 0.3, dur: 2.3, file: 'yp-claude.svg', pos: 'sag-ust', ref: 'ekran'});
ev.push({type: 'title', start: 1.5, dur: 2.8, title: '1 milyar kiÅŸi hÃ¢lÃ¢ uzun yazÄ±yor', sub: '5 kÄ±sayolla 10 saniyede aynÄ± cevap', pos: 'orta'});
ev.push({type: 'logo', start: 4.3, dur: 2.1, file: 'yp-chatgpt.svg', pos: 'sag-ust'});
ev.push({type: 'counter', start: 4.3, dur: 2.1, to: 10, suffix: ' saniye', label: '5 kÄ±sayolla aynÄ± cevap', pos: 'orta'});

const bolum = [
  {s: 5.6, e: 17.0, key: '/humanize', no: '1. Komut', body: 'Yapay zekÃ¢nÄ±n robotik Ã§Ä±ktÄ±sÄ±nÄ± insan eli gibi yazÄ±ya Ã§evirir'},
  {s: 17.1, e: 24.9, key: '/dashboard', no: '2. Komut', body: 'Harcama ve kullanÄ±m verilerini tek panelde gÃ¶sterir'},
  {s: 25.0, e: 33.3, key: '/study', no: '3. Komut', body: 'Konuyu adÄ±m adÄ±m Ã¶ÄŸretir, sonra seni test eder'},
  {s: 33.4, e: 45.0, key: '/el5', no: '4. Komut', body: 'Konuyu 5 yaÅŸÄ±ndaki bir Ã§ocuÄŸa anlatÄ±r gibi anlatÄ±r'},
  {s: 45.1, e: 52.8, key: '/torch', no: '5. Komut', body: 'Eski veri yerine gÃ¼ncel veriyi getirmesini saÄŸlar'},
];
for (const b of bolum) {
  ev.push({type: 'keys', start: b.s, dur: r2(b.e - b.s), keys: [b.key], pos: 'ust', ref: 'ekran'});
  ev.push({type: 'card', start: b.s, dur: r2(b.e - b.s), title: b.no, body: b.body, pos: 'alt', ref: 'ekran'});
}

// ekran uzerindeki detay vurgulari
ev.push({type: 'frame', start: 8.5, dur: 1.7, ref: 'ekran', label: '/humanize', ...box('humanize', 8.5)});
ev.push({type: 'spotlight', start: 19.7, dur: 1.7, ref: 'ekran', ...box('dashboard', 19.7)});
ev.push({type: 'marker', start: 28.1, dur: 1.7, ref: 'ekran', ...box('study', 28.1)});
ev.push({type: 'arrow', start: 36.5, dur: 1.7, ref: 'ekran', from: 'alt', ...(() => {const b = box('yas5', 36.5); return {x: r2(b.x + b.w / 2), y: r2(b.y + b.h)};})()});
ev.push({type: 'cursor', start: 44.9, dur: 1.7, ref: 'ekran', ring: true, ...(() => {const b = box('eski', 44.9); return {x: r2(b.x + b.w / 2), y: r2(b.y + b.h / 2)};})()});

// ara sayilar
ev.push({type: 'counter', start: 34.6, dur: 1.9, to: 5, suffix: ' yaÅŸ', label: 'Ã§ocuk seviyesinde anlatÄ±m', pos: 'orta', ref: 'ekran'});
ev.push({type: 'logo', start: 28.8, dur: 3.8, file: 'yp-chatgpt.svg', pos: 'sag-ust', ref: 'ekran'});

// cagri (CTA)
ev.push({type: 'counter', start: 52.9, dur: 2.1, to: 5, suffix: ' komut', label: 'bugÃ¼n Ã¶ÄŸrendiÄŸin kÄ±sayollar', pos: 'ust', ref: 'ekran'});
ev.push({type: 'subscribe', start: 54.6, dur: 3.7, text: 'KanalÄ± takip et', pos: 'sol-alt', ref: 'ekran'});
ev.push({type: 'text', start: 56.4, dur: 2.0, text: 'Bilmeyen arkadaÅŸÄ±na gÃ¶nder', pos: 'ust', ref: 'ekran'});

ev.push({type: 'progress', start: 0, dur: DUR});

const plan = {
  width: CW, height: 1920, fps: FPS, duration: DUR, hiz: HIZ,
  video: 'yp-taban.mp4', srcW: SRCW, srcH: SRCH, bg: '#000000',
  face: FACE, faceShow: FACE_SHOW,
  theme: {primary: '#1bbdc0', secondary: '#000000', accent: '#ffffff', style: 'terminal'},
  kadraj: K, events: ev,
};
fs.writeFileSync('dikey-yp.json', JSON.stringify(plan, null, 1));
console.log('dikey-yp.json yazildi. olay:', ev.length, 'kadraj:', K.length);
for (const e of ev) if (['frame', 'spotlight', 'marker', 'arrow', 'cursor'].includes(e.type)) console.log(e.type, e.start, JSON.stringify(e));
