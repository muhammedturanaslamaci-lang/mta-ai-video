// Kullanım:
//   node scripts/analiz.mjs VIDEO                       -> bilgi + kareler (kamera tespiti için)
//   node scripts/analiz.mjs VIDEO --kamera x,y,w,h      -> + ekranın durağan aralıkları (kamera kutusu yüzde, hesaptan çıkarılır)
// Çıktı: out/analiz.json ve out/kareler/ (tek tek kareler + sheet.png)
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';

const args = process.argv.slice(2);
const video = args.find((a) => !a.startsWith('--'));
if (!video || !fs.existsSync(video)) { console.error('Video bulunamadı. Kullanım: node scripts/analiz.mjs VIDEO [--kamera x,y,w,h]'); process.exit(1); }
const kIdx = args.indexOf('--kamera');
const kamera = kIdx >= 0 ? args[kIdx + 1].split(',').map(Number) : null;

const run = (cmd, a) => spawnSync(cmd, a, {encoding: 'utf8', maxBuffer: 1 << 26});
const probe = JSON.parse(run('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', video]).stdout || '{}');
const v = (probe.streams || []).find((s) => s.codec_type === 'video');
if (!v) { console.error('Video akışı okunamadı.'); process.exit(1); }
const hasAudio = (probe.streams || []).some((s) => s.codec_type === 'audio');
const [fn, fd] = (v.r_frame_rate || '30/1').split('/').map(Number);
const dur = Number(probe.format.duration);
const W = v.width, H = v.height;
const oran = W / H > 1.2 ? 'yatay' : W / H < 0.83 ? 'dikey' : 'kare';

fs.mkdirSync('out/kareler', {recursive: true});
// 6 eşit aralıklı kare + kontak sayfası
const n = 6;
for (let i = 0; i < n; i++) {
  const t = (dur * (i + 0.5)) / n;
  run('ffmpeg', ['-v', 'error', '-y', '-ss', t.toFixed(2), '-i', video, '-frames:v', '1', `out/kareler/k${i + 1}.png`]);
}
run('ffmpeg', ['-v', 'error', '-y', '-framerate', '1', '-i', 'out/kareler/k%d.png', '-vf', 'scale=640:-1,tile=3x2', '-frames:v', '1', 'out/kareler/sheet.png']);

const parse = (txt, a, b) => {
  const out = []; let s = null;
  for (const line of txt.split('\n')) {
    const m1 = line.match(new RegExp(a + ':\\s*([0-9.]+)')), m2 = line.match(new RegExp(b + ':\\s*([0-9.]+)'));
    if (m1) s = Number(m1[1]);
    if (m2 && s !== null) { out.push([s, Number(m2[1])]); s = null; }
  }
  if (s !== null) out.push([s, dur]);
  return out;
};

// sessiz aralıklar
const sil = run('ffmpeg', ['-hide_banner', '-i', video, '-af', 'silencedetect=noise=-35dB:d=1.2', '-f', 'null', '-']);
const sessiz = parse(sil.stderr, 'silence_start', 'silence_end');

// durağan ekran aralıkları: kamera kutusu karartılır, sadece ekran izlenir
let donuk = null;
if (kamera) {
  const [x, y, w, h] = kamera;
  const box = `drawbox=x=iw*${x / 100}:y=ih*${y / 100}:w=iw*${w / 100}:h=ih*${h / 100}:color=black:t=fill`;
  const fr = run('ffmpeg', ['-hide_banner', '-i', video, '-vf', `scale=480:-2,${box},freezedetect=n=-48dB:d=1.5`, '-an', '-f', 'null', '-']);
  donuk = parse(fr.stderr, 'freeze_start', 'freeze_end').map(([a, b]) => [Number(a.toFixed(1)), Number(b.toFixed(1))]);
}
const donukSure = donuk ? donuk.reduce((a, [s, e]) => a + (e - s), 0) : null;

const res = {
  dosya: video, genislik: W, yukseklik: H, oran, fps: Math.round(fn / fd), sure: Number(dur.toFixed(2)), ses: hasAudio,
  sessiz, kamera, donuk, donukSure: donukSure === null ? null : Number(donukSure.toFixed(1)),
  donukOran: donukSure === null ? null : Number((donukSure / dur).toFixed(2))
};
fs.writeFileSync('out/analiz.json', JSON.stringify(res, null, 1));
console.log(`Video: ${W}x${H} (${oran}), ${dur.toFixed(1)} sn, ${res.fps} fps, ses: ${hasAudio ? 'var' : 'yok'}`);
console.log(`Kareler: out/kareler/sheet.png (kamera ve ekran alanını buradan belirle)`);
if (donuk) {
  console.log(`Durağan ekran: ${donukSure.toFixed(1)} sn (%${Math.round(res.donukOran * 100)}). Aralıklar: ${donuk.map(([a, b]) => `${a}-${b}`).join(', ') || 'yok'}`);
  if (res.donukOran > 0.25) console.log('UYARI: Ekranın büyük kısmı durağan. Bu aralıklarda kadraj hareketi ve efekt ŞART (kontrol.mjs plan bunu zorunlu tutar).');
} else console.log('Durağan ekran analizi için kamera kutusunu ver: --kamera x,y,w,h (yüzde). Kamera yoksa --kamera 0,0,0,0');
