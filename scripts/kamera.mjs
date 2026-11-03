// Yatay kadraj (kamera) hareketi: crop+scale ile kirpma/kaydirma, sonra istege bagli bulaniklastirma.
// Kullanim: node scripts/kamera.mjs out/kamera.json
// Girdi (JSON): {src, out, srcW, srcH, fps, duration, segments:[{t0,t1,cx0,cy0,w0,cx1,cy1,w1}], blur:[{x,y,w,h,r}]}
// cx/cy: kaynagin piksel merkezi, w: kirpma genisligi (piksel). H = w*9/16 her zaman.
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';

const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const {src, out, srcW, srcH, segments, blur = []} = cfg;
if (!src || !out || !segments?.length) {
  console.error('Eksik alan: src, out, segments');
  process.exit(1);
}

const n = (v) => Math.round(v * 100) / 100;
const even = (expr) => `2*floor((${expr})/2)`;
const prog = (s) => `min(max((t-${n(s.t0)})/${n(s.t1 - s.t0)},0),1)`;
const wRaw = (s) => `${n(s.w0)}+(${n(s.w1 - s.w0)})*${prog(s)}`;
const wExp = (s) => even(wRaw(s));
const hExp = (s) => even(`(${wExp(s)})*9/16`);
const xExp = (s) => even(`${n(s.cx0)}+(${n(s.cx1 - s.cx0)})*${prog(s)}-(${wExp(s)})/2`);
const yExp = (s) => even(`${n(s.cy0)}+(${n(s.cy1 - s.cy0)})*${prog(s)}-(${hExp(s)})/2`);

const args = ['-y', '-i', src];
for (const s of segments) {
  args.push('-ss', n(s.t0).toString(), '-t', n(s.t1 - s.t0).toString(), '-i', src);
}

const parts = [];
segments.forEach((s, i) => {
  parts.push(
    `[${i + 1}:v]crop=w='${wExp(s)}':h='${hExp(s)}':x='${xExp(s)}':y='${yExp(s)}',` +
    `scale=${srcW}:${srcH}:flags=lanczos,setsar=1[s${i}]`
  );
});
parts.push(`${segments.map((_, i) => `[s${i}]`).join('')}concat=n=${segments.length}:v=1:a=0[cam]`);

if (blur.length) {
  parts.push('[cam]split[bg][fg]');
  blur.forEach((b, i) => {
    parts.push(`[fg]crop=${Math.round(b.w / 2) * 2}:${Math.round(b.h / 2) * 2}:${Math.round(b.x)}:${Math.round(b.y)},boxblur=${b.r}:1[b${i}]`);
  });
  let cur = 'b0';
  blur.slice(1).forEach((b, i) => {
    parts.push(`[${cur}][b${i + 1}]overlay=${Math.round(b.x)}:${Math.round(b.y)}[bb${i + 1}]`);
    cur = `bb${i + 1}`;
  });
  parts.push(`[bg][${cur}]overlay=${Math.round(blur[0].x)}:${Math.round(blur[0].y)}[cam2]`);
  parts.push('[cam2]null[v]');
} else {
  parts.push('[cam]null[v]');
}

args.push(
  '-filter_complex', parts.join(';'),
  '-map', '[v]', '-map', '0:a?',
  '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p',
  '-c:a', 'copy', '-shortest', out
);

const r = spawnSync('ffmpeg', args, {encoding: 'utf8', maxBuffer: 1 << 26});
if (r.status !== 0) {
  console.error(r.stderr?.split('\n').slice(-25).join('\n'));
  process.exit(r.status || 1);
}
console.log(`Kamera: ${out} (${segments.length} segment)`);
