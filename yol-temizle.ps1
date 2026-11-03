# Eski kur.bat'in kullanici PATH ayarina eklemis olabilecegi "araclar" yollarini siler.
# Diger kayitlara dokunmaz, %DEGISKEN% yapilarini bozmaz, eski PATH'i path-yedek.txt dosyasina yazar.
$k = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey('Environment', $true)
if (-not $k) { Write-Host 'Kayit defteri acilamadi.'; Read-Host 'Kapatmak icin Enter'; exit 1 }
$raw = [string]$k.GetValue('Path', '', [Microsoft.Win32.RegistryValueOptions]::DoNotExpandEnvironmentNames)
$kind = $k.GetValueKind('Path')
$yedek = Join-Path $PSScriptRoot 'path-yedek.txt'
[IO.File]::WriteAllText($yedek, $raw, (New-Object System.Text.UTF8Encoding($true)))
$parts = @($raw -split ';' | Where-Object { $_ -ne '' })
$sil = @($parts | Where-Object { $_ -match '\\araclar\\(node-v|ffmpeg)' })
$kalan = @($parts | Where-Object { $_ -notmatch '\\araclar\\(node-v|ffmpeg)' })
$bozuk = @($kalan | Where-Object { $_.Contains('?') -or $_.Contains([string][char]0xFFFD) })
Write-Host ('Yedek yazildi: ' + $yedek)
if ($sil.Count -eq 0) { Write-Host 'Silinecek arac yolu yok. Hicbir sey degismedi.' }
else {
  $k.SetValue('Path', ($kalan -join ';'), $kind)
  [Environment]::SetEnvironmentVariable('VEW_YENILE', '1', 'User')
  [Environment]::SetEnvironmentVariable('VEW_YENILE', $null, 'User')
  Write-Host 'Silinen yollar:'
  $sil | ForEach-Object { Write-Host ('  ' + $_) }
}
if ($bozuk.Count -gt 0) {
  Write-Host ''
  Write-Host 'DIKKAT: Su yollar bozuk gorunuyor (Turkce karakter ? veya bozuk karakter olmus). Bu betik bunlara dokunmadi:'
  $bozuk | ForEach-Object { Write-Host ('  ' + $_) }
}
Write-Host ''
Write-Host 'Bitti. Acik terminalleri kapatip yeniden ac.'
Read-Host 'Kapatmak icin Enter'
