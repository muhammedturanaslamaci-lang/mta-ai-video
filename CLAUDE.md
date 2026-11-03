# Video edit projesi

Bu klasör bir video edit akışıdır. Kullanıcı `baslat.bat` ile formu açıp bir brief hazırlar ve Başlat düğmesiyle seni çalıştırır.

Bir `materyaller/<video>/brief.md` dosyası gösterildiğinde veya brief yapıştırıldığında `talimat/video-edit.md` dosyasını oku ve oradaki akışı uygula.

Genel kurallar:
- Her şey bu bilgisayarda yerel çalışır. Bulut adımı yok.
- Orijinal video dosyasına dokunma. Çıktıyı `out/` altına yeni dosya olarak kaydet.
- Render bitince dosyayı veya uygulamayı açma. Sadece nerede olduğunu söyle.
- Kullanıcı yoksa soru sorma, makul varsayımla devam et ve raporda hangi varsayımı yaptığını söyle.
- Gerekli araçlar: Node.js, ffmpeg, Python. Eksik olanı kurmayı önerme, kullanıcıya `baslat.bat` dosyasını çalıştırmasını söyle (eksikleri kendisi kurar).
- Çıktı dikeyse yatay ekranı sığdırıp altını boş bırakma: `talimat/video-edit.md` içindeki "5D. Dikey çıktı" akışı. Teslimden önce `node scripts/kontrol.mjs cikti ...` geçmeli.
- Küçük model kullanıyorsan önce `talimat/adim-adim.md` dosyasını oku.
- Bilgisayarın PATH ayarını kalıcı değiştirme. `setx` kullanma, kayıt defterine (registry) PATH yazma. Gerekirse sadece o oturumda `$env:Path` ya da `set PATH=` ile ekle. Araçlar için `ortam.bat` ve `terminal.bat` var.
