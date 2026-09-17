Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$atlasPath = Join-Path $root "assets\tileset\forest.png"
$backupPath = Join-Path $root "assets\tileset\forest.before_rotations_only_20260830.png"
$tempPath = Join-Path $root "assets\tileset\forest.rotations_only.tmp.png"

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

function Get-SourceLocalFromRotatedDest([int]$destX, [int]$destYBottomOrigin, [int]$turns) {
    switch ($turns % 4) {
        0 { return @{ X = $destX; Y = $destYBottomOrigin } }
        1 { return @{ X = (127 - $destYBottomOrigin); Y = $destX } }
        2 { return @{ X = (127 - $destX); Y = (127 - $destYBottomOrigin) } }
        3 { return @{ X = $destYBottomOrigin; Y = (127 - $destX) } }
    }
}

function Copy-RotatedMaskedTile(
    [System.Drawing.Bitmap]$bitmap,
    [System.Drawing.Color[,]]$sourcePixels,
    [hashtable]$targetOrigin,
    [int]$turns,
    [scriptblock]$sourceMask
) {
    $covered = 0
    for ($destYImg = 0; $destYImg -lt $tileSize; $destYImg++) {
        for ($destX = 0; $destX -lt $tileSize; $destX++) {
            $destYBottom = 127 - $destYImg
            $srcLocal = Get-SourceLocalFromRotatedDest $destX $destYBottom $turns
            $srcX = $srcLocal.X
            $srcYBottom = $srcLocal.Y

            if (& $sourceMask $srcX $srcYBottom) {
                $srcYImg = 127 - $srcYBottom
                $bitmap.SetPixel(
                    $targetOrigin.X + $destX,
                    $targetOrigin.Y + $destYImg,
                    $sourcePixels.GetValue($srcX, $srcYImg)
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
    $sourcePixels = New-Object 'System.Drawing.Color[,]' $tileSize, $tileSize

    for ($yImg = 0; $yImg -lt $tileSize; $yImg++) {
        for ($x = 0; $x -lt $tileSize; $x++) {
            $sourcePixels[$x, $yImg] = $bitmap.GetPixel($sourceOrigin.X + $x, $sourceOrigin.Y + $yImg)
        }
    }

    $covered = 0
    $targets = @()

    for ($turns = 1; $turns -lt 4; $turns++) {
        $edgeTile = Rotate-TileCoordClockwise 1 2 $turns
        $edgeOrigin = Get-TileOrigin 1 2 $edgeTile.X $edgeTile.Y
        $covered += Copy-RotatedMaskedTile $bitmap $sourcePixels $edgeOrigin $turns { param($x, $y) $x -lt 64 }
        $targets += "edge ($($edgeTile.X),$($edgeTile.Y))"

        $cornerTile = Rotate-TileCoordClockwise 1 3 $turns
        $cornerOrigin = Get-TileOrigin 1 2 $cornerTile.X $cornerTile.Y
        $covered += Copy-RotatedMaskedTile $bitmap $sourcePixels $cornerOrigin $turns { param($x, $y) ($x + $y) -lt 192 }
        $targets += "corner ($($cornerTile.X),$($cornerTile.Y))"
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
    TargetSubAtlas = "(1,2)"
    RotatedTargets = $targets -join "; "
    CoveredPixels = $covered
}
