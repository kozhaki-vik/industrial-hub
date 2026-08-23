param (
    [string]$Version,
    [string]$FilePath,
    [bool]$IsPreRelease = $true,
    [string]$Token = "[REDACTED_GITHUB_TOKEN]"
)

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$repo = "kozhaki-vik/industrial-hub-releases"
$tagName = "v$Version"
$releaseName = "Industrial Hub $tagName"
$releaseBody = if ($IsPreRelease) { "Тестовая сборка $tagName" } else { "Стабильный релиз $tagName" }

$headers = @{
    "Authorization" = "Bearer $Token"
    "Accept" = "application/vnd.github.v3+json"
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

$releaseResponse = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/releases" -Method Post -Headers $headers -Body $body -ContentType "application/json"
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
    $publishBody = @{ draft = $false } | ConvertTo-Json
    Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/releases/$releaseId" -Method Patch -Headers $headers -Body $publishBody -ContentType "application/json"

    Write-Host "Upload complete!"
} catch {
    Write-Host "Upload failed: $_"
    Write-Host "Keeping release as DRAFT so it doesn't trigger the webhook."
    exit 1
}
