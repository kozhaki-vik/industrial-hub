param (
    [string]$Version,
    [string[]]$FilePaths,
    [string]$FilePath,
    [string]$Repo = "kozhaki-vik/industrial-hub",
    [bool]$IsPreRelease = $false,
    [string]$Body = "",
    [string]$BodyFile = "",
    [string]$Token = $env:GITHUB_TOKEN
)

# Consolidate file paths
$allFiles = @()
if ($FilePaths -and $FilePaths.Count -gt 0) {
    $allFiles += $FilePaths
}
if ($FilePath -and ($allFiles -notcontains $FilePath)) {
    $allFiles += $FilePath
}

if ($allFiles.Count -eq 0) {
    Write-Error "No files specified for upload. Please specify -FilePath or -FilePaths."
    exit 1
}

# If Token is not set via environment variable, attempt to load from local or repo root .env
if (-not $Token) {
    $envCandidates = @(
        (Join-Path $PSScriptRoot ".env"),
        (Join-Path (Split-Path -Parent $PSScriptRoot) ".env")
    )
    foreach ($envFile in $envCandidates) {
        if (Test-Path $envFile) {
            Get-Content $envFile | ForEach-Object {
                $line = $_.Trim()
                if ($line -and -not $line.StartsWith("#") -and $line -match "^GITHUB_TOKEN\s*=\s*(.*)$") {
                    $Token = $matches[1].Trim().Trim('"').Trim("'")
                }
            }
            if ($Token) { break }
        }
    }
}

if (-not $Token) {
    Write-Error "GITHUB_TOKEN is not set. Please set GITHUB_TOKEN in your .env file or environment variable."
    exit 1
}

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

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
    "User-Agent" = "Industrial-Hub-Release-Script"
}

# 1. Sign all files with our certificate if needed
$signtool = Join-Path $env:LOCALAPPDATA "electron-builder\Cache\winCodeSign\winCodeSign-2.6.0\windows-10\x64\signtool.exe"
foreach ($f in $allFiles) {
    if (-not (Test-Path $f)) {
        Write-Error "File not found: $f"
        exit 1
    }
    if ($f -match '\.(exe|dll|sys)$') {
        $sig = (Get-AuthenticodeSignature -LiteralPath $f).SignerCertificate.Thumbprint
        if (-not $sig -or $sig -ne "F275C9D48A3325871DB04B0FDFB5701BE34802B7") {
            Write-Host "Signing $f with Industrial Studio certificate..."
            if (Test-Path $signtool) {
                & $signtool sign /sha1 F275C9D48A3325871DB04B0FDFB5701BE34802B7 /fd sha256 /tr http://timestamp.digicert.com /td sha256 (Resolve-Path $f).Path
                if ($LASTEXITCODE -ne 0) {
                    Write-Error "Code signing failed for $f"
                    exit 1
                }
            } else {
                Write-Warning "Signtool not found at $signtool. Skipping signature."
            }
        } else {
            Write-Host "File $f is already signed with valid certificate."
        }
    }
}

# 2. Check if release already exists on $Repo
Write-Host "Checking for existing release $tagName on $Repo..."
$existingRelease = $null
try {
    $existingRelease = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/tags/$tagName" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "Found existing release ID: $($existingRelease.id)"
} catch {
    # 404 means does not exist yet
}

$releaseId = $null
$uploadBaseUrl = $null

if ($existingRelease) {
    $releaseId = $existingRelease.id
    $uploadBaseUrl = $existingRelease.upload_url.Split('{')[0]
} else {
    Write-Host "Creating release $tagName on $Repo (prerelease=$IsPreRelease)..."
    $createPayload = @{
        tag_name = $tagName
        target_commitish = "main"
        name = $releaseName
        body = $releaseBody
        draft = $false
        prerelease = $IsPreRelease
    } | ConvertTo-Json

    $utf8Body = [System.Text.Encoding]::UTF8.GetBytes($createPayload)
    $createResponse = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases" -Method Post -Headers $headers -Body $utf8Body -ContentType "application/json; charset=utf-8"
    $releaseId = $createResponse.id
    $uploadBaseUrl = $createResponse.upload_url.Split('{')[0]
}

# 3. For each file, check if asset already exists in release and delete it before uploading
$currentAssets = @()
try {
    $currentAssets = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/$releaseId/assets" -Method Get -Headers $headers -ErrorAction SilentlyContinue
} catch {}

foreach ($f in $allFiles) {
    $fileName = [System.IO.Path]::GetFileName($f)
    $matchAsset = $currentAssets | Where-Object { $_.name -eq $fileName }
    if ($matchAsset) {
        Write-Host "Asset $fileName already exists in release. Deleting old asset (ID $($matchAsset.id))..."
        Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/assets/$($matchAsset.id)" -Method Delete -Headers $headers
        Start-Sleep -Seconds 1
    }

    $uploadUrl = "$uploadBaseUrl`?name=$fileName"
    Write-Host "Uploading asset $fileName to $Repo (this may take a minute)..."

    $uploadHeaders = @{
        "Authorization" = "Bearer $Token"
        "Accept" = "application/vnd.github.v3+json"
        "User-Agent" = "Industrial-Hub-Release-Script"
    }

    try {
        Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers $uploadHeaders -InFile (Resolve-Path $f).Path -ContentType "application/octet-stream" -ErrorAction Stop
        Write-Host "Uploaded $fileName successfully!"
    } catch {
        Write-Error "Upload failed for $fileName`: $_"
        exit 1
    }
}

# 4. Update release prerelease and body if needed
$patchPayload = @{
    name = $releaseName
    prerelease = $IsPreRelease
}
if ($releaseBody) {
    $patchPayload["body"] = $releaseBody
}
$patchJson = $patchPayload | ConvertTo-Json
$utf8Patch = [System.Text.Encoding]::UTF8.GetBytes($patchJson)
Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/$releaseId" -Method Patch -Headers $headers -Body $utf8Patch -ContentType "application/json; charset=utf-8" | Out-Null

Write-Host "Release $tagName on $Repo successfully updated and published!"
