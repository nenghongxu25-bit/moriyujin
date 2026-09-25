param([string]$Root='assets/tileset/buildings')
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;using System.IO;using System.Drawing;using System.Drawing.Imaging;
public static class IndoorMaterialBaker {
 static double Mirror(double n){n-=Math.Floor(n);return n<.5?n*2:2-n*2;}
 public static void Run(string root){
  string[] names={"wood","concrete","stone"};
  Directory.CreateDirectory(Path.Combine(root,"floors"));
  using(var atlas=new Bitmap(792,136,PixelFormat.Format32bppArgb)){
   for(int i=0;i<names.Length;i++)using(var src=new Bitmap(Path.Combine(root,"materials",names[i]+".png"))){
    for(int y=0;y<128;y++)for(int x=0;x<256;x++){
     int count=0,r=0,g=0,b=0;
     for(int yy=0;yy<2;yy++)for(int xx=0;xx<2;xx++){
      double dx=(x+(xx+.5)/2)/256-.5,dy=(y+(yy+.5)/2)/128;
      double u=dx+dy,v=dy-dx;
      if(u>=0&&u<1&&v>=0&&v<1){
       Color c=src.GetPixel((int)(Mirror(u)*(src.Width-1)),(int)(Mirror(v)*(src.Height-1)));
       count++;r+=c.R;g+=c.G;b+=c.B;
      }
     }
     if(count>0)atlas.SetPixel(i*264+4+x,4+y,Color.FromArgb(count*255/4,r/count,g/count,b/count));
    }
   }
   atlas.Save(Path.Combine(root,"floors","indoor-floor-atlas.png"),ImageFormat.Png);
  }
 }
}
'@
[IndoorMaterialBaker]::Run([IO.Path]::GetFullPath($Root))
