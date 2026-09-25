$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path -Parent $PSScriptRoot
$source = Join-Path $projectRoot 'assets/decorate/forest/forest-rusty-pickup-v1.png'
$target = Join-Path $projectRoot 'assets/decorate/forest/forest-rusty-pickup-clean-v2.png'
if (Test-Path -LiteralPath $target) { throw 'Output exists; refusing overwrite.' }
$bitmap = [System.Drawing.Bitmap]::new($source)
try {
    # Visually verified: truck ends above row 350; neighboring fragments below.
    $removed = 0
    for ($y = 350; $y -lt $bitmap.Height; $y++) {
        for ($x = 0; $x -lt $bitmap.Width; $x++) {
            $pixel = $bitmap.GetPixel($x, $y)
            if ($pixel.A -ne 0) {
                $bitmap.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
                $removed++
            }
        }
    }
    $bitmap.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
} finally { $bitmap.Dispose() }
$original = [System.Drawing.Bitmap]::new($source)
$result = [System.Drawing.Bitmap]::new($target)
try {
    $unexpectedChanges = 0
    $remaining = 0
    for ($y = 0; $y -lt $original.Height; $y++) {
        for ($x = 0; $x -lt $original.Width; $x++) {
            $before = $original.GetPixel($x, $y)
            $after = $result.GetPixel($x, $y)
            if ($y -lt 350 -and $before.ToArgb() -ne $after.ToArgb()) { $unexpectedChanges++ }
            if ($y -ge 350 -and $after.A -ne 0) { $remaining++ }
        }
    }
    if ($unexpectedChanges -ne 0 -or $remaining -ne 0) { throw 'Pixel verification failed.' }
    [PSCustomObject]@{Output=$target; Width=$result.Width; Height=$result.Height; RemovedPixels=$removed; SubjectPixelChanges=$unexpectedChanges; RemainingFragmentPixels=$remaining} | ConvertTo-Json
} finally { $original.Dispose(); $result.Dispose() }
