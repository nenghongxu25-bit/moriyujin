Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$atlasPath = Join-Path $root "assets\tileset\forest.png"
$backupPath = Join-Path $root "assets\tileset\forest.before_center_2_2_cover_20260830.png"
$tempPath = Join-Path $root "assets\tileset\forest.center_2_2.tmp.png"

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

$stream = [System.IO.File]::OpenRead($atlasPath)
$loadedImage = [System.Drawing.Image]::FromStream($stream)
$bitmap = New-Object System.Drawing.Bitmap($loadedImage)
$loadedImage.Dispose()
$stream.Dispose()

try {
    $sourceOrigin = Get-TileOrigin 2 1 2 2
    $targetOrigin = Get-TileOrigin 2 2 2 2

    for ($y = 0; $y -lt $tileSize; $y++) {
        for ($x = 0; $x -lt $tileSize; $x++) {
            $bitmap.SetPixel(
                $targetOrigin.X + $x,
                $targetOrigin.Y + $y,
                $bitmap.GetPixel($sourceOrigin.X + $x, $sourceOrigin.Y + $y)
            )
        }
    }

    $bitmap.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
} finally {
    $bitmap.Dispose()
}

Move-Item -LiteralPath $tempPath -Destination $atlasPath -Force

[PSCustomObject]@{
    Atlas = $atlasPath
    Backup = $backupPath
    SourceTile = "sub-atlas (2,1), tile (2,2)"
    TargetTile = "sub-atlas (2,2), tile (2,2)"
    CoveredPixels = $tileSize * $tileSize
}
