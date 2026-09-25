Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$atlasPath = Join-Path $root "assets\tileset\forest.png"
$backupPath = Join-Path $root "assets\tileset\forest.before_local_rotations_1_1_2_1_20260830.png"
$tempPath = Join-Path $root "assets\tileset\forest.local_rotations_1_1_2_1.tmp.png"

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

function Read-TilePixels([System.Drawing.Bitmap]$bitmap, [hashtable]$origin) {
    $pixels = New-Object 'System.Drawing.Color[,]' $tileSize, $tileSize
    for ($y = 0; $y -lt $tileSize; $y++) {
        for ($x = 0; $x -lt $tileSize; $x++) {
            $pixels[$x, $y] = $bitmap.GetPixel($origin.X + $x, $origin.Y + $y)
        }
    }
    return ,$pixels
}

function Copy-TileNoTextureRotation([System.Drawing.Bitmap]$bitmap, [System.Drawing.Color[,]]$sourcePixels, [hashtable]$targetOrigin) {
    for ($y = 0; $y -lt $tileSize; $y++) {
        for ($x = 0; $x -lt $tileSize; $x++) {
            $bitmap.SetPixel(
                $targetOrigin.X + $x,
                $targetOrigin.Y + $y,
                $sourcePixels.GetValue($x, $y)
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
            $edgeOrigin = Get-TileOrigin $sub.X $sub.Y $edgeTile.X $edgeTile.Y
            Copy-TileNoTextureRotation $bitmap $edgeSource $edgeOrigin
            $covered += $tileSize * $tileSize
            $targets += "sub-atlas ($($sub.X),$($sub.Y)) edge ($($edgeTile.X),$($edgeTile.Y))"

            $cornerTile = Rotate-TileCoordClockwise 1 3 $turns
            $cornerOrigin = Get-TileOrigin $sub.X $sub.Y $cornerTile.X $cornerTile.Y
            Copy-TileNoTextureRotation $bitmap $cornerSource $cornerOrigin
            $covered += $tileSize * $tileSize
            $targets += "sub-atlas ($($sub.X),$($sub.Y)) corner ($($cornerTile.X),$($cornerTile.Y))"
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
    SourceTiles = "each target sub-atlas uses its own tile (1,2) and tile (1,3)"
    TextureRotation = "none"
    Targets = $targets -join "; "
    CoveredPixels = $covered
}
