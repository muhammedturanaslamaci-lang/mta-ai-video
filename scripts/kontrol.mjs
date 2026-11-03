// Kullanım:
//   node scripts/kontrol.mjs plan dikey.json     -> render ÖNCESİ plan doğrulaması
//   node scripts/kontrol.mjs sahne sahne.json    -> sesli anlatım + görsel planı (ekran hep dolu mu)
//   node scripts/kontrol.mjs cikti out/video.mp4 [--sure SN] -> render SONRASI ölçüm
// Başarısızlık varsa çıkış kodu 1 olur. Teslimden önce hepsi geçmeli.
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';

const [mod, file, ...rest] = process.argv.slice(2);
const fails = [], warns = [];
const fail = (m) => fails.push(m), warn = (m) => warns.push(m);
const run = (cmd, a, o = {}) => spawnSync(cmd, a, {encoding: 'utf8', maxBuffer: 1 << 28, ...o});

// ---- layout.ts ile aynı geometri ----
const CW = 1080, TOP = 100, H_FULL = 1720, H_FACE = 1290;
const visibleRect = (k, srcW, srcH, winW, winH) => {
  const s = winW / ((k.w / 100) * srcW);
  const vw = winW / s, vh = winH / s;
  const cx = (k.cx / 100) * srcW, cy = (k.cy / 100) * srcH;
  const x = Math.max(0, Math.min(srcW - vw, cx - vw / 2));
  const y = vh >= srcH ? 0 : Math.max(0, Math.min(srcH - vh, cy - vh / 2));
  return {x: x / srcW * 100, y: y / srcH * 100, w: Math.min(vw, srcW) / srcW * 100, h: Math.min(vh, srcH) / srcH * 100};
};
const inter = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const inShow = (t, show) => show.some(([s, e]) => t >= s - 0.4 && t <= e + 0.4);

if (mod === 'plan') {
  const p = JSON.parse(fs.readFileSync(file, 'utf8'));
  const req = ['video', 'srcW', 'srcH', 'fps', 'duration', 'theme', 'events', 'kadraj', 'faceShow'];
  for (const k of req) if (p[k] === undefined) fail(`Eksik alan: ${k}`);
  if (!fails.length) {
    if (!p.kadraj.length) fail('kadraj boş. En az bir nokta gerekir.');
    for (let i = 0; i < p.kadraj.length; i++) {
      const k = p.kadraj[i];
      if (i && k.t <= p.kadraj[i - 1].t) fail(`kadraj noktaları t'ye göre artan olmalı (nokta ${i + 1})`);
      if (k.w < 30 || k.w > 100) fail(`kadraj ${i + 1}: w 30-100 arasında olmalı (şimdi ${k.w})`);
      if (k.t > p.duration) fail(`kadraj ${i + 1}: süreden sonra`);
    }
    // 1) tam ekran (w>=90) en fazla toplam 4 sn: yoksa pencere yarısı boş kalır
    let tam = 0;
    for (let i = 0; i < p.kadraj.length; i++) {
      const a = p.kadraj[i], b = p.kadraj[i + 1];
      if (a.w >= 90) tam += (b ? b.t : p.duration) - a.t;
    }
    if (tam > 4) fail(`Tüm ekranı gösteren kadraj (w>=90) toplam ${tam.toFixed(1)} sn. En fazla 4 sn olabilir. Yazıyı okutmak için w 40-60 kullan.`);
    // 2) yüz gizliyken kadraj kamera kutusuna girmemeli
    if (p.face) {
      for (const k of p.kadraj) {
        const hidden = !inShow(k.t, p.faceShow);
        if (!hidden) continue;
        const r = visibleRect(k, p.srcW, p.srcH, CW, H_FULL);
        if (inter(r, p.face)) fail(`t=${k.t}: kadraj yüz kamerasına giriyor (yüz bu anda gizli olmalı). cx/cy/w değiştir.`);
      }
    }
    // 3) efektler
    p.events.forEach((e, i) => {
      if (e.start < 0 || e.start + e.dur > p.duration + 0.05) fail(`efekt ${i + 1} (${e.type}): süre dışında`);
      if (e.ref === 'ekran') for (const f of ['x', 'y', 'w', 'h', 'fromX', 'fromY']) if (e[f] !== undefined && (e[f] < 0 || e[f] > 100)) fail(`efekt ${i + 1} (${e.type}): ${f} 0-100 olmalı`);
    });
    // 3b) konumsal efektler çalışırken kadraj hareket etmemeli
    const POS = ['frame', 'marker', 'spotlight', 'arrow', 'cursor'];
    p.events.forEach((e, i) => {
      if (e.ref !== 'ekran' || !POS.includes(e.type)) return;
      for (let j = 1; j < p.kadraj.length; j++) {
        const b = p.kadraj[j], a0 = Math.max(p.kadraj[j - 1].t, b.t - Math.min(0.7, b.t - p.kadraj[j - 1].t));
        if (a0 < e.start + e.dur && b.t > e.start) fail(`efekt ${i + 1} (${e.type}, ${e.start} sn): kadraj ${a0.toFixed(1)}-${b.t} sn arasında hareket ediyor. Efekt konumu kayar. Efekti kadraj sabitken oynat.`);
      }
    });
    // 4) durağan aralıklarda hareket ve efekt şartı
    let an = null;
    try { an = JSON.parse(fs.readFileSync('out/analiz.json', 'utf8')); } catch (e) {}
    if (an && an.donuk) {
      const hiz = p.hiz || 1;
      for (const [a0, b0] of an.donuk) {
        const a = a0 / hiz, b = b0 / hiz;
        for (let t = a; t < b - 4; t += 4) {
          const hareket = p.kadraj.some((k) => k.t > t && k.t <= t + 4) || p.events.some((e) => e.start < t + 4 && e.start + e.dur > t);
          if (!hareket) { fail(`Durağan ekran ${t.toFixed(0)}-${(t + 4).toFixed(0)} sn arası: 4 sn boyunca kadraj hareketi ya da efekt yok. Kadraj noktası veya efekt ekle.`); break; }
        }
      }
    } else warn('out/analiz.json (durağan aralıklar) yok, durağan ekran kontrolü atlandı. node scripts/analiz.mjs VIDEO --kamera x,y,w,h çalıştır.');
    // 5) vurgu rengi sadece uyarı
    p.events.filter((e) => e.type === 'text' && e.tone === 'uyari').length > 6 && warn('Çok fazla uyarı vurgusu (vurgu rengi sadece gerçek uyarı ve tehlike için).');
  }
} else if (mod === 'sahne') {
  // Sesli anlatım + görsel: kaynağın görüntüsü kullanılmaz, ekranı her an bir sahne doldurmalı.
  const p = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const k of ['width', 'height', 'fps', 'duration', 'theme', 'events', 'bg']) if (p[k] === undefined) fail(`Eksik alan: ${k}${k === 'bg' ? ' (opak arka plan rengi, örn. "#101218")' : ''}`);
  if (!fails.length) {
    if (/^#?0{3}(0{3})?$/.test(String(p.bg))) warn('bg tam siyah. Biraz renkli koyu bir ton seç (örn. #101218).');
    const ARA = ['progress', 'caption', 'cursor', 'frame', 'marker', 'spotlight', 'arrow', 'keys', 'text', 'logo', 'chapter', 'lowerthird'];
    const ana = p.events.filter((e) => !ARA.includes(e.type)).map((e) => [e.start, e.start + e.dur]).sort((a, b) => a[0] - b[0]);
    p.events.forEach((e, i) => { if (e.start < 0 || e.start + e.dur > p.duration + 0.05) fail(`efekt ${i + 1} (${e.type}): süre dışında`); });
    if (!ana.length) fail('Hiç ana sahne yok. title, card, shot, search, counter, chart, list, compare, subscribe, countdown kullan.');
    let t = 0;
    const bos = [];
    for (const [a, b] of ana) { if (a - t > 1) bos.push([t, a]); t = Math.max(t, b); }
    if (p.duration - t > 1) bos.push([t, p.duration]);
    bos.forEach(([a, b]) => fail(`${a.toFixed(1)}-${b.toFixed(1)} sn arası ekranda ana sahne yok (${(b - a).toFixed(1)} sn boş zemin). shot, card, list, chart gibi bir sahne koy.`));
    // aynı ana sahne çok uzun kalmasın
    p.events.filter((e) => !ARA.includes(e.type) && e.dur > 8).forEach((e) => warn(`${e.type} (${e.start} sn) ${e.dur} sn sürüyor. 6-8 sn'den uzun sahneleri böl ya da içine hareket ekle.`));
    // konumsal efektler bir görselin üstünde olmalı
    p.events.filter((e) => ['frame', 'marker', 'spotlight', 'arrow', 'cursor'].includes(e.type)).forEach((e) => {
      const alt = p.events.some((o) => o.type === 'shot' && o.start <= e.start && o.start + o.dur >= e.start + e.dur);
      if (!alt) warn(`${e.type} (${e.start} sn) altında shot yok. Boş zemine çerçeve çizilmez.`);
    });
  }
} else if (mod === 'cikti') {
  if (!fs.existsSync(file)) { console.error('Dosya yok'); process.exit(1); }
  const pr = JSON.parse(run('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', file]).stdout);
  const v = pr.streams.find((s) => s.codec_type === 'video');
  const dur = Number(pr.format.duration);
  if (!pr.streams.some((s) => s.codec_type === 'audio')) fail('Çıktıda ses yok.');
  const sIdx = rest.indexOf('--sure');
  if (sIdx >= 0) { const exp = Number(rest[sIdx + 1]); if (Math.abs(dur - exp) > 0.6) fail(`Süre ${dur.toFixed(1)} sn, beklenen ${exp} sn.`); }
  const dikey = v.height > v.width;
  // örnek kareler (2 fps, 108x192 gri)
  const W = 108, H = Math.round((108 * v.height) / v.width);
  const raw = run('ffmpeg', ['-v', 'error', '-i', file, '-vf', `fps=2,scale=${W}:${H},format=gray`, '-f', 'rawvideo', '-'], {encoding: 'buffer'}).stdout;
  const n = Math.floor(raw.length / (W * H));
  let bosToplam = 0;
  for (let f = 0; f < n; f++) {
    let bos = 0;
    for (let y = 0; y < H; y++) {
      let mx = 0;
      for (let x = 0; x < W; x++) { const q = raw[f * W * H + y * W + x]; if (q > mx) mx = q; }
      if (mx < 10) bos++;
    }
    bosToplam += bos / H;
  }
  const bosOrt = n ? bosToplam / n : 0;
  console.log(`Çıktı: ${v.width}x${v.height}, ${dur.toFixed(1)} sn. Tamamen siyah satır oranı: %${Math.round(bosOrt * 100)}`);
  if (dikey && bosOrt > 0.4) fail(`Karenin %${Math.round(bosOrt * 100)} kadarı tamamen siyah. Ekran paneli küçük kalmış ya da boş alan var (en fazla %40).`);
  // donuk görüntü: 3 sn'den uzun değişmeyen aralık
  const fr = run('ffmpeg', ['-hide_banner', '-i', file, '-vf', 'scale=270:-2,freezedetect=n=-50dB:d=3', '-an', '-f', 'null', '-']);
  const fz = [...fr.stderr.matchAll(/freeze_duration:\s*([0-9.]+)/g)].map((m) => Number(m[1]));
  const starts = [...fr.stderr.matchAll(/freeze_start:\s*([0-9.]+)/g)].map((m) => Number(m[1]));
  fz.forEach((d, i) => fail(`Görüntü ${starts[i] !== undefined ? starts[i].toFixed(0) : '?'}. sn'de ${d.toFixed(1)} sn boyunca hiç değişmiyor. Kadraj hareketi veya efekt ekle.`));
} else {
  console.error('Kullanım: node scripts/kontrol.mjs plan dikey.json | node scripts/kontrol.mjs sahne sahne.json | node scripts/kontrol.mjs cikti VIDEO [--sure SN]');
  process.exit(1);
}
warns.forEach((w) => console.log('Uyarı: ' + w));
if (fails.length) { fails.forEach((f) => console.log('HATA: ' + f)); console.log(`\nKONTROL BAŞARISIZ (${fails.length} sorun). Düzelt ve tekrar çalıştır.`); process.exit(1); }
console.log('KONTROL GEÇTİ.');
