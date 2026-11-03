# Video Edit Workflow

Videonu kesersin, logo, arama sahnesi, sayaç, çerçeve vurgusu, ekran görüntüsü, yakınlaştırma ve müziği yapay zeka ekler (Claude Code, Codex CLI, Gemini CLI veya Cursor). Her şey kendi bilgisayarında çalışır.

## Gerekenler
- Windows bilgisayar
- Bir yapay zeka kodlama aracı: [Claude Code](https://claude.com/product/claude-code) (ücretli Claude planı gerekir), Codex CLI, Gemini CLI veya Cursor

- Node.js, ffmpeg ve Python (ücretsiz, `kur.bat` eksik olanları kendisi indirip kurar, winget gerekmez. Node.js ve ffmpeg proje içindeki `araclar` klasörüne gider)

## Kurulum (bir kez)
1. Bu klasörü bilgisayarına aç (zip'ten çıkar).
2. `kur.bat` dosyasına çift tıkla. Eksik programları kurar.
3. `Hazir` yazısını görünce kurulum bitmiştir. `kur.bat` Claude Code'u da kurar.

## Kurulumdan sonra (ilk kullanım)
1. Bu klasörü Dosya Gezgini'nde aç. Üstteki adres çubuğuna `cmd` yaz ve Enter'a bas. Klasörde bir terminal açılır.
2. Terminale `claude` yaz ve Enter'a bas. İlk seferde tarayıcı açılır, Claude hesabınla giriş yap. Ücretli plan gerekir.
3. `form.bat` dosyasına çift tıkla. Form tarayıcıda açılır. Formu doldur, efektleri sağdaki ön izlemede dene.
4. Dosya seçtiğin anda form onları doğru klasörlere kopyalar, brifi `brief.md` olarak yazar ve her değişiklikte günceller. Hiçbir düğmeye basman gerekmez. "Dosya durumu" kartında yerleştiğini görürsün.
5. Formdaki tek satırlık komutu terminaldeki Claude'a yapıştır ve Enter'a bas.
6. Claude çalışır. Bitince "çıktı şu klasörde" der. Dosya `out/` klasöründe olur.

`form.bat` açtığı siyah pencere formu kullandığın sürece açık kalmalı. İşin bitince pencereyi kapat. Sunucu sadece senin bilgisayarında çalışır, dışarıdan erişilemez.

`form.bat` çalışmazsa `form.html`'i çift tıklayıp açabilirsin. Chrome veya Edge'de çıkan düğme proje klasörünü seçtirir. Başka tarayıcıda **Brifin tam metni** bölümünden brifi kopyalayıp aracına yapıştır.

Sonraki videolarda 1. ve 2. adımlar gerekmez: terminalde `claude` açıksa doğrudan formdan devam edersin.

## Her yeni video için
`form.bat`'ı aç, formu doldur, dosyalarını seç (kendiliğinden yerleşir), tek satırlık komutu Claude'a yapıştır. Her video kendi adıyla `materyaller/` altında ayrı bir klasöre yerleşir.

## Efektler
Formda 25 efekt var, hepsinin ön izlemesi yanındaki ▶ düğmesinde: detaya yaklaşma, altını çizme, çerçeve, spotlight, fosforlu kalem, ok, tıklama halkası, sayaç, çubuk grafik, madde listesi, başlık kartı, isim bandı, bölüm etiketi, bilgi kartı, önce/sonra, çeviri, arama sahnesi, haber ekran görüntüsü, test penceresi, tuş kısayolu, bulanıklaştırma, logo, abone ol çağrısı, ilerleme çubuğu, geri sayım. Formda ayrıca giriş kancası seçeneği var: yapay zeka videodan en vurucu cümleyi bulur veya sen kendi cümleni yazarsın. Altyazıda kelime kelime vurgulu seçenek de var.

## Ayarlarını kaydetmek
Sağdaki **Ayarlarım** kartında renk, stil, efekt, ses ve kamera seçimlerini bir adla kaydedebilirsin. Sonraki videoda listeden seçip **Yükle**'ye basman yeter. Video adı, dosyalar ve notlar kaydedilmez. `form.bat` ile açtıysan kayıtlar `ayarlar/stiller.json` dosyasında durur.

## İçindekiler
- `form.bat`: formu açar (yerel sunucuyu başlatır)
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
