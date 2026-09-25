Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$atlasPath = Join-Path $root "assets\tileset\forest.png"
$backupPath = Join-Path $root "assets\tileset\forest.before_rotated_cover_20260830.png"
$tempPath = Join-Path $root "assets\tileset\forest.rotated_cover.tmp.png"

if (-not (Test-Path -LiteralPath $backupPath)) {
    Copy-Item -LiteralPath $atlasPath -Destination $backupPath
}

$tileSize = 128
$subAtlasSize = 384

function Get-SubAtlasOrigin([int]$subX, [int]$subY) {
    return @{
        X = ($subX - 1) * $subAtlasSize
        Y = ($subY - 1) * $subAtlasSize
    }
}

function Get-TileOrigin([int]$subX, [int]$subY, [int]$tileX, [int]$tileY) {
    $sub = Get-SubAtlasOrigin $subX $subY
    return @{
        X = $sub.X + (($tileX - 1) * $tileSize)
        Y = $sub.Y + (($tileY - 1) * $tileSize)
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
    return @{
        X = $x
        Y = $y
    }
}

function Get-SourceLocalForClockwiseRotation([int]$x, [int]$y, [int]$turns) {
    switch ($turns % 4) {
        0 { return @{ X = $x; Y = $y } }
        1 { return @{ X = $y; Y = ($tileSize - 1 - $x) } }
        2 { return @{ X = ($tileSize - 1 - $x); Y = ($tileSize - 1 - $y) } }
        3 { return @{ X = ($tileSize - 1 - $y); Y = $x } }
    }
}

function Copy-RotatedMaskedTile(
    [System.Drawing.Bitmap]$bitmap,
    [System.Drawing.Color[,]]$sourcePixels,
    [hashtable]$targetOrigin,
    [int]$turns,
    [scriptblock]$mask
) {
    $covered = 0
    for ($y = 0; $y -lt $tileSize; $y++) {
        for ($x = 0; $x -lt $tileSize; $x++) {
            $srcLocal = Get-SourceLocalForClockwiseRotation $x $y $turns
            if (& $mask $srcLocal.X $srcLocal.Y) {
                $srcX = $srcLocal.X
                $srcY = $srcLocal.Y
                $color = $sourcePixels.GetValue($srcX, $srcY)
                $bitmap.SetPixel(
                    $targetOrigin.X + $x,
                    $targetOrigin.Y + $y,
                    $color
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
$result = $null

try {
    $sourceOrigin = Get-TileOrigin 2 1 2 2
    $sourcePixels = New-Object 'System.Drawing.Color[,]' $tileSize, $tileSize
    for ($y = 0; $y -lt $tileSize; $y++) {
        for ($x = 0; $x -lt $tileSize; $x++) {
            $sourcePixels[$x, $y] = $bitmap.GetPixel($sourceOrigin.X + $x, $sourceOrigin.Y + $y)
        }
    }

    $totalCovered = 0

    for ($turns = 0; $turns -lt 4; $turns++) {
        $edgeTile = Rotate-TileCoordClockwise 1 2 $turns
        $edgeOrigin = Get-TileOrigin 1 2 $edgeTile.X $edgeTile.Y
        $totalCovered += Copy-RotatedMaskedTile $bitmap $sourcePixels $edgeOrigin $turns { param($x, $y) $x -lt 64 }

        $cornerTile = Rotate-TileCoordClockwise 1 3 $turns
        $cornerOrigin = Get-TileOrigin 1 2 $cornerTile.X $cornerTile.Y
        $totalCovered += Copy-RotatedMaskedTile $bitmap $sourcePixels $cornerOrigin $turns { param($x, $y) ($x + $y) -lt 192 }
    }

    $bitmap.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $result = [PSCustomObject]@{
        Atlas = $atlasPath
        Backup = $backupPath
        SourceTile = "sub-atlas (2,1), tile (2,2)"
        TargetSubAtlas = "(1,2)"
        CoveredPixels = $totalCovered
    }
} finally {
    $bitmap.Dispose()
}

if ($null -ne $result) {
    Move-Item -LiteralPath $tempPath -Destination $atlasPath -Force
    $result
}
