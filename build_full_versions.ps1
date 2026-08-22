$destBase = "C:\Users\Developer\Desktop\Проект"
# Укажите здесь адрес вашего Cloudflare Worker (или оставьте пусто, чтобы использовать старый метод с относительным путем)
$cloudflareUrl = "https://industrial-hub.industrial-hub.duckdns.org"

# Function to increment version
function Increment-Version($version) {
    $parts = $version.Split('.')
    $parts[2] = [int]$parts[2] + 1
    return $parts -join '.'
}

# Get current version
$pkgContent = Get-Content package.json | ConvertFrom-Json
$version1 = $pkgContent.version

Write-Host "Building version 1: $version1..."
npm run build
npx electron-builder --win --dir

$releaseDir1 = "$destBase\$version1"
if (Test-Path $releaseDir1) { Remove-Item $releaseDir1 -Recurse -Force }
New-Item -ItemType Directory -Force -Path $releaseDir1 | Out-Null

$versionJson1 = @{ version = $version1; clientUrl = "$cloudflareUrl/$version1/client.zip" } | ConvertTo-Json
Set-Content -Path ".\release\win-unpacked\version.json" -Value $versionJson1

Write-Host "Zipping $version1 using .NET ZipFile..."
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath1 = "$releaseDir1\client.zip"
if (Test-Path $zipPath1) { Remove-Item $zipPath1 -Force }
[System.IO.Compression.ZipFile]::CreateFromDirectory(".\release\win-unpacked", $zipPath1)

Write-Host "Done! Folder $version1 has been created in $destBase. client.zip is the only file, with version.json inside it."
