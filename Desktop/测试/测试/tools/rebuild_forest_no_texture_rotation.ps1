Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$atlasPath = Join-Path $root "assets\tileset\forest.png"
$basePath = Join-Path $root "assets\tileset\forest.before_rotations_only_20260830.png"
$backupPath = Join-Path $root "assets\tileset\forest.before_no_texture_rotation_rebuild_20260830.png"
$tempPath = Join-Path $root "assets\tileset\forest.no_texture_rotation.tmp.png"

if (-not (Test-Path -LiteralPath $basePath)) {
    throw "Required base backup not found: $basePath"
}

if (-not (Test-Path -LiteralPath $backupPath)) {
    Copy-Item -LiteralPath $atlasPath -Destination $backupPath
}

Copy-Item -LiteralPath $basePath -Destination $atlasPath -Force

$tileSize = 128
$subAtlasSize = 384

function Get-TileOrigin([int]$subX, [int]$subY, [int]$tileX, [int]$tileY) {
    return @{
        X = (($subX - 1) * $subAtlasSize) + (($tileX - 1) * $tileSize)
        Y = (($subY - 1) * $subAtlasSize) + (($tileY - 1) * $tileSize)
    }
}

function Rotate-TileCoordClockwise([int]$tileX, [int]$tileY, [int]$turns) {
    $x = $tileX
    $y = $tileY
    for ($i = 0; $i -lt $turns; $i++) {
        $nextX = 4 - $y
        $nextY = $x
        $x = $nextX
        $y = $nextY
    }
    return @{ X = $x; Y = $y }
}

function Get-SourceMaskCoordFromRotatedDest([int]$destX, [int]$destYBottom, [int]$turns) {
    switch ($turns % 4) {
        0 { return @{ X = $destX; Y = $destYBottom } }
        1 { return @{ X = (127 - $destYBottom); Y = $destX } }
        2 { return @{ X = (127 - $destX); Y = (127 - $destYBottom) } }
        3 { return @{ X = $destYBottom; Y = (127 - $destX) } }
    }
}

function Copy-MaskedTileNoTextureRotation(
    [System.Drawing.Bitmap]$bitmap,
    [hashtable]$sourceOrigin,
    [hashtable]$targetOrigin,
    [int]$turns,
    [scriptblock]$sourceMask
) {
    $covered = 0
    for ($destYImg = 0; $destYImg -lt $tileSize; $destYImg++) {
        for ($destX = 0; $destX -lt $tileSize; $destX++) {
            $destYBottom = 127 - $destYImg
            $maskCoord = Get-SourceMaskCoordFromRotatedDest $destX $destYBottom $turns

            if (& $sourceMask $maskCoord.X $maskCoord.Y) {
                $bitmap.SetPixel(
                    $targetOrigin.X + $destX,
                    $targetOrigin.Y + $destYImg,
                    $bitmap.GetPixel($sourceOrigin.X + $destX, $sourceOrigin.Y + $destYImg)
                )
                $covered++
            }
        }
    }
    return $covered
}

$stream = [System.IO.File]::OpenRead($atlasPath)
$loadedImage = [System.Drawing.Image]::FromStream($stream)
$bitmap = New-Object System.Drawing.Bitmap($loadedImage)
$loadedImage.Dispose()
$stream.Dispose()

try {
    $sourceOrigin = Get-TileOrigin 2 1 2 2
    $covered = 0

    for ($turns = 1; $turns -lt 4; $turns++) {
        $edgeTile = Rotate-TileCoordClockwise 1 2 $turns
        $edgeOrigin = Get-TileOrigin 1 2 $edgeTile.X $edgeTile.Y
        $covered += Copy-MaskedTileNoTextureRotation $bitmap $sourceOrigin $edgeOrigin $turns { param($x, $y) $x -lt 64 }

        $cornerTile = Rotate-TileCoordClockwise 1 3 $turns
        $cornerOrigin = Get-TileOrigin 1 2 $cornerTile.X $cornerTile.Y
        $covered += Copy-MaskedTileNoTextureRotation $bitmap $sourceOrigin $cornerOrigin $turns { param($x, $y) ($x + $y) -lt 192 }
    }

    for ($turns = 0; $turns -lt 4; $turns++) {
        $edgeTile = Rotate-TileCoordClockwise 1 2 $turns
        $edgeOrigin = Get-TileOrigin 2 2 $edgeTile.X $edgeTile.Y
        $covered += Copy-MaskedTileNoTextureRotation $bitmap $sourceOrigin $edgeOrigin $turns { param($x, $y) $x -ge 64 }

        $cornerTile = Rotate-TileCoordClockwise 1 3 $turns
        $cornerOrigin = Get-TileOrigin 2 2 $cornerTile.X $cornerTile.Y
        $covered += Copy-MaskedTileNoTextureRotation $bitmap $sourceOrigin $cornerOrigin $turns { param($x, $y) ($x + $y) -ge 192 }
    }

    $centerOrigin = Get-TileOrigin 2 2 2 2
    for ($y = 0; $y -lt $tileSize; $y++) {
        for ($x = 0; $x -lt $tileSize; $x++) {
            $bitmap.SetPixel(
                $centerOrigin.X + $x,
                $centerOrigin.Y + $y,
                $bitmap.GetPixel($sourceOrigin.X + $x, $sourceOrigin.Y + $y)
            )
            $covered++
        }
    }

    $bitmap.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
} finally {
    $bitmap.Dispose()
}

Move-Item -LiteralPath $tempPath -Destination $atlasPath -Force

[PSCustomObject]@{
    Atlas = $atlasPath
    RebuildBase = $basePath
    BackupBeforeRebuild = $backupPath
    SourceTile = "sub-atlas (2,1), tile (2,2)"
    TextureRotation = "none"
    CoveredPixels = $covered
}
