# Eksik programlari indirip kurar. winget gerekmez.
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$tools = Join-Path $root 'araclar'
New-Item -ItemType Directory -Force -Path $tools | Out-Null

function Has($name) { return [bool](Get-Command $name -ErrorAction SilentlyContinue) }

function PythonOk {
  try {
    $v = & python --version 2>&1
    return (($LASTEXITCODE -eq 0) -and ("$v" -match 'Python 3'))
  } catch { return $false }
}

function AddPath($p) {
  if (-not (Test-Path $p)) { return }
  if (($env:Path -split ';') -notcontains $p) { $env:Path = $p + ';' + $env:Path }
  $u = [Environment]::GetEnvironmentVariable('Path', 'User')
  if (-not $u) { $u = '' }
  if (($u -split ';') -notcontains $p) {
    [Environment]::SetEnvironmentVariable('Path', ($p + ';' + $u), 'User')
  }
}

function Download($url, $out) {
  Write-Host ('Indiriliyor: ' + $url)
  Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing
}

try {
  Write-Host 'Kurulum basliyor...'
  Write-Host ''

  if (-not (Has 'node')) {
    Write-Host 'Node.js kuruluyor (yaklasik 30 MB)...'
    $zip = Join-Path $tools 'node.zip'
    Download 'https://nodejs.org/dist/v22.12.0/node-v22.12.0-win-x64.zip' $zip
    Expand-Archive -Path $zip -DestinationPath $tools -Force
    Remove-Item $zip -Force
    AddPath (Join-Path $tools 'node-v22.12.0-win-x64')
  } else { Write-Host 'Node.js zaten var.' }

  if (-not (Has 'ffmpeg')) {
    Write-Host 'ffmpeg kuruluyor (yaklasik 90 MB, birkac dakika surebilir)...'
    $zip = Join-Path $tools 'ffmpeg.zip'
    try {
      Download 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip' $zip
    } catch {
      Write-Host 'Ilk adres olmadi, ikinci adres deneniyor...'
      Download 'https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip' $zip
    }
    $dest = Join-Path $tools 'ffmpeg'
    Expand-Archive -Path $zip -DestinationPath $dest -Force
    Remove-Item $zip -Force
    $exe = Get-ChildItem -Path $dest -Recurse -Filter 'ffmpeg.exe' | Select-Object -First 1
    if (-not $exe) { throw 'ffmpeg.exe bulunamadi.' }
    AddPath $exe.DirectoryName
  } else { Write-Host 'ffmpeg zaten var.' }

  if (-not (PythonOk)) {
    Write-Host 'Python kuruluyor (yaklasik 25 MB)...'
    try {
      $inst = Join-Path $tools 'python-kurulum.exe'
      Download 'https://www.python.org/ftp/python/3.12.8/python-3.12.8-amd64.exe' $inst
      Start-Process -FilePath $inst -ArgumentList '/quiet', 'InstallAllUsers=0', 'PrependPath=1', 'Include_test=0', 'Include_launcher=0' -Wait
      Remove-Item $inst -Force
      $py = Join-Path $env:LOCALAPPDATA 'Programs\Python\Python312'
      AddPath $py
      AddPath (Join-Path $py 'Scripts')
    } catch {
      Write-Host 'Python kurulamadi. Edit yine calisir ama konusma yaziya dokulemeyebilir.'
    }
  } else { Write-Host 'Python zaten var.' }

  if (-not (Has 'claude')) {
    $a = Read-Host 'Claude Code kurulsun mu? E evet, H hayir (baska arac kullanacaksan H)'
    if ($a -match '^[eE]') {
      Write-Host 'Claude Code kuruluyor...'
      & npm install -g '@anthropic-ai/claude-code'
      if ($LASTEXITCODE -ne 0) { Write-Host 'Claude Code kurulamadi.' }
    }
  }

  Write-Host ''
  Write-Host 'Proje paketleri kuruluyor...'
  Push-Location $root
  & npm install
  $kod = $LASTEXITCODE
  Pop-Location
  if ($kod -ne 0) { throw 'npm install basarisiz oldu. Internet baglantini kontrol edip tekrar dene.' }

  if (PythonOk) {
    Write-Host ''
    Write-Host 'Konusmayi yaziya dokmek icin faster-whisper kuruluyor...'
    & python -m pip install --upgrade faster-whisper
    if ($LASTEXITCODE -ne 0) { Write-Host 'faster-whisper kurulamadi. Edit yine calisir ama konusma yaziya dokulemeyebilir.' }
  }

  Write-Host ''
  Write-Host 'Hazir. Simdi sunlari yap:'
  Write-Host '1. Bu klasorun adres cubuguna cmd yaz ve Enter tusuna bas.'
  Write-Host '2. Acilan pencerede kullandigin araci yaz. Ornek: claude, codex, gemini. Ilk seferde giris yap.'
  Write-Host '3. form.bat dosyasina cift tikla ve formu doldur.'
}
catch {
  Write-Host ''
  Write-Host ('HATA: ' + $_.Exception.Message)
  Write-Host 'Internet baglantini kontrol edip kur.bat dosyasini tekrar calistir.'
}
