param (
    [string]$Version,
    [string]$FilePath,
    [bool]$IsPreRelease = $true,
    [string]$Body = "",
    [string]$BodyFile = "",
    [string]$Token = $env:GITHUB_TOKEN
)

# If Token is not set via environment variable, attempt to load from local .env
if (-not $Token) {
    $envFile = Join-Path $PSScriptRoot ".env"
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            $line = $_.Trim()
            if ($line -and -not $line.StartsWith("#") -and $line -match "^GITHUB_TOKEN\s*=\s*(.*)$") {
                $Token = $matches[1].Trim().Trim('"').Trim("'")
            }
        }
    }
}

if (-not $Token) {
    Write-Error "GITHUB_TOKEN is not set. Please set GITHUB_TOKEN in your .env file or environment variable."
    exit 1
}

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$repo = "kozhaki-vik/industrial-hub-releases"
$tagName = "v$Version"
$releaseName = "Industrial Hub $tagName"

if ($BodyFile -and (Test-Path $BodyFile)) {
    $releaseBody = [System.IO.File]::ReadAllText((Resolve-Path $BodyFile).Path, [System.Text.Encoding]::UTF8)
} else {
    $releaseBody = $Body
}

$headers = @{
    "Authorization" = "Bearer $Token"
    "Accept" = "application/vnd.github.v3+json"
}

# Verify and apply digital signature if needed
$sig = (Get-AuthenticodeSignature -LiteralPath $FilePath).SignerCertificate.Thumbprint
if (-not $sig -or $sig -ne "F275C9D48A3325871DB04B0FDFB5701BE34802B7") {
    Write-Host "Signing $FilePath with Industrial Studio certificate..."
    $signtool = "C:\Users\Developer\AppData\Local\electron-builder\Cache\winCodeSign\winCodeSign-2.6.0\windows-10\x64\signtool.exe"
    if (Test-Path $signtool) {
        & $signtool sign /sha1 F275C9D48A3325871DB04B0FDFB5701BE34802B7 /fd sha256 /tr http://timestamp.digicert.com /td sha256 $FilePath
    }
}

Write-Host "Creating DRAFT release $tagName on $repo..."

$body = @{
    tag_name = $tagName
    target_commitish = "main"
    name = $releaseName
    body = $releaseBody
    draft = $true
    prerelease = $IsPreRelease
} | ConvertTo-Json

$utf8Body = [System.Text.Encoding]::UTF8.GetBytes($body)
$releaseResponse = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/releases" -Method Post -Headers $headers -Body $utf8Body -ContentType "application/json; charset=utf-8"
$releaseId = $releaseResponse.id

$uploadUrl = $releaseResponse.upload_url.Split('{')[0]
$fileName = [System.IO.Path]::GetFileName($FilePath)
$uploadUrl = "$uploadUrl`?name=$fileName"

Write-Host "Uploading asset $fileName (this may take a minute)..."

$uploadHeaders = @{
    "Authorization" = "Bearer $Token"
    "Accept" = "application/vnd.github.v3+json"
}

try {
    Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers $uploadHeaders -InFile $FilePath -ContentType "application/octet-stream" -ErrorAction Stop

    Write-Host "Publishing release..."
    $publishBody = @{ draft = $false; body = $releaseBody } | ConvertTo-Json
    $utf8PublishBody = [System.Text.Encoding]::UTF8.GetBytes($publishBody)
    Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/releases/$releaseId" -Method Patch -Headers $headers -Body $utf8PublishBody -ContentType "application/json; charset=utf-8"

    Write-Host "Upload complete!"
} catch {
    Write-Host "Upload failed: $_"
    Write-Host "Keeping release as DRAFT so it doesn't trigger the webhook."
    exit 1
}
