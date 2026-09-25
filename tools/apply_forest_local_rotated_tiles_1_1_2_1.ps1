Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$atlasPath = Join-Path $root "assets\tileset\forest.png"
$restorePath = Join-Path $root "assets\tileset\forest.before_local_rotations_1_1_2_1_20260830.png"
$backupPath = Join-Path $root "assets\tileset\forest.before_local_rotated_tiles_1_1_2_1_20260830.png"
$tempPath = Join-Path $root "assets\tileset\forest.local_rotated_tiles_1_1_2_1.tmp.png"

if (-not (Test-Path -LiteralPath $restorePath)) {
    throw "Restore backup not found: $restorePath"
}

if (-not (Test-Path -LiteralPath $backupPath)) {
    Copy-Item -LiteralPath $atlasPath -Destination $backupPath
}

Copy-Item -LiteralPath $restorePath -Destination $atlasPath -Force

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

function Read-TilePixels([System.Drawing.Bitmap]$bitmap, [hashtable]$origin) {
    $pixels = New-Object 'System.Drawing.Color[,]' $tileSize, $tileSize
    for ($y = 0; $y -lt $tileSize; $y++) {
        for ($x = 0; $x -lt $tileSize; $x++) {
            $pixels[$x, $y] = $bitmap.GetPixel($origin.X + $x, $origin.Y + $y)
        }
    }
    return ,$pixels
}

function Get-SourceLocalForClockwiseRotatedOutput([int]$destX, [int]$destY, [int]$turns) {
    switch ($turns % 4) {
        0 { return @{ X = $destX; Y = $destY } }
        1 { return @{ X = $destY; Y = (127 - $destX) } }
        2 { return @{ X = (127 - $destX); Y = (127 - $destY) } }
        3 { return @{ X = (127 - $destY); Y = $destX } }
    }
}

function Copy-RotatedTile([System.Drawing.Bitmap]$bitmap, [System.Drawing.Color[,]]$sourcePixels, [hashtable]$targetOrigin, [int]$turns) {
    for ($destY = 0; $destY -lt $tileSize; $destY++) {
        for ($destX = 0; $destX -lt $tileSize; $destX++) {
            $src = Get-SourceLocalForClockwiseRotatedOutput $destX $destY $turns
            $bitmap.SetPixel(
                $targetOrigin.X + $destX,
                $targetOrigin.Y + $destY,
                $sourcePixels.GetValue($src.X, $src.Y)
            )
        }
    }
}

$stream = [System.IO.File]::OpenRead($atlasPath)
$loadedImage = [System.Drawing.Image]::FromStream($stream)
$bitmap = New-Object System.Drawing.Bitmap($loadedImage)
$loadedImage.Dispose()
$stream.Dispose()

try {
    $targets = @()
    $covered = 0

    foreach ($sub in @(@{ X = 1; Y = 1 }, @{ X = 2; Y = 1 })) {
        $edgeSource = Read-TilePixels $bitmap (Get-TileOrigin $sub.X $sub.Y 1 2)
        $cornerSource = Read-TilePixels $bitmap (Get-TileOrigin $sub.X $sub.Y 1 3)

        for ($turns = 1; $turns -lt 4; $turns++) {
            $edgeTile = Rotate-TileCoordClockwise 1 2 $turns
            Copy-RotatedTile $bitmap $edgeSource (Get-TileOrigin $sub.X $sub.Y $edgeTile.X $edgeTile.Y) $turns
            $covered += $tileSize * $tileSize
            $targets += "sub-atlas ($($sub.X),$($sub.Y)) edge ($($edgeTile.X),$($edgeTile.Y)) rotated $($turns * 90)"

            $cornerTile = Rotate-TileCoordClockwise 1 3 $turns
            Copy-RotatedTile $bitmap $cornerSource (Get-TileOrigin $sub.X $sub.Y $cornerTile.X $cornerTile.Y) $turns
            $covered += $tileSize * $tileSize
            $targets += "sub-atlas ($($sub.X),$($sub.Y)) corner ($($cornerTile.X),$($cornerTile.Y)) rotated $($turns * 90)"
        }
    }

    $bitmap.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
} finally {
    $bitmap.Dispose()
}

Move-Item -LiteralPath $tempPath -Destination $atlasPath -Force

[PSCustomObject]@{
    Atlas = $atlasPath
    RestoredFrom = $restorePath
    BackupBeforeRedo = $backupPath
    Operation = "whole tile pixels rotated clockwise into the three corresponding positions"
    Targets = $targets -join "; "
    CoveredPixels = $covered
}
