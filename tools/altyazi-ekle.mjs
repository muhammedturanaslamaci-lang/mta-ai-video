// out/altyazi.json icindeki caption olaylarini dikey.json icine ekler.
import fs from 'node:fs';

const p = JSON.parse(fs.readFileSync('dikey.json', 'utf8'));
const caps = JSON.parse(fs.readFileSync('out/altyazi.json', 'utf8'));
const ids = new Set(p.events.map((e) => `${e.type}|${e.start}|${e.dur}`));
let n = 0;
for (const c of caps) {
  const key = `${c.type}|${c.start}|${c.dur}`;
  if (ids.has(key)) continue;
  p.events.push(c);
  ids.add(key);
  n++;
}
p.events.sort((a, b) => a.start - b.start);
fs.writeFileSync('dikey.json', JSON.stringify(p, null, 1), 'utf8');
console.log('eklenen caption: ' + n + ' | toplam olay: ' + p.events.length);
