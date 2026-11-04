# Adım adım (kısa ve katı akış)

Bu dosya küçük ve orta boy modeller içindir. Karar vermen gereken yerler az, komutlar hazır. Sırayı bozma. Bir "KAPI" hata verirse sonraki adıma geçme.
Brif: `materyaller/<video>/brief.md`. Ayrıntı gerekirse `talimat/video-edit.md`.

## Yasaklar
- Orijinal videoyu değiştirme. Çıktılar `out/` altına gider.
- Ekranı 9:16'ya sığdırıp altını boş bırakma.
- "Sesli anlatım + görsel" türünde kaynağın görüntüsünü (okuma ekranı) gösterme.
- Kendi ffmpeg filtreni yazma. Aşağıdaki komutları kullan.
- Bitince dosyayı açma, sadece yerini söyle.

## 1. Hazırlık
```
npm install
node scripts/analiz.mjs materyaller/<video>/video/<dosya>
```
`out/kareler/sheet.png` dosyasına bak (görüntüyü okuyabiliyorsan). Yüz kamerası var mı? Varsa kutusunu yüzde olarak yaz: x, y, w, h. Yoksa `0,0,0,0`.
```
node scripts/analiz.mjs materyaller/<video>/video/<dosya> --kamera x,y,w,h
```
`out/analiz.json` içinden oku: `oran`, `sure`, `donuk` (durağan aralıklar).

## 2. Hız (brifte hız varsa)
1.1x gibi: `ffmpeg -y -i VIDEO -filter_complex "[0:v]setpts=PTS/1.1[v];[0:a]atempo=1.1[a]" -map "[v]" -map "[a]" out/hizli.mp4`
Hız yoksa: `cp VIDEO out/hizli.mp4`
Bundan sonra tüm zamanlar `out/hizli.mp4`'e göredir. Videoyu tekrar analiz et: `node scripts/analiz.mjs out/hizli.mp4 --kamera x,y,w,h`

## 3. Konuşma
Transkript dosyası varsa (`materyal/transkript/`) onu oku. Yoksa: `python -m faster_whisper` benzeri bir araç (Mac'te `python3`; kurulum için `python3 -m venv .venv && .venv/bin/pip install faster-whisper`) ya da videonun yanındaki altyazıyı kullan. Hiçbiri yoksa kareleri ve brifteki konuyu baz al ve raporda "konuşma çözülemedi" yaz.
Şunları saniyesiyle not et: marka adı, rakam, "Google'da aradım", haber/post, tuş kısayolu, "yukarıda/aşağıda" gibi gösterimler, uyarı cümleleri.

## 4. Materyal
Logoları ve ekran görüntülerini `public/m/` içine düz dosya adıyla kopyala. "Sen bul" yazılanları bulamıyorsan atla, soru sorma.

## 5S. Brifte "Tür: Sesli anlatım + görsel" yazıyorsa (önce buna bak)
Kaynağın görüntüsü HİÇ gösterilmez, sadece sesi kullanılır. 5 ve 5D'yi atla.
1. `sahne.ornek.json` dosyasını `sahne.json` olarak kopyala. `width`/`height`: 9:16 ise 1080x1920, 16:9 ise 1920x1080, 1:1 ise 1080x1080. `duration`: saniye. `bg`: koyu renkli ton.
2. `events`: konuşmayı 3-7 sn'lik sahnelere böl. Her saniyede bir ana sahne olsun (`title`, `card`, `shot`, `search`, `counter`, `chart`, `list`, `compare`). Ekranda bir şey gösteriliyorsa karesini al: `ffmpeg -y -ss SANIYE -i out/hizli.mp4 -frames:v 1 public/m/kare-SANIYE.png` ve `shot` yap.
3. KAPI 1: `node scripts/kontrol.mjs sahne sahne.json`
4. `npx remotion render src/index.ts Overlay out/sahne-sessiz.mp4 --props=sahne.json --codec=h264 --muted`
5. `ffmpeg -y -i out/sahne-sessiz.mp4 -i out/hizli.mp4 -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/<video>-edit.mp4`
Yüz girişte/CTA'da görünecekse komut `talimat/video-edit.md` 5S adım 5'te.

## 5. Çıktı yataysa (16:9 -> 16:9)
`katman.json` yaz (şema: `katman.ornek.json`), sonra:
```
npm run katman
ffmpeg -y -i out/hizli.mp4 -c:v libvpx -i out/katman.webm -filter_complex "[0:v][1:v]overlay=format=auto[v]" -map "[v]" -map 0:a? -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -c:a copy out/<video>-edit.mp4
```
`-c:v libvpx` komutta `-i out/katman.webm` ÖNCESİNDE olmalı.
Durağan aralıkta (`donuk`) en az her 4 sn'de bir efekt (`frame`, `marker`, `spotlight`, `cursor`) ekle.

## 5D. Çıktı dikeyse (yatay kaynak -> 9:16)
1. `cp out/hizli.mp4 public/m/taban.mp4`
2. `dikey.ornek.json` dosyasını `dikey.json` olarak kopyala ve düzenle:
   - `srcW`, `srcH`, `fps`, `duration` (saniye), `hiz`: `analiz.json` ve brifteki değerler.
   - `face`: kamera kutusu. Kamera yoksa bu satırı sil ve `"faceShow": []` yap.
   - `faceShow`: brifte "giriş ve CTA" ise `[[0, 6], [duration-15, duration]]`. "Hep" ise `[[0, duration]]`. "Hiç" ise `[]`.
   - `theme`: brifteki renkler ve stil. `accent` sadece uyarı için.
   - `kadraj`: 4-8 nokta. İlk nokta `{"t":0,"cx":50,"cy":50,"w":100}` (genel plan, en fazla 4 sn). Sonrakilerde `w` 40-60 yap, `cx`/`cy` konuşulan şeyin ekrandaki yeri (yüzde). Her 4 sn'de en az bir nokta ya da efekt olsun.
   - `events`: efektler. Hepsine `"ref": "ekran"` ekle. x, y, w, h pencereye göre yüzdedir. Konumlu efektler (`frame`, `marker`, `spotlight`, `arrow`, `cursor`) kadraj geçişi sırasında OLMASIN.
3. KAPI 1: `node scripts/kontrol.mjs plan dikey.json` → hata varsa düzelt, tekrar çalıştır.
4. Render: `npx remotion render src/index.ts Dikey out/dikey-sessiz.mp4 --props=dikey.json --codec=h264 --muted`
5. Ses: `ffmpeg -y -i out/dikey-sessiz.mp4 -i out/hizli.mp4 -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/<video>-edit.mp4`

## 6. Müzik (brifte varsa)
Komut `talimat/video-edit.md` içinde "7. Müzik" başlığında. Yoksa atla.

## 7. KAPI 2 ve teslim
```
node scripts/kontrol.mjs cikti out/<video>-edit.mp4 --sure <beklenen_saniye>
```
Hata varsa ilgili adıma dön, düzelt, yeniden render et. Geçince 3 kareyi (başı, ortası, sonu) `ffmpeg -ss SN -i dosya -frames:v 1 kare.png` ile al ve bak: yazılar okunuyor mu, yüz sadece izinli yerde mi, vurgu rengi sadece uyarıda mı.
Raporda şunları yaz: dosyanın yeri, kullandığın varsayımlar, atladığın materyaller, kanca cümlesi.
