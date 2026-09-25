param([string]$Directory = 'assets/decorate/city/urban-kit-v1')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
public static class UrbanSpriteInspection {
    public static int[] Inspect(string path) {
        using(var b = new Bitmap(path)) {
            int clear=0, visible=0, edge=0, minX=b.Width, minY=b.Height, maxX=-1, maxY=-1;
            for(int y=0;y<b.Height;y++) for(int x=0;x<b.Width;x++) {
                var a=b.GetPixel(x,y).A;
                if(a==0)clear++;
                if(a>32){visible++;minX=Math.Min(minX,x);minY=Math.Min(minY,y);maxX=Math.Max(maxX,x);maxY=Math.Max(maxY,y);
                    if(x==0||y==0||x==b.Width-1||y==b.Height-1)edge++;
                }
            }
            return new[]{b.Width,b.Height,clear,visible,edge,minX,minY,maxX,maxY};
        }
    }
}
'@
$results = @(Get-ChildItem -LiteralPath $Directory -Filter *.png | ForEach-Object {
    $v = [UrbanSpriteInspection]::Inspect($_.FullName)
    [ordered]@{file=$_.Name;width=$v[0];height=$v[1];transparentPixels=$v[2];visiblePixels=$v[3];visibleEdgePixels=$v[4];visibleBounds=@($v[5],$v[6],$v[7],$v[8]);valid=($v[2] -gt 0 -and $v[3] -gt 0 -and $v[4] -eq 0)}
})
$results | ConvertTo-Json -Depth 4
if (@($results | Where-Object { -not $_.valid }).Count -gt 0) { exit 1 }
