Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$atlasPath = Join-Path $root "assets\tileset\forest.png"
$backupPath = Join-Path $root "assets\tileset\forest.before_single_cover_20260830.png"
$tempPath = Join-Path $root "assets\tileset\forest.single_cover.tmp.png"

if (-not (Test-Path -LiteralPath $backupPath)) {
    Copy-Item -LiteralPath $atlasPath -Destination $backupPath
}

$tileSize = 128
$subAtlasSize = 384

function Get-TileOrigin([int]$subX, [int]$subY, [int]$tileX, [int]$tileY) {
    return @{
        X = (($subX - 1) * $subAtlasSize) + (($tileX - 1) * $tileSize)
        Y = (($subY - 1) * $subAtlasSize) + (($tileY - 1) * $tileSize)
    }
}

function Copy-MaskedTile(
    [System.Drawing.Bitmap]$bitmap,
    [hashtable]$sourceOrigin,
    [hashtable]$targetOrigin,
    [scriptblock]$mask
) {
    $covered = 0
    for ($y = 0; $y -lt $tileSize; $y++) {
        for ($x = 0; $x -lt $tileSize; $x++) {
            if (& $mask $x $y) {
                $bitmap.SetPixel(
                    $targetOrigin.X + $x,
                    $targetOrigin.Y + $y,
                    $bitmap.GetPixel($sourceOrigin.X + $x, $sourceOrigin.Y + $y)
                )
                $covered++
            }
        }
    }
    return $covered
}

$restoreBeforeApply = Test-Path -LiteralPath $backupPath
if ($restoreBeforeApply) {
    Copy-Item -LiteralPath $backupPath -Destination $atlasPath -Force
}

$stream = [System.IO.File]::OpenRead($atlasPath)
$loadedImage = [System.Drawing.Image]::FromStream($stream)
$bitmap = New-Object System.Drawing.Bitmap($loadedImage)
$loadedImage.Dispose()
$stream.Dispose()

try {
    $sourceOrigin = Get-TileOrigin 2 1 2 2
    $edgeOrigin = Get-TileOrigin 1 2 1 2
    $cornerOrigin = Get-TileOrigin 1 2 1 3

    $covered = 0
    $covered += Copy-MaskedTile $bitmap $sourceOrigin $edgeOrigin { param($x, $y) $x -lt 64 }
    $covered += Copy-MaskedTile $bitmap $sourceOrigin $cornerOrigin { param($x, $y) ($x + (127 - $y)) -lt 192 }

    $bitmap.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
} finally {
    $bitmap.Dispose()
}

Move-Item -LiteralPath $tempPath -Destination $atlasPath -Force

[PSCustomObject]@{
    Atlas = $atlasPath
    Backup = $backupPath
    SourceTile = "sub-atlas (2,1), tile (2,2)"
    TargetAreas = "sub-atlas (1,2): tile (1,2) x<64; tile (1,3) x+y<192 with tile origin at bottom-left"
    CoveredPixels = $covered
}
