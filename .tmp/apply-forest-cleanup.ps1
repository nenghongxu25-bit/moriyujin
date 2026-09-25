$ErrorActionPreference = 'Stop'
$workspace = (Get-Location).Path
$plan = Get-Content -LiteralPath '.tmp/forest-cleanup-plan.json' -Raw -Encoding UTF8 | ConvertFrom-Json
$assetsRoot = [IO.Path]::GetFullPath((Join-Path $workspace 'assets'))
$archiveRoot = [IO.Path]::GetFullPath((Join-Path $workspace $plan.archive))
if (-not $archiveRoot.StartsWith($workspace + '\') -or (Test-Path -LiteralPath $archiveRoot)) { throw 'Backup must be a new directory inside this workspace' }
foreach ($relative in $plan.directories) {
    $sourcePath = [IO.Path]::GetFullPath((Join-Path $workspace $relative))
    if (-not $sourcePath.StartsWith($assetsRoot + '\') -or -not (Test-Path -LiteralPath $sourcePath -PathType Container)) { throw "Invalid source: $sourcePath" }
}
foreach ($entry in $plan.files) {
    $targetPath = [IO.Path]::GetFullPath((Join-Path $workspace $entry.to))
    if (-not $targetPath.StartsWith($assetsRoot + '\')) { throw "Invalid destination: $targetPath" }
    if ($entry.from -ne $entry.to -and (Test-Path -LiteralPath $targetPath)) { throw "Destination exists: $targetPath" }
}
New-Item -ItemType Directory -Path $archiveRoot | Out-Null
Copy-Item -LiteralPath '.tmp/forest-cleanup-plan.json' -Destination (Join-Path $archiveRoot 'manifest.json')
foreach ($relative in $plan.directories) {
    $sourcePath = [IO.Path]::GetFullPath((Join-Path $workspace $relative))
    $backupPath = [IO.Path]::GetFullPath((Join-Path $archiveRoot $relative))
    if (-not $backupPath.StartsWith($archiveRoot + '\')) { throw 'Invalid backup destination' }
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $backupPath) | Out-Null
    Move-Item -LiteralPath $sourcePath -Destination $backupPath
    if (Test-Path -LiteralPath ($sourcePath + '.meta')) { Move-Item -LiteralPath ($sourcePath + '.meta') -Destination ($backupPath + '.meta') }
}
foreach ($entry in $plan.files) {
    $backupPath = Join-Path $archiveRoot $entry.from
    $targetPath = Join-Path $workspace $entry.to
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $targetPath) | Out-Null
    Copy-Item -LiteralPath $backupPath -Destination $targetPath
    Copy-Item -LiteralPath ($backupPath + '.meta') -Destination ($targetPath + '.meta')
    if ((Get-FileHash -LiteralPath $backupPath).Hash -ne (Get-FileHash -LiteralPath $targetPath).Hash) { throw "Copy mismatch: $targetPath" }
    if ((Get-FileHash -LiteralPath ($backupPath + '.meta')).Hash -ne (Get-FileHash -LiteralPath ($targetPath + '.meta')).Hash) { throw "Metadata mismatch: $targetPath" }
}
$folderMeta = Join-Path $archiveRoot 'assets/tileset/forest.meta'
if (Test-Path -LiteralPath $folderMeta) { Copy-Item -LiteralPath $folderMeta -Destination (Join-Path $workspace 'assets/tileset/forest.meta') }
Write-Output 'Archived 8 old asset directories; restored 7 required/reference resources with unchanged hashes and UUIDs.'
