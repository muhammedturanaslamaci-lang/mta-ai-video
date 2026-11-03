// Transkriptten tam altyazi (caption) olaylari uretir: 4-7 kelimelik parcalar.
// Zamanlar hizli video (1.1x) zamanina cevrilir.
import fs from 'node:fs';

const HIZ = 1.1;
const MAX = 6;
const MIN = 3;

const segs = JSON.parse(fs.readFileSync('out/transkript.json', 'utf8'));
const flat = [];
for (const s of segs) {
  const ws = (s.words || []).filter((w) => w[2] && w[2].trim());
  if (ws.length) flat.push(...ws.map((w) => ({s: w[0], e: w[1], t: w[2].trim()})));
  else if (s.text) {
    // kelime zamani yoksa segmenti duz dagit
    const ws2 = s.text.trim().split(/\s+/);
    const step = (s.end - s.start) / ws2.length;
    ws2.forEach((t, i) => flat.push({s: s.start + i * step, e: s.start + (i + 1) * step, t}));
  }
}

const out = [];
let buf = [];
const flush = () => {
  if (buf.length < MIN) {
    if (out.length && buf.length) {
      const prev = out[out.length - 1];
      prev.text += ' ' + buf.map((w) => w.t).join(' ');
      prev.dur = Number((buf[buf.length - 1].e - prev.start).toFixed(2));
      buf = [];
      return;
    }
  }
  if (!buf.length) return;
  const start = Number((buf[0].s / HIZ).toFixed(2));
  const end = Number((buf[buf.length - 1].e / HIZ).toFixed(2));
  out.push({type: 'caption', start, dur: Number((end - start).toFixed(2)), text: buf.map((w) => w.t).join(' '), karaoke: true, pos: 'alt', ref: 'ekran'});
  buf = [];
};

for (const w of flat) {
  buf.push(w);
  if (buf.length >= MAX) flush();
}
flush();

fs.writeFileSync('out/altyazi.json', JSON.stringify(out, null, 1), 'utf8');
console.log('caption olayi: ' + out.length);
console.log(out.slice(0, 4).map((c) => `${c.start}-${(c.start + c.dur).toFixed(1)} ${c.text}`).join('\n'));
console.log('...');
console.log(out.slice(-2).map((c) => `${c.start}-${(c.start + c.dur).toFixed(1)} ${c.text}`).join('\n'));
