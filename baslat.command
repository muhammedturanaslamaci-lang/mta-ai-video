#!/bin/bash
# Mac için başlatıcı. Çift tıkla (ya da Terminal'de: bash baslat.command).
# İlk seferde eksik araçları (Node.js, ffmpeg) Homebrew ile kurar, sonra formu açar.
cd "$(dirname "$0")" || exit 1
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
clear
echo "Video edit hazırlanıyor..."
echo

# Node.js 18 veya üstü gerekir
node_tamam() { command -v node >/dev/null 2>&1 && [ "$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)" -ge 18 ]; }

eksik=""
node_tamam || eksik="$eksik node"
command -v ffmpeg >/dev/null 2>&1 || eksik="$eksik ffmpeg"

if [ -n "$eksik" ]; then
  echo "Eksik araçlar:$eksik"
  if ! command -v brew >/dev/null 2>&1; then
    echo
    echo "Bunları kurmak için Homebrew gerekiyor (Mac'in ücretsiz paket yöneticisi)."
    echo "Kurulum Mac şifreni isteyebilir. Şifre yazarken ekranda bir şey görünmez, bu normal."
    printf "Homebrew şimdi kurulsun mu? (e/h) "
    read -r cevap
    if [ "$cevap" != "e" ] && [ "$cevap" != "E" ]; then
      echo "Kurulum iptal edildi. Hazır olunca bu dosyayı tekrar çalıştır."
      exit 1
    fi
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || { echo "Homebrew kurulamadı."; exit 1; }
    [ -x /opt/homebrew/bin/brew ] && eval "$(/opt/homebrew/bin/brew shellenv)"
    [ -x /usr/local/bin/brew ] && eval "$(/usr/local/bin/brew shellenv)"
  fi
  echo
  echo "Kuruluyor:$eksik (bir kez yapılır, birkaç dakika sürer)"
  # shellcheck disable=SC2086
  brew install $eksik || { echo "Kurulum tamamlanamadı. Yukarıdaki hataya bak."; exit 1; }
  hash -r
  if ! node_tamam || ! command -v ffmpeg >/dev/null 2>&1; then
    echo "Kurulumdan sonra node veya ffmpeg bulunamadı. Terminal'i kapatıp bu dosyayı tekrar çalıştır."
    exit 1
  fi
fi

if [ ! -d node_modules ]; then
  echo
  echo "Proje paketleri kuruluyor (ilk seferde)..."
  npm install || { echo "npm install başarısız oldu."; exit 1; }
fi

# ilk seferde: yapay zeka aracı yoksa Claude Code kurulumunu öner
if [ ! -f araclar/mac-kurulum-tamam.txt ]; then
  if ! command -v claude >/dev/null 2>&1 && ! command -v codex >/dev/null 2>&1 && ! command -v gemini >/dev/null 2>&1; then
    echo
    printf "Claude Code kurulsun mu? (e/h, başka araç kullanacaksan h) "
    read -r cevap
    if [ "$cevap" = "e" ] || [ "$cevap" = "E" ]; then
      npm install -g @anthropic-ai/claude-code || echo "Claude Code kurulamadı. Sonra elle kurabilirsin."
    fi
  fi
  mkdir -p araclar && date > araclar/mac-kurulum-tamam.txt
fi

echo
echo "Form açılıyor. Bu pencereyi işin bitene kadar açık tut."
node server.mjs
