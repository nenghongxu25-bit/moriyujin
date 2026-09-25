$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$root=Join-Path (Get-Location) 'assets/atlas/picture/items/extraction-loot-v1'
$backup=Join-Path (Get-Location) 'backups/loot-before-grid-fit-20260921'
New-Item -ItemType Directory -Force -Path $backup | Out-Null
$manifestPath=Join-Path $root 'manifest.json'
if(-not(Test-Path -LiteralPath (Join-Path $backup 'manifest.json'))){Copy-Item -LiteralPath $manifestPath -Destination (Join-Path $backup 'manifest.json')}
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
public static class LootGridFit {
 public static Rectangle Bounds(Bitmap b) {
  int l=b.Width,t=b.Height,r=-1,d=-1;
  for(int y=0;y<b.Height;y++)for(int x=0;x<b.Width;x++)if(b.GetPixel(x,y).A>8){l=Math.Min(l,x);t=Math.Min(t,y);r=Math.Max(r,x);d=Math.Max(d,y);}
  if(r<0)throw new Exception("Empty image");
  l=Math.Max(0,l-3);t=Math.Max(0,t-3);r=Math.Min(b.Width-1,r+3);d=Math.Min(b.Height-1,d+3);
  return Rectangle.FromLTRB(l,t,r+1,d+1);
 }
 public static string Fit(string input,string output,int w,int h,float angle) {
  using(var source=new Bitmap(input)) {
   int side=(int)Math.Ceiling(Math.Sqrt(source.Width*source.Width+source.Height*source.Height))+8;
   using(var oriented=new Bitmap(side,side,PixelFormat.Format32bppArgb)) {
    using(var g=Graphics.FromImage(oriented)){g.Clear(Color.Transparent);g.InterpolationMode=InterpolationMode.HighQualityBicubic;g.TranslateTransform(side/2f,side/2f);g.RotateTransform(angle);g.DrawImage(source,-source.Width/2f,-source.Height/2f,source.Width,source.Height);}
    Rectangle bounds=Bounds(oriented);
    double scale=Math.Min((w-32.0)/bounds.Width,(h-32.0)/bounds.Height);
    float dw=(float)(bounds.Width*scale),dh=(float)(bounds.Height*scale);
    using(var result=new Bitmap(w,h,PixelFormat.Format32bppArgb)) {
     using(var g=Graphics.FromImage(result)){g.Clear(Color.Transparent);g.CompositingMode=CompositingMode.SourceCopy;g.InterpolationMode=InterpolationMode.HighQualityBicubic;g.PixelOffsetMode=PixelOffsetMode.HighQuality;g.DrawImage(oriented,new RectangleF((w-dw)/2,(h-dh)/2,dw,dh),bounds,GraphicsUnit.Pixel);}
     result.Save(output,ImageFormat.Png);
    }
    return String.Format("{0}x{1}; sourceBounds={2}x{3}; uniformScale={4:F6}; rotation={5}",w,h,bounds.Width,bounds.Height,scale,angle);
   }
  }
 }
}
'@
$manifest=Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
foreach($item in $manifest.items){
 $original=Join-Path $backup $item.file
 $target=Join-Path $root $item.file
 New-Item -ItemType Directory -Force -Path (Split-Path -Parent $original) | Out-Null
 if(-not(Test-Path -LiteralPath $original)){Copy-Item -LiteralPath $target -Destination $original}
 $grid=$item.grid.Split('x');$w=[int]$grid[0]*256;$h=[int]$grid[1]*256
 $angle=0;if($item.id -eq 'rusty_wrench'){$angle=24}
 $result=[LootGridFit]::Fit($original,$target,$w,$h,$angle)
 $item | Add-Member -Force -NotePropertyName pixelWidth -NotePropertyValue $w
 $item | Add-Member -Force -NotePropertyName pixelHeight -NotePropertyValue $h
 $item | Add-Member -Force -NotePropertyName gridWidth -NotePropertyValue ([int]$grid[0])
 $item | Add-Member -Force -NotePropertyName gridHeight -NotePropertyValue ([int]$grid[1])
 $item | Add-Member -Force -NotePropertyName fitting -NotePropertyValue $result
 Write-Output ($item.id+': '+$result)
}
$manifest | Add-Member -Force -NotePropertyName pixelsPerCell -NotePropertyValue 256
$manifest | Add-Member -Force -NotePropertyName paddingPixels -NotePropertyValue 16
$manifest | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
