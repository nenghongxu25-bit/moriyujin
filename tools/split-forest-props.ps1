param(
    [string]$Source,
    [string]$OutputDirectory,
    [int[]]$RowOrigins = @(0, 256, 512, 768)
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
if (-not $Source) { $Source = Join-Path $projectRoot 'assets/tileset/forest-kit-v2/forest-props.png' }
if (-not $OutputDirectory) { $OutputDirectory = Join-Path $projectRoot 'assets/tileset/forest-kit-v2/elements' }
$Source = [IO.Path]::GetFullPath($Source)
$OutputDirectory = [IO.Path]::GetFullPath($OutputDirectory)

$names = @(
    'grass-short', 'grass-tall', 'fern', 'bush-round', 'broadleaf', 'flowers-white',
    'rock-moss-small', 'pebbles-three', 'boulder-moss', 'rocks-flat', 'rocks-round', 'gravel-scatter',
    'stump', 'branch-fallen', 'roots', 'log-moss', 'leaves-dry', 'mushrooms',
    'reeds', 'lily-pads', 'bush-berries', 'sapling-pine', 'tree-small', 'sapling-dead'
)

Add-Type -AssemblyName System.Drawing
if (-not ('ForestAtlasSplitter' -as [type])) {
    Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;
public static class ForestAtlasSplitter {
    public static long SplitAndVerify(string source, string directory, string[] names, int[] rowOrigins) {
        using (var atlas = new Bitmap(source)) {
            if (atlas.Width != 1536 || atlas.Height != 1024 || names.Length != 24)
                throw new InvalidOperationException("Expected 1536x1024 atlas and 24 names.");
            if (rowOrigins.Length != 4 || Array.Exists(rowOrigins, y => y < 0 || y + 256 > atlas.Height))
                throw new InvalidOperationException("Invalid row origins.");
            foreach (var name in names)
                if (File.Exists(Path.Combine(directory, name + ".png")))
                    throw new IOException("Refusing to overwrite existing file: " + name);
            Directory.CreateDirectory(directory);
            long checkedPixels = 0;
            for (int i = 0; i < names.Length; i++) {
                var rect = new Rectangle((i % 6) * 256, rowOrigins[i / 6], 256, 256);
                var file = Path.Combine(directory, names[i] + ".png");
                using (var tile = atlas.Clone(rect, PixelFormat.Format32bppArgb))
                    tile.Save(file, ImageFormat.Png);
                using (var saved = new Bitmap(file)) {
                    bool hasTransparent = false, hasVisible = false;
                    for (int y = 0; y < 256; y++) for (int x = 0; x < 256; x++) {
                        var actual = saved.GetPixel(x, y);
                        var original = atlas.GetPixel(rect.X + x, rect.Y + y);
                        if (actual.ToArgb() != original.ToArgb())
                            throw new InvalidOperationException("Pixel mismatch: " + file);
                        hasTransparent |= actual.A == 0;
                        hasVisible |= actual.A > 32;
                        checkedPixels++;
                    }
                    if (!hasTransparent || !hasVisible)
                        throw new InvalidOperationException("Invalid sprite transparency: " + file);
                }
            }
            return checkedPixels;
        }
    }
}
'@
}

$checkedPixels = [ForestAtlasSplitter]::SplitAndVerify($Source, $OutputDirectory, $names, $RowOrigins)
$manifest = for ($i = 0; $i -lt $names.Count; $i++) {
    [ordered]@{
        file = $names[$i] + '.png'
        column = $i % 6
        row = [Math]::Floor($i / 6)
        sourceX = ($i % 6) * 256
        sourceY = $RowOrigins[[int][Math]::Floor($i / 6)]
        width = 256
        height = 256
    }
}
$manifestJson = ConvertTo-Json -Depth 5 -InputObject ([ordered]@{
    source = [IO.Path]::GetFileName($Source)
    sourceSha256 = (Get-FileHash -LiteralPath $Source -Algorithm SHA256).Hash
    columns = 6
    rows = 4
    cellSize = 256
    checkedPixels = $checkedPixels
    sprites = @($manifest)
})
[IO.File]::WriteAllText((Join-Path $OutputDirectory 'manifest.json'), $manifestJson, [Text.UTF8Encoding]::new($false))
[pscustomobject]@{ Directory = $OutputDirectory; SpriteCount = $names.Count; VerifiedPixels = $checkedPixels }
