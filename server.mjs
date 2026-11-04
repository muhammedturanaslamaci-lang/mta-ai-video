// Formu açan ve dosyaları proje klasörüne yazan küçük yerel sunucu. Sadece bu bilgisayardan erişilir.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {exec, spawn} from 'node:child_process';
import {pipeline} from 'node:stream/promises';

const root = path.dirname(fileURLToPath(import.meta.url));
const matRoot = path.join(root, 'materyaller');
let port = 4173;

const hostOk = (req) => /^(127\.0\.0\.1|localhost):\d+$/.test(req.headers.host || '');
const json = (res, code, obj) => { res.writeHead(code, {'Content-Type': 'application/json; charset=utf-8'}); res.end(JSON.stringify(obj)); };

const server = http.createServer(async (req, res) => {
  try {
    if (!hostOk(req)) return json(res, 403, {ok: false, error: 'host'});
    const url = new URL(req.url, 'http://127.0.0.1');
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/form.html')) {
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      return res.end(fs.readFileSync(path.join(root, 'form.html')));
    }
    if (req.method === 'GET' && url.pathname === '/api/ping') return json(res, 200, {ok: true, platform: process.platform});
    if (req.method === 'POST' && url.pathname === '/api/save') {
      if (req.headers['x-form'] !== '1') return json(res, 403, {ok: false, error: 'header'});
      const rel = (url.searchParams.get('p') || '').replace(/\\/g, '/');
      const parts = rel.split('/');
      if (parts[0] !== 'materyaller' || parts.length < 3 || parts.some((p) => !p || p === '.' || p === '..' || /[<>:"|?*\0]/.test(p))) {
        return json(res, 400, {ok: false, error: 'yol'});
      }
      const target = path.resolve(root, ...parts);
      if (!target.startsWith(matRoot + path.sep)) return json(res, 400, {ok: false, error: 'yol'});
      fs.mkdirSync(path.dirname(target), {recursive: true});
      await pipeline(req, fs.createWriteStream(target));
      return json(res, 200, {ok: true});
    }
    if (req.method === 'POST' && url.pathname === '/api/move') {
      if (req.headers['x-form'] !== '1') return json(res, 403, {ok: false, error: 'header'});
      const from = url.searchParams.get('from') || '', to = url.searchParams.get('to') || '';
      if (!/^[a-z0-9-]+$/.test(from) || !/^[a-z0-9-]+$/.test(to)) return json(res, 400, {ok: false, error: 'ad'});
      const a = path.join(matRoot, from), b = path.join(matRoot, to);
      if (!fs.existsSync(a) || fs.existsSync(b)) return json(res, 409, {ok: false, error: 'tasinamadi'});
      fs.renameSync(a, b);
      return json(res, 200, {ok: true});
    }
    if (req.method === 'POST' && url.pathname === '/api/baslat') {
      if (req.headers['x-form'] !== '1') return json(res, 403, {ok: false, error: 'header'});
      const tool = url.searchParams.get('tool') || '', slug = url.searchParams.get('slug') || '', weak = url.searchParams.get('weak') === '1' ? '1' : '0';
      if (!['claude', 'codex', 'gemini'].includes(tool) || !/^[a-z0-9-]+$/.test(slug)) return json(res, 400, {ok: false, error: 'arac'});
      if (!fs.existsSync(path.join(matRoot, slug, 'brief.md'))) return json(res, 409, {ok: false, error: 'brif-yok'});
      if (process.platform === 'darwin') {
        // Mac: geçici bir .command dosyası yazıp Terminal'de aç (otomasyon izni gerektirmez)
        const q = (s) => "'" + s.replace(/'/g, "'\\''") + "'";
        const script = `#!/bin/bash\ncd ${q(root)} && bash ./baslat-arac.sh ${tool} ${slug} ${weak}\n`;
        if (process.env.VEW_DRYRUN === '1') return json(res, 200, {ok: true, dry: true, script});
        const file = path.join(os.tmpdir(), 'video-edit-baslat.command');
        fs.writeFileSync(file, script, {mode: 0o755});
        fs.chmodSync(file, 0o755);
        spawn('open', ['-a', 'Terminal', file], {detached: true, stdio: 'ignore'}).unref();
        return json(res, 200, {ok: true});
      }
      const argv = ['/c', 'start', '"Video edit"', 'cmd', '/k', 'baslat-arac.bat', tool, slug, weak];
      if (process.env.VEW_DRYRUN === '1') return json(res, 200, {ok: true, dry: true, argv});
      if (process.platform !== 'win32') return json(res, 501, {ok: false, error: 'desteklenmiyor'});
      spawn('cmd.exe', argv, {cwd: root, detached: true, stdio: 'ignore', windowsVerbatimArguments: true}).unref();
      return json(res, 200, {ok: true});
    }
    if (url.pathname === '/api/ayar') {
      if (req.headers['x-form'] !== '1') return json(res, 403, {ok: false, error: 'header'});
      const dir = path.join(root, 'ayarlar'), file = path.join(dir, 'stiller.json');
      if (req.method === 'GET') {
        let ayar = {};
        try { ayar = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) {}
        return json(res, 200, {ok: true, ayar});
      }
      if (req.method === 'POST') {
        const chunks = []; let size = 0;
        for await (const c of req) { size += c.length; if (size > 1e6) return json(res, 413, {ok: false, error: 'buyuk'}); chunks.push(c); }
        let obj;
        try { obj = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch (e) { return json(res, 400, {ok: false, error: 'json'}); }
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return json(res, 400, {ok: false, error: 'json'});
        fs.mkdirSync(dir, {recursive: true});
        fs.writeFileSync(file, JSON.stringify(obj, null, 1));
        return json(res, 200, {ok: true});
      }
    }
    json(res, 404, {ok: false});
  } catch (e) {
    json(res, 500, {ok: false, error: String(e && e.message)});
  }
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE' && port < 4200) { port++; server.listen(port, '127.0.0.1'); }
  else { console.error('Sunucu açılamadı:', e.message); process.exit(1); }
});
server.on('listening', () => {
  const addr = `http://127.0.0.1:${port}`;
  console.log(`Form açık: ${addr}`);
  console.log('Bu pencereyi formu kullandığın sürece açık tut. Kapatmak için pencereyi kapat.');
  const cmd = process.platform === 'win32' ? `start "" ${addr}` : process.platform === 'darwin' ? `open ${addr}` : `xdg-open ${addr}`;
  exec(cmd, () => {});
});
server.listen(port, '127.0.0.1');
