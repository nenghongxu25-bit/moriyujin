$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$relativeRoots = @('assets/atlas/picture/interacts','assets/atlas/picture/decorate','assets/atlas/picture/environment','assets/atlas/picture/effects/fire','assets/atlas/picture/effects/weather','assets/xuliezhen','art-library/images/environment','art-library/images/containers','art-library/images/previews')
$count = 0
foreach ($relative in $relativeRoots) {
    $targetRoot = [IO.Path]::GetFullPath([IO.Path]::Combine($projectRoot,$relative))
    if (-not $targetRoot.StartsWith($projectRoot + [IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) { throw 'Outside workspace' }
    if (-not (Test-Path -LiteralPath $targetRoot -PathType Container)) { continue }
    $folders = @((Get-ChildItem -LiteralPath $targetRoot -Directory -Recurse).FullName) + @($targetRoot)
    foreach ($folder in ($folders | Sort-Object Length -Descending)) {
        $resolved = [IO.Path]::GetFullPath($folder)
        if ($resolved -ne $targetRoot -and -not $resolved.StartsWith($targetRoot + [IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) { throw 'Outside approved folder' }
        if (@(Get-ChildItem -LiteralPath $resolved -Force).Count -ne 0) { continue }
        if (Test-Path -LiteralPath ($resolved + '.meta')) {
            $relMeta = ($resolved + '.meta').Substring($projectRoot.Length + 1)
            $backupMeta = [IO.Path]::Combine($projectRoot,'.tmp/image-layout-backup-20260919/empty-folder-metadata',$relMeta)
            New-Item -ItemType Directory -Path ([IO.Path]::GetDirectoryName($backupMeta)) -Force | Out-Null
            Move-Item -LiteralPath ($resolved + '.meta') -Destination $backupMeta
        }
        Remove-Item -LiteralPath $resolved
        $count++
    }
}
Write-Output ('Removed empty directories only: ' + $count)
