param([string]$Source='assets/tileset/forest-style-v2-hd/source.png',[string]$Output='assets/tileset/forest-style-v2-hd/tiles')
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force -Path $Output | Out-Null
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;
public static class BakeForestDiamondHD {
 public static void Run(string source,string output) {
  using(var src=new Bitmap(source)) using(var atlas=new Bitmap(1584,1224,PixelFormat.Format32bppArgb)) {
   if(src.Width*3!=src.Height*2)throw new Exception("Atlas must have a 2:3 aspect ratio.");
   double sw=src.Width/6.0,sh=src.Height/9.0;
   for(int row=0;row<9;row++)for(int col=0;col<6;col++)using(var tile=new Bitmap(256,128,PixelFormat.Format32bppArgb)) {
    for(int y=0;y<128;y++)for(int x=0;x<256;x++) {
     int count=0,r=0,g=0,b=0;
     for(int yy=0;yy<2;yy++)for(int xx=0;xx<2;xx++) {
      double dx=(x+(xx+.5)/2)/256-.5,dy=(y+(yy+.5)/2)/128;
      double u=dx+dy,v=dy-dx;
      if(u>=0&&u<1&&v>=0&&v<1) {
       int sx=Math.Min(src.Width-1,(int)((col+u)*sw)),sy=Math.Min(src.Height-1,(int)((row+v)*sh));
       Color c=src.GetPixel(sx,sy);count++;r+=c.R;g+=c.G;b+=c.B;
      }
     }
     Color pixel=count==0?Color.Transparent:Color.FromArgb(count*255/4,r/count,g/count,b/count);
     tile.SetPixel(x,y,pixel);atlas.SetPixel(col*264+4+x,row*136+4+y,pixel);
    }
    tile.Save(Path.Combine(output,"tile-"+(row*6+col).ToString("D2")+".png"),ImageFormat.Png);
   }
   atlas.Save(Path.Combine(output,"forest-diamond-atlas.png"),ImageFormat.Png);
   Console.WriteLine("Source {0}x{1}; 54 tiles 256x128; atlas 1584x1224; no intermediate resizing",src.Width,src.Height);
  }
 }
}
'@
[BakeForestDiamondHD]::Run([IO.Path]::GetFullPath($Source),[IO.Path]::GetFullPath($Output))
