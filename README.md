# Video Edit Workflow

Videonu kesersin, logo, arama sahnesi, sayaç, çerçeve vurgusu, ekran görüntüsü, yakınlaştırma ve müziği yapay zeka ekler (Claude Code, Codex CLI, Gemini CLI veya Cursor). Her şey kendi bilgisayarında çalışır.

## Gerekenler
- Windows 10 veya 11 bilgisayar
- Bir yapay zeka kodlama aracı: [Claude Code](https://claude.com/product/claude-code) (ücretli Claude planı gerekir), Codex CLI veya Gemini CLI. Cursor ve diğer araçlarda komutu elle yapıştırırsın.
- Node.js, ffmpeg ve Python gerekir ama sen kurmazsın: `baslat.bat` eksik olanları kendisi indirir (winget gerekmez). Node.js ve ffmpeg proje içindeki `araclar` klasörüne gider. Bilgisayarının PATH ayarına dokunulmaz.

## Kullanım (tek dosya)
1. Zip'i klasöre ayıkla. Zip'in içinden çalıştırma.
2. `baslat.bat` dosyasına çift tıkla.
   - İlk seferde eksik programları kurar (yaklaşık 150 MB, birkaç dakika) ve Claude Code kurulsun mu diye sorar.
   - Sonra formu tarayıcıda açar. Sonraki seferlerde kurulum atlanır, form hemen açılır.
3. Formu doldur. Dosyaları seçtiğin anda doğru klasörlere kendiliğinden yerleşir ve brif güncellenir.
4. **Edit'i başlat** düğmesine bas. Bir terminal penceresi açılır ve seçtiğin yapay zeka aracı işe başlar. İlk seferde o pencerede aracına giriş yaparsın.
5. Bitince araç "çıktı şu klasörde" der. Dosya `out/` klasöründe olur.

`baslat.bat` açtığı siyah pencere formu kullandığın sürece açık kalmalı. İşin bitince kapat. Sunucu sadece senin bilgisayarında çalışır, dışarıdan erişilemez.

Cursor veya başka bir araç kullanıyorsan ya da düğme çalışmazsa formdaki **Elle yapıştırmak istersen** bölümünden komutu kopyalayıp aracına yapıştır. Kendi terminalini açmak için `terminal.bat` var: Node.js, ffmpeg ve Python orada tanınır.

## Her yeni video için
`baslat.bat`'a çift tıkla, formu doldur, **Edit'i başlat**'a bas. Her video kendi adıyla `materyaller/` altında ayrı bir klasöre yerleşir.

`kur.bat` sadece bir şey bozulursa elle çalıştırılır (kurulumu yeniden yapar).

## Dikey (9:16) videolar
Kaynak yatay ekran kaydıysa ve çıktı dikeyse, ekranı sığdırıp altını boş bırakmak yerine `Dikey` sahnesi kullanılır: ekran kırpılıp konuşulan yere kaydırılır, yüz altta kaynak oranında görünür, efektler ekran penceresine göre çizilir. Ekran uzun süre durağansa kadraj hareketi ve efektlerle canlandırılır.

Hazır betikler (yapay zeka bunları çalıştırır, sen çalıştırmak zorunda değilsin):
- `node scripts/analiz.mjs VIDEO --kamera x,y,w,h`: çözünürlük, süre, kareler ve ekranın durağan aralıkları.
- `node scripts/kontrol.mjs plan dikey.json`: render öncesi plan kapısı (kadraj, yüz çakışması, durağan aralık, efekt kayması).
- `node scripts/kontrol.mjs cikti VIDEO --sure SN`: render sonrası ölçüm (süre, ses, siyah alan oranı, 3 sn'den uzun donuk görüntü).

Kontrol kapısı geçmeden teslim yapılmaz. Render süresi bilgisayarına göre değişir, 1 dakikalık dikey videoda birkaç dakika sürebilir.

Formda **Yapay zeka modeli** olarak "orta veya zayıf" seçersen komut önce `talimat/adim-adim.md` dosyasını okutur: daha kısa, adım adım ve hazır komutlu bir akış.

## PATH ve terminal
`kur.bat` bilgisayarının kalıcı PATH ayarına yazmaz. Kurduğu araçlar sadece `terminal.bat` ve `baslat.bat` açtığı pencerelerde tanınır. Daha önce eski `kur.bat` ile kurduysan ve PATH'ine `araclar` klasörü girdiyse `yol-temizle.ps1` dosyasına sağ tıklayıp **PowerShell ile çalıştır** de. Yalnızca bu projenin eklediği yolları siler ve eski PATH'i `path-yedek.txt` dosyasına yedekler.
Yapay zeka araçlarına da "PATH'i kalıcı değiştirme, `setx` kullanma" kuralı `CLAUDE.md`, `AGENTS.md` ve `GEMINI.md` içinde yazılıdır.

## Efektler
Formda 25 efekt var, hepsinin ön izlemesi yanındaki ▶ düğmesinde: detaya yaklaşma, altını çizme, çerçeve, spotlight, fosforlu kalem, ok, tıklama halkası, sayaç, çubuk grafik, madde listesi, başlık kartı, isim bandı, bölüm etiketi, bilgi kartı, önce/sonra, çeviri, arama sahnesi, haber ekran görüntüsü, test penceresi, tuş kısayolu, bulanıklaştırma, logo, abone ol çağrısı, ilerleme çubuğu, geri sayım. Formda ayrıca giriş kancası seçeneği var: yapay zeka videodan en vurucu cümleyi bulur veya sen kendi cümleni yazarsın. Altyazıda kelime kelime vurgulu seçenek de var.

## Ayarlarını kaydetmek
Sağdaki **Ayarlarım** kartında renk, stil, efekt, ses ve kamera seçimlerini bir adla kaydedebilirsin. Sonraki videoda listeden seçip **Yükle**'ye basman yeter. Video adı, dosyalar ve notlar kaydedilmez. `baslat.bat` ile açtıysan kayıtlar `ayarlar/stiller.json` dosyasında durur.

## Tanıtım sitesi (Vercel)
`site/` klasörü tek dosyalık statik bir tanıtım sayfasıdır (`site/index.html`). Efektlerin canlı demosu, örnek ayarlar ve kurulum adımları var. Vercel'de projeyi içe aktarırken **Root Directory** olarak `site` seç, Framework Preset için **Other** kalsın, build komutu gerekmez. Sayfadaki GitHub bağlantıları `github.com/omergocmen/video-edit-workflow` adresine gider. Repo adın farklıysa `site/index.html` içinde bu adresi değiştir.

## İçindekiler
- `baslat.bat`: tek giriş. Gerekirse kurar, formu açar
- `baslat-arac.bat`: Başlat düğmesinin yapay zeka aracını açtığı küçük yardımcı
- `kur.bat`: kurulumu elle yeniden yapar
- `form.html`: brief formu
- `talimat/video-edit.md`: yapay zekanın izlediği akış (tek kaynak)
- `.claude/skills/video-edit/SKILL.md`: Claude Code için kısa tanım, akışa yönlendirir
- `AGENTS.md`, `GEMINI.md`, `CLAUDE.md`: Codex, Cursor, Gemini CLI ve Claude Code'un otomatik okuduğu proje kuralları
- `src/`: Remotion katman şablonu (logo, sayaç, arama sahnesi, çerçeve, kart, ekran görüntüsü, yazı)
- `materyaller/video-1/`: örnek klasör yapısı
- `CLAUDE.md`: Claude Code'un bu klasörde izleyeceği genel kurallar

## Başka yapay zeka araçlarıyla
Akış Claude Code ile hazırlandı ve onunla denendi. Aynı klasörde başka bir araç da kullanabilirsin:
- **Codex CLI:** klasörde `codex` yaz. `AGENTS.md` dosyasını kendisi okur.
- **Gemini CLI:** klasörde `gemini` yaz. `GEMINI.md` dosyasını kendisi okur.
- **Cursor:** klasörü aç, ajan modunda komutu yaz. `AGENTS.md` dosyasını okur.

Formda "Kullanacağın yapay zeka aracı"nı seçersen komut ona göre yazılır. Aracın dosya okuyup yazabilmesi, komut çalıştırabilmesi ve ekran görüntülerini görebilmesi gerekir. Sonuçlar araca göre değişebilir.

## Şablonu kendin görmek istersen
`npm run studio` komutu Remotion Studio'yu açar. Efektleri orada izleyebilirsin.
