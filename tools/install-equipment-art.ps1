$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
public static class WeaponIconFit {
 public static Rectangle Bounds(Bitmap bitmap) {
  var data=bitmap.LockBits(new Rectangle(0,0,bitmap.Width,bitmap.Height),ImageLockMode.ReadOnly,PixelFormat.Format32bppArgb);
  int l=bitmap.Width,t=bitmap.Height,r=-1,b=-1,transparent=0;
  try {
   byte[] pixels=new byte[Math.Abs(data.Stride)*bitmap.Height];Marshal.Copy(data.Scan0,pixels,0,pixels.Length);
   for(int y=0;y<bitmap.Height;y++)for(int x=0;x<bitmap.Width;x++){
    byte alpha=pixels[y*data.Stride+x*4+3];if(alpha==0)transparent++;
    if(alpha>8){l=Math.Min(l,x);t=Math.Min(t,y);r=Math.Max(r,x);b=Math.Max(b,y);}
   }
  } finally {bitmap.UnlockBits(data);}
  if(r<0||transparent<bitmap.Width*bitmap.Height/50)throw new Exception("Expected a nonempty transparent icon");
  return Rectangle.FromLTRB(Math.Max(0,l-2),Math.Max(0,t-2),Math.Min(bitmap.Width,r+3),Math.Min(bitmap.Height,b+3));
 }
 public static string Fit(string sourcePath,string targetPath,int width,int height) {
  using(var source=new Bitmap(sourcePath)){
   Rectangle bounds=Bounds(source);double scale=Math.Min((width-32.0)/bounds.Width,(height-32.0)/bounds.Height);
   float w=(float)(bounds.Width*scale),h=(float)(bounds.Height*scale);
   using(var target=new Bitmap(width,height,PixelFormat.Format32bppArgb)){
    using(var g=Graphics.FromImage(target)){g.Clear(Color.Transparent);g.CompositingMode=CompositingMode.SourceCopy;g.InterpolationMode=InterpolationMode.HighQualityBicubic;g.PixelOffsetMode=PixelOffsetMode.HighQuality;g.DrawImage(source,new RectangleF((width-w)/2,(height-h)/2,w,h),bounds,GraphicsUnit.Pixel);}
    target.Save(targetPath,ImageFormat.Png);
   }
   return String.Format("source={0}x{1}; alphaBounds={2}x{3}; uniformScale={4:F6}",source.Width,source.Height,bounds.Width,bounds.Height,scale);
  }
 }
}
'@

$manifestPath='docs/equipment-art-manifest.json'
$manifest=Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
$projectRoot=(Get-Location).Path
foreach($record in $manifest.items){
 $target=Join-Path $projectRoot $record.file
 $source=Join-Path $projectRoot $record.localSource
 New-Item -ItemType Directory -Force -Path (Split-Path -Parent $source),(Split-Path -Parent $target) | Out-Null
 if(-not(Test-Path -LiteralPath $source)){Copy-Item -LiteralPath $record.generatedSource -Destination $source}
 $fit=[WeaponIconFit]::Fit($source,$target,[int]$record.pixelWidth,[int]$record.pixelHeight)
 $record | Add-Member -Force -NotePropertyName fitting -NotePropertyValue $fit
 Write-Output ($record.id+': '+$record.pixelWidth+'x'+$record.pixelHeight)
}
$manifest | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
