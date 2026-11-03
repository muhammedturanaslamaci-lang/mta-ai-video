# Video edit akışı

Girdi: form.html'den gelen brief. Kullanıcı genellikle `materyaller/<video>/brief.md` dosyasını işaret eder: önce onu oku, içindeki talimatları ve brief'i uygula. Form dosyaları (video ve materyaller) aynı klasöre zaten yerleştirmiş olur. Brief'te video, oran, yüz kamerası, palet, tasarım stili, efektler, ses, müzik ve materyal listesi bulunur. Brief'te yazan her şeyi uygula. Yazmayan konuda makul varsayım yap ve raporda söyle.

## Üç kural (her şeyden önemli)
1. **Boş ekran yasak.** Çıktının hiçbir yerinde 3 saniyeden uzun değişmeyen görüntü ve kullanılmayan siyah alan olmaz. Ekran durağansa kadraj hareketi, vurgu ya da görsel eklenir.
2. **Dikeyde ekranı sığdırma, kırp ve takip et.** Yatay ekran kaydını 9:16'ya sığdırıp altını boş bırakmak hatadır. Aşağıdaki "5D. Dikey çıktı" adımını uygula.
3. **Kapılar geçilmeden teslim yok.** `scripts/kontrol.mjs` hata verirse düzelt ve tekrar çalıştır. Kapıyı atlayamazsın.

Hazır betikler var, ffmpeg filtresi veya yerleşim hesabını kendin yazma: `scripts/analiz.mjs`, `scripts/kontrol.mjs`, Remotion'daki `Overlay` ve `Dikey` sahneleri. Model küçükse önce `talimat/adim-adim.md` dosyasını oku.

## Hazırlık
- Çalışma klasörü bu repo. Video: `materyaller/<video>/video/`. Materyaller: `materyaller/<video>/materyal/`.
- `node_modules` yoksa `npm install` çalıştır. `ffmpeg` ve `ffprobe` PATH'te olmalı.
- Remotion'ın dosyaları `public/` altından okuması gerekir. Kullanılacak logo ve ekran görüntülerini `public/m/` altına kopyala (düz dosya adı).
- Videoyu `ffprobe` ile incele: süre, çözünürlük, fps, ses var mı.

## Adımlar

### 0. Hız (brief'te varsa, her şeyden önce)
Süre değişeceği için analiz, katman ve zamanlar hızlandırılmış videoya göre yapılır. Önce hızlandırılmış ara dosyayı üret (`out/hizli.mp4`), sonraki adımlarda onu kullan.
- Tüm video 1.25x gibi: `ffmpeg -y -i VIDEO -filter_complex "[0:v]setpts=PTS/1.25[v];[0:a]atempo=1.25[a]" -map "[v]" -map "[a]" out/hizli.mp4`
- Sessiz ve boş yerleri hızlandır: `ffmpeg -i VIDEO -af silencedetect=noise=-35dB:d=1.2 -f null -` ile sessiz aralıkları bul. Bu aralıkları 3x, konuşan kısımları 1x olacak şekilde parçalara böl (`trim`/`atrim` + `setpts`/`atempo`) ve `concat` ile birleştir. Konuşma hızı değişmesin. Sessiz aralıkta ekranda önemli bir şey oluyorsa (örn. bekleme çubuğu) o aralığı yine de hızlandır, ama atlama.
- "Orijinal hızda kalsın" ise hiçbir şey yapma.

### 1. Analiz
- Sesi yazıya dök (Whisper kurulu değilse `pip install faster-whisper` ile dene; olmazsa videonun yanında transkript dosyası ara). Zaman damgalı kelimeler gerekir.
- Şunları işaretle: marka adları, rakamlar, "Google'da aradım" benzeri anlar, haber ve sosyal medya anlatımları, "yukarıda/aşağıda" gibi gösterimler, uyarı ve tehlike cümleleri, bölüm geçişleri.

### 2. Yüz kamerası (brief "kendin tespit et" diyorsa)
- Videodan farklı zamanlarda 5-6 kare çıkar: `ffmpeg -ss <sn> -i video -frames:v 1 kare.png`.
- Kareleri incele ve kameranın yerini yüzde olarak belirle (x, y, w, h). Kamera yoksa "yok" de.
- Bu alana yazı, efekt, çerçeve veya yakınlaştırma koyma. Katman olaylarında bu dikdörtgenle kesişen yerleşim varsa yerini değiştir.
- Kamerayı ikileme. Büyütme, taşıma, çerçeve, filtre yok.
- Brief'teki "Yüzün görüneceği yerler" ayarına uy: `hep` ise kameraya dokunma. `giris-cta` ise yüz sadece girişte (ilk kanca cümlesi) ve sondaki çağrıda (son 10-20 sn) görünür. `giris` ve `cta` tek bölümde görünür. `hic` ise hiç görünmez.
- Yüz görünmeyecek zamanlarda: kamera ekrandan ayrı bir kaynaksa çıkar. Gömülüyse kamera alanını tam ekran bir sahneyle veya edit görselleriyle ört. Alanı örtmek için `overlay` ile ekran içeriğinin o bölgesini ölçekleyip bindirmek de çalışır. Geçişler kısa olsun, yüz aniden kaybolmasın.
- Bu zamanları `out/plan.md` içine yaz ve katmandaki tam ekran sahneleri (`card`, `shot`, `search`) bu aralıklara yerleştir.

### 2b. Analiz betiği
Hızı uyguladıktan sonra (adım 0) şunları çalıştır:
```
node scripts/analiz.mjs VIDEO                       # bilgi + out/kareler/sheet.png
node scripts/analiz.mjs VIDEO --kamera x,y,w,h      # + durağan ekran aralıkları (kamera yoksa 0,0,0,0)
```
Önce `sheet.png` karesine bakıp kamera kutusunu yüzde olarak belirle, sonra ikinci komutu çalıştır. Çıkan `out/analiz.json` içinde `oran`, `donuk` (ekranın değişmediği aralıklar) ve `donukOran` vardır. `donukOran` 0.25'ten büyükse planın ana işi durağan aralıkları canlandırmaktır.
Transkript brif'te verildiyse (materyal/transkript/) onu kullan, Whisper çalıştırma.

### 3. Yaratıcı plan
- Planlamadan önce kısa bir araştırma yap: brief'teki konuya benzer videolarda hangi görsel yaklaşımlar kullanılıyor.
- Her işaretlenen an için ne gösterileceğine karar ver. Yazı tek başına yetmesin: marka için logo, haber için ekran görüntüsü, arama için arama sahnesi, rakam için sayaç.
- Palet ve stil "Claude seçsin" ise videonun konusuna uygun seç. Aynı kalıbı her videoda kullanma. Brief'te belirtilmediyse sarıya yönelme.
- Giriş kancası (brief'teki "Giriş kancası" satırı): `Kanca ekleme` ise geç. Kullanıcı cümle verdiyse onu aynen kullan. Yapay zeka seçiliyse konuşmadaki en vurucu iddiayı veya rakamı bul, en fazla 8 kelimelik kısa bir cümle yap, abartılı veya yalan vaat verme. Cümleyi ilk 3 saniyede `title` olayıyla (büyük başlık) göster, 2-3 sn kalsın, yüz kamerasının alanını örtmesin. Kancayı raporda yaz, kullanıcı değiştirmek isteyebilir.
- Yakınlaştırma sayısını brief'teki üst sınırın altında tut. Çoğu vurguyu çerçeveyle ver.
- Planı kısa bir tablo olarak `out/plan.md` dosyasına yaz. Brief "plan önce görülsün" diyorsa burada dur ve onay bekle.

### 4. Materyal
- Brief'te "Ben vereceğim" yazanlar klasörde olmalı. Eksik dosya varsa atla ve raporda söyle.
- "Sen bul" yazanlar için kısa süre dene. Bulması uzun sürüyorsa atla, kullanıcıya sorma.
- Ekrandaki yabancı metinleri Türkçe çeviri kartıyla göster.

### 5. Katman (yatay çıktı)
Çıktı **dikey** ve kaynak **yatay** ise bu adımı ve adım 6'yı atla, 5D'ye geç. Durağan ekran varsa (`donuk`), o aralıklarda da `detay`, `frame`, `marker`, `spotlight` gibi efektler ekle ve kamera alanı dışında bir yakınlaştırma kullan.

`katman.json` dosyası yaz. Şema:

```json
{
  "width": 1920, "height": 1080, "fps": 30, "duration": 900,
  "theme": {"primary": "#ffffff", "secondary": "#16181d", "accent": "#ff5c5c", "style": "cam"},
  "events": [
    {"type": "logo", "start": 12.4, "dur": 3, "file": "claude.png", "pos": "sag-ust"},
    {"type": "counter", "start": 40, "dur": 3, "to": 3000, "suffix": " abone", "label": "15 videoda"},
    {"type": "search", "start": 61, "dur": 4, "query": "yapay zeka video edit"},
    {"type": "frame", "start": 80, "dur": 3, "x": 55, "y": 20, "w": 30, "h": 25, "label": "Buraya bak"},
    {"type": "card", "start": 120, "dur": 4, "title": "Bölüm 2", "body": "Kurallar"},
    {"type": "shot", "start": 150, "dur": 4, "file": "haber-1.png", "caption": "Kaynak: ..."},
    {"type": "text", "start": 200, "dur": 3, "text": "Dikkat", "tone": "uyari", "pos": "alt"}
  ]
}
```

Efekt türleri (`type`) ve ne zaman kullanılır. Hepsi şablonda hazırdır:

| type | Alanlar | Ne zaman |
|---|---|---|
| `logo` | file, label?, pos? | Marka adı geçince |
| `counter` | to, from?, prefix?, suffix?, label? | Rakam söylenince |
| `search` | query, site? | "Google'da aradım" gibi anlarda |
| `frame` | x, y, w, h, label? | Ekrandaki bir alanı vurgularken (zoom yerine) |
| `card` | title, body? | Bölüm geçişinde kısa bilgi |
| `shot` | file, caption? | Haber, post, test sonucu ekran görüntüsü |
| `text` | text, tone? ("uyari"), pos? | Kısa vurgu cümlesi |
| `title` | title, sub? | Girişte videonun konusunu gösteren başlık kartı |
| `lowerthird` | name, role? | Konuşanın ismi ve unvanı |
| `list` | items[] | Sayılan maddeler sırayla belirir |
| `cursor` | x, y, ring? (sadece halka), click?, fromX?, fromY? | Tıklanan yeri vurgulamak. Gerçek kayıtta imleç zaten var, `ring: true` kullan |
| `keys` | keys[] | Kısayol anlatılırken (örn. ["Ctrl","C"]) |
| `progress` | — | Üstte ince ilerleme çubuğu (start/dur aralığı kadar) |
| `compare` | before, after, beforeLabel?, afterLabel? | Önce/sonra karşılaştırması |
| `chart` | bars[], labels?, title? | Karşılaştırmalı rakamlar |
| `spotlight` | x, y, w, h | Alanı aydınlatıp çevreyi karartır |
| `marker` | x, y, w, h | Metni fosforlu kalemle işaretler |
| `arrow` | x, y, from? ("sol","sag","ust","alt"), label? | Dikkat çekilecek yeri okla göster |
| `subscribe` | text? | Abone ol / takip et çağrısı |
| `chapter` | label, index? | Köşede bölüm etiketi |
| `countdown` | from | Geri sayım |
| `caption` | text, karaoke? | Altyazı. Konuşmayı 4-7 kelimelik parçalara böl, her parça için bir olay yaz. `karaoke: true` her kelimeyi sırayla vurgular |

Brief'te yazmayan efekti kullanma. Aynı efekti art arda tekrarlama.

- `start` ve `dur` saniye. `duration` videonun tam süresi (saniye). Genişlik, yükseklik ve fps videodan alınır.
- `style` değerleri: `cizgi`, `blok`, `cam`, `editoryal`, `terminal`. Brief'teki stile göre seç.
- `pos` değerleri: `ust`, `orta`, `alt`, `sol-ust`, `sag-ust`, `sol-alt`, `sag-alt`.
- `frame` koordinatları yüzdedir. Vurgu rengi (`accent`) sadece `tone: "uyari"` ve çerçeve altı çizgisi için kullanılır.
- Şablonda olmayan bir görsel gerekirse `src/Overlay.tsx` içine yeni bir bileşen ekleyebilirsin. Tipleri `src/types.ts` içinde güncelle ve `npm run tip` ile kontrol et.
- Konuştuğum an efekt de gelsin. `start` değerini kelimenin başladığı zamana göre ver, kayma olmasın.

Render (şeffaf VP8 webm):
```
npx remotion render src/index.ts Overlay out/katman.webm --props=katman.json --codec=vp8 --pixel-format=yuva420p --image-format=png
```
Çok uzun videolarda katmanı bölümlere ayırıp ayrı ayrı render etmek süreyi kısaltır. Olmayan zamanlar boş kalsın.

### 5D. Dikey çıktı (yatay kaynak, 9:16)
`Dikey` sahnesi ekranı kırpıp takip eder, yüzü altta kaynak oranında gösterir, efektleri ekran penceresine göre çizer ve tek geçişte 1080x1920 video üretir.

1. Hızı uygulanmış videoyu `public/m/taban.mp4` olarak kopyala (hız yoksa orijinali kopyala).
2. `dikey.json` yaz (örnek: `dikey.ornek.json`). Alanlar:
   - `video`: `taban.mp4`, `srcW`/`srcH`: kaynağın çözünürlüğü, `fps`, `duration` (hızlanmış süre), `hiz`: uygulanan hız.
   - `face`: kamera kutusu (yüzde). Kamera yoksa alanı sil ve `faceShow` boş olsun.
   - `faceShow`: yüzün göründüğü aralıklar. "Giriş ve CTA" ise `[[0, kancaSonu], [duration-15, duration]]`. Boş liste: yüz hiç görünmez, pencere tüm yüksekliği kullanır.
   - `kadraj`: `{t, cx, cy, w}` noktaları. t anında ekranın (cx, cy) merkezi (kaynağın yüzdesi) ve w genişliği (yüzde) görünür. Bir önceki kadrajı tutar, sonraki noktaya 0.7 sn kala geçişe başlar ve tam t'de varır.
   - `events`: efektler. `"ref": "ekran"` yazarsan x, y, w, h ve `pos` ekran penceresine göredir (varsayılan bu olsun). Ref yoksa tuvale göredir (sadece `chapter`, `progress`, `subscribe` gibi genel öğeler için).
3. Kadraj kuralları:
   - Başlangıç genel plandır (w=100) ve en fazla 4 sn sürer. Sonrasında okunacak bölgeye yaklaş: metin için w 40-55, geniş arayüz için w 60-70. Telefonda okunmayan küçük yazı kabul edilmez.
   - Kadraj noktasını konuşulan şeyin ekrandaki yerine koy (konuşma ne zaman o bölgeye geliyorsa o saniyede). Durağan aralıklarda en geç 4 sn'de bir kadraj değişimi ya da efekt olsun.
   - Yüz gizliyken kadraj kamera kutusuna girmesin (betik bunu denetler).
   - Konumsal efektler (`frame`, `marker`, `spotlight`, `arrow`, `cursor`) çalışırken kadraj sabit kalsın. Konumu mevcut kadrajdaki pencereye göre hesapla.
   - Kadraj hareketleri brif'teki "yakınlaştırma sayısına" dahil değildir (yerleşim aracıdır). Sayılan: konuşulan detaya özel "bütünden parçaya" vurguları.
4. Plan kapısı (render öncesi, hata varsa düzelt): `node scripts/kontrol.mjs plan dikey.json`
5. Render (sessiz) ve ses ekleme:
```
npx remotion render src/index.ts Dikey out/dikey-sessiz.mp4 --props=dikey.json --codec=h264 --muted
ffmpeg -y -i out/dikey-sessiz.mp4 -i out/hizli.mp4 -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/<video>-edit.mp4
```
(`out/hizli.mp4` yoksa orijinal videoyu ver.) Müzik varsa adım 7'yi uygula.

### 6. Birleştirme (yatay çıktı)
Önemli: şeffaflığın okunması için katman girdisinden önce `-c:v libvpx` yaz.

```
ffmpeg -y -i VIDEO -c:v libvpx -i out/katman.webm \
  -filter_complex "[0:v][1:v]overlay=format=auto[v]" \
  -map "[v]" -map 0:a? -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -c:a copy out/<video>-edit.mp4
```

Yakınlaştırma varsa ana video üzerinde `crop`+`scale` ile yap, yüz kamerası alanını bozma. Kamera ikilenmesin. Yakınlaştırmalar iç içe geçmesin.

Kişisel bilgi bulanıklığı için ilgili bölgeye `boxblur` uygula (`crop` + `boxblur` + `overlay` ile, `enable='between(t,a,b)'`).

### 7. Müzik (brief'te varsa)
Müzik dosyasını videonun uzunluğuna kes, konuşma sırasında kıs, sonda yumuşak bitir. `DUR` video süresi, `VOL` brief'teki dB değeri (örn. -24):

```
ffmpeg -y -i out/<video>-edit.mp4 -i MUZIK -filter_complex \
 "[0:a]asplit=2[sp][sc];[1:a]volume=VOLdB,aloop=loop=-1:size=2000000000,atrim=0:DUR,afade=t=out:st=DUR-2:d=2[m];[m][sc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[md];[sp][md]amix=inputs=2:duration=first:normalize=0[a]" \
 -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k out/<video>-edit-muzikli.mp4
```
Müzik dosyası yoksa atla ve raporda söyle.

### 8. Kontrol
Önce ölçüm kapısı (başarısızsa düzelt, tekrar render et):
```
node scripts/kontrol.mjs cikti out/<video>-edit.mp4 --sure <beklenen_sn>
```
Betik süreyi, sesi, boş siyah alan oranını (dikeyde en fazla %40) ve 3 sn'den uzun değişmeyen görüntüyü denetler. Sonra çıktıdan farklı zamanlarda kare al ve gözle incele:
- Efektler konuşmayla aynı anda mı?
- Yüz kamerası ikilenmiş veya kapanmış mı?
- Kişisel bilgiler bulanık mı?
- Yazılar telefonda okunuyor mu, kamera alanıyla çakışan bir şey var mı?
- Vurgu rengi sadece gerçek uyarı ve tehlike anlarında mı?
- Süre ve ses orijinaliyle aynı mı (`ffprobe` ile karşılaştır)?
Sorun bulursan düzelt ve yeniden render et.

### 9. Teslim
Dosyayı açma. Kullanıcıya sadece şunu söyle: çıktının yolu, kaç efekt eklendi, hangi materyaller atlandı, hangi varsayımları yaptın.

## Kurallar
- Orijinal videoya dokunma. Çıktı yeni dosya.
- Sade ve profesyonel yazılar. Brief emoji istemiyorsa ikon az kullan.
- Aynı geçişi ve aynı ses efektini tekrar tekrar kullanma. Ses efekti az ve kısık.
- Marka adı geçince adı yazma, logosunu göster.
- Her yeni videoda önceki videonun tasarım kalıbını tekrarlama.
