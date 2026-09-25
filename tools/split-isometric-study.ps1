param([Parameter(Mandatory=$true)][string]$Source)
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
public static class IsoStudySplit {
 public static void Run(string source,string directory){
  string[] names={"grass-block","dirt-block","tree","fence","crate","shrubs"};
  using(var atlas=new Bitmap(source)){
   if(atlas.Width!=1536||atlas.Height!=1024)throw new Exception("Unexpected sheet size");
   for(int i=0;i<6;i++){
    int ox=i%3*512,oy=i/3*512,minX=512,minY=512,maxX=0,maxY=0;
    for(int y=0;y<512;y++)for(int x=0;x<512;x++)if(atlas.GetPixel(ox+x,oy+y).A>8){minX=Math.Min(minX,x);maxX=Math.Max(maxX,x);minY=Math.Min(minY,y);maxY=Math.Max(maxY,y);}
    var rect=new Rectangle(ox+minX,oy+minY,maxX-minX+1,maxY-minY+1);
    using(var cropped=atlas.Clone(rect,PixelFormat.Format32bppArgb)){
     if(i<2){using(var tile=new Bitmap(128,80,PixelFormat.Format32bppArgb)){
      using(var g=Graphics.FromImage(tile)){g.CompositingMode=CompositingMode.SourceCopy;g.InterpolationMode=InterpolationMode.HighQualityBicubic;g.DrawImage(cropped,new Rectangle(0,0,128,80));}
      tile.Save(Path.Combine(directory,names[i]+".png"),ImageFormat.Png);
     }}else cropped.Save(Path.Combine(directory,names[i]+".png"),ImageFormat.Png);
    }
    Console.WriteLine(names[i]+": "+rect);
   }
  }
 }
}
'@
[IsoStudySplit]::Run([IO.Path]::GetFullPath($Source),(Join-Path (Get-Location) 'assets/isometric-study'))
