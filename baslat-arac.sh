#!/bin/bash
# Mac: formdaki Başlat düğmesi bunu yeni bir Terminal penceresinde çalıştırır.
# Kullanım: bash baslat-arac.sh <claude|codex|gemini> <video-klasoru> <zayif:0|1>
cd "$(dirname "$0")" || exit 1
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.local/bin:$HOME/.claude/local:$PATH"
arac="$1"; slug="$2"; zayif="$3"
hedef="materyaller/$slug/brief.md"
if [ "$zayif" = "1" ]; then
  istek="Önce talimat/adim-adim.md dosyasını oku ve harfiyen uygula. Brif dosyası: $hedef"
else
  istek="$hedef dosyasını oku ve talimat/video-edit.md dosyasındaki akışa göre videoyu edit et."
fi
if ! command -v "$arac" >/dev/null 2>&1; then
  echo "$arac bulunamadı. Önce aracı kur (README'deki Gerekenler bölümü), sonra formda Başlat'a tekrar bas."
  exit 1
fi
case "$arac" in
  claude) claude "$istek" ;;
  codex) codex "$istek" ;;
  gemini) gemini -i "$istek" ;;
esac
echo
echo "Bu pencereyi kapatabilirsin."
