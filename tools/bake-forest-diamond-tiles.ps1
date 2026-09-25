param([string]$Source='assets/tileset/forest/forest.png',[string]$Output='assets/forest-isometric-study/tiles')
Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Path $Output -Force | Out-Null
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;
public static class BakeForestDiamonds {
 static Color Sample(Bitmap src,int ox,int oy,double x,double y){
  int ix=Math.Max(0,Math.Min(127,(int)x)),iy=Math.Max(0,Math.Min(127,(int)y));
  return src.GetPixel(ox+ix,oy+iy);
 }
 public static void Run(string source,string output){
  using(var src=new Bitmap(source))using(var atlas=new Bitmap(792,612,PixelFormat.Format32bppArgb)){
   if(src.Width!=768||src.Height!=1152)throw new Exception("Unexpected forest atlas dimensions");
   for(int row=0;row<9;row++)for(int col=0;col<6;col++)using(var tile=new Bitmap(128,64,PixelFormat.Format32bppArgb)){
    for(int y=0;y<64;y++)for(int x=0;x<128;x++){
     int count=0,r=0,g=0,b=0;
     for(int yy=0;yy<2;yy++)for(int xx=0;xx<2;xx++){
      double dx=x+(xx+.5)/2-64,dy=y+(yy+.5)/2;
      double sx=dx+2*dy,sy=2*dy-dx;
      if(sx>=0&&sx<128&&sy>=0&&sy<128){Color c=Sample(src,col*128,row*128,sx,sy);count++;r+=c.R;g+=c.G;b+=c.B;}
     }
     Color pixel=count==0?Color.Transparent:Color.FromArgb(count*255/4,r/count,g/count,b/count);
     tile.SetPixel(x,y,pixel);atlas.SetPixel(col*132+2+x,row*68+2+y,pixel);
    }
    tile.Save(Path.Combine(output,"tile-"+(row*6+col).ToString("D2")+".png"),ImageFormat.Png);
   }
   atlas.Save(Path.Combine(output,"forest-diamond-atlas.png"),ImageFormat.Png);
  }
  Console.WriteLine("54 transparent 128x64 diamond tiles; 792x612 atlas; margin 2 / separation 4");
 }
}
'@
[BakeForestDiamonds]::Run([IO.Path]::GetFullPath($Source),[IO.Path]::GetFullPath($Output))
