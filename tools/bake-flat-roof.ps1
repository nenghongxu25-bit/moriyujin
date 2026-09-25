Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
public static class FlatRoofBaker {
 const int W=320,H=640;
 static Bitmap material;
 static double Mirror(double t){t-=Math.Floor(t);return t<.5?t*2:2-t*2;}
 static Color Texture(double u,double v,double shade){
  Color c=material.GetPixel((int)(Mirror(u+.5)*(material.Width-1)),(int)(Mirror(v+.5)*(material.Height-1)));
  return Color.FromArgb(255,(int)(c.R*shade),(int)(c.G*shade),(int)(c.B*shade));
 }
 static Color Sample(int mask,double x,double y){
  double u0=x/256+y/128,v0=-x/256+y/128;
  double u=u0+268.0/128,v=v0+268.0/128;
  if(u>=-.5&&u<.5&&v>=-.5&&v<.5){
   bool rim=((mask&1)!=0&&u>.465)||((mask&2)!=0&&v>.465)||((mask&4)!=0&&u<-.465)||((mask&8)!=0&&v<-.465);
   return Texture(u,v,rim?.82:1);
  }
  if((mask&1)!=0){double z=(.5-u0)*128,q=v0+z/128;if(z>=256&&z<268&&q>=-.5&&q<.5)return Texture(.5,q,.58);}
  if((mask&2)!=0){double z=(.5-v0)*128,q=u0+z/128;if(z>=256&&z<268&&q>=-.5&&q<.5)return Texture(q,.5,.72);}
  return Color.Transparent;
 }
 public static void Run(string root){
  string dest=Path.Combine(root,"assets/tileset/buildings/roofs/flat-concrete");Directory.CreateDirectory(dest);
  using(material=new Bitmap(Path.Combine(root,"assets/tileset/buildings/materials/concrete.png")))
  using(Bitmap atlas=new Bitmap(1300,2580,PixelFormat.Format32bppArgb)){
   for(int m=0;m<16;m++)for(int y=0;y<H;y++)for(int x=0;x<W;x++){
    // Exact pixel-centre coverage: adjoining diamonds own every pixel once.
    atlas.SetPixel(2+(m%4)*324+x,2+(m/4)*644+y,Sample(m,x+.5-160,y+.5-560));
   }
   atlas.Save(Path.Combine(dest,"flat-roof-atlas.png"),ImageFormat.Png);
   using(Bitmap preview=new Bitmap(1200,820))using(Graphics g=Graphics.FromImage(preview))using(Font font=new Font("Arial",12)){
    g.Clear(Color.FromArgb(38,43,48));
    for(int m=0;m<16;m++){
     int px=20+(m%8)*148,py=30+(m/8)*140;
     g.DrawString(m.ToString("00"),font,Brushes.White,px,py);
     g.DrawImage(atlas,new Rectangle(px,py+22,144,90),new Rectangle(2+(m%4)*324+16,2+(m/4)*644+210,288,180),GraphicsUnit.Pixel);
    }
    // Rectangle, L-shaped footprint, and ring with courtyard.
    for(int shape=0;shape<3;shape++){
     Func<int,int,bool> has=(u,v)=>u>=0&&v>=0&&u<6&&v<6&&(shape==0||(shape==1?u<3||v<3:!(u>=2&&u<4&&v>=2&&v<4)));
     g.DrawString(shape==0?"Rectangle":shape==1?"L shape":"Courtyard",font,Brushes.White,30+shape*400,350);
     using(Bitmap mosaic=new Bitmap(1600,1000))using(Graphics mg=Graphics.FromImage(mosaic)){
     for(int sum=0;sum<=10;sum++)for(int u=0;u<6;u++){int v=sum-u;if(!has(u,v))continue;
      int m=(!has(u+1,v)?1:0)|(!has(u,v+1)?2:0)|(!has(u-1,v)?4:0)|(!has(u,v-1)?8:0);
      int cx=800+(u-v)*128,cy=140+(u+v)*64;
      mg.DrawImage(atlas,new Rectangle(cx-160,cy-292,320,640),new Rectangle(2+(m%4)*324,2+(m/4)*644,320,640),GraphicsUnit.Pixel);
     }
     // Check the native composite has no transparent cracks within occupied top faces.
     for(int y=76;y<845;y++)for(int x=0;x<1600;x++){
      double uu=(x+.5-800)/256+(y+.5-140)/128,vv=-(x+.5-800)/256+(y+.5-140)/128;
      if(has((int)Math.Floor(uu+.5),(int)Math.Floor(vv+.5))&&mosaic.GetPixel(x,y).A!=255)throw new Exception("Flat roof gap at "+x+","+y);
     }
     g.InterpolationMode=System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
     g.DrawImage(mosaic,new Rectangle(shape*400,430,400,250));
     }
    }
    preview.Save(Path.Combine(root,"docs/flat-roof-preview.png"),ImageFormat.Png);
   }
  }
 }
}
'@
[FlatRoofBaker]::Run((Get-Location).Path)
