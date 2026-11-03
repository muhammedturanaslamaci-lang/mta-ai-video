# Video edit projesi

Bu klasör bir video edit akışıdır. Kullanıcı `form.bat` ile bir brief hazırlar ve sana tek satırlık bir komut verir.

Bir `materyaller/<video>/brief.md` dosyası gösterildiğinde veya brief yapıştırıldığında `talimat/video-edit.md` dosyasını oku ve oradaki akışı uygula.

Genel kurallar:
- Her şey bu bilgisayarda yerel çalışır. Bulut adımı yok.
- Orijinal video dosyasına dokunma. Çıktıyı `out/` altına yeni dosya olarak kaydet.
- Render bitince dosyayı veya uygulamayı açma. Sadece nerede olduğunu söyle.
- Kullanıcı yoksa soru sorma, makul varsayımla devam et ve raporda hangi varsayımı yaptığını söyle.
- Gerekli araçlar: Node.js, ffmpeg, Python. Eksik olanı kurmayı önerme, kullanıcıya `kur.bat` dosyasını çalıştırmasını söyle.
