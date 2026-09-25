param([switch]$Gables,[string]$OutputFolder='', [string]$MaterialPath='')
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
public static class SlateRoofBaker {
 const int W=320,H=640;
 static Bitmap material,brick;
 static double Mirror(double x){x=x-Math.Floor(x);return x<.5?x*2:2-x*2;}
 static Color Texture(double along,double across,double light){
  Color c=material.GetPixel((int)(Mirror(along/2)*(material.Width-1)),(int)(Mirror(across/2)*(material.Height-1)));
  return Shade(c,light);
 }
 static Color Shade(Color c,double f){return Color.FromArgb(255,Math.Min(255,(int)(c.R*f)),Math.Min(255,(int)(c.G*f)),Math.Min(255,(int)(c.B*f)));}
 static double Height(double q){return 424-48*Math.Abs(q-3);}
 static Color Sample(int axis,int row,int end,double x,double y){
  double u0=x/256+y/128,v0=-x/256+y/128;
  double p0=axis==0?u0:v0,q0=axis==0?v0:u0;
  double plo=end==1?-.625:-.5,phi=end==2?.625:.5;
  double qlo=row==0?-.625:-.5,qhi=row==6?.625:.5;
  double best=-1;Color result=Color.Transparent;
  for(int side=0;side<2;side++){
   double k=side==0?48:-48,baseH=side==0?280+48*row:568-48*row;
   double z=(baseH+k*q0)/(1-k/128),p=p0+z/128,q=q0+z/128;
   if(p<plo||p>phi||q<qlo||q>qhi||(side==0?q+row>3:q+row<3)||z<=best)continue;
   best=z;result=Texture(p,q+row,side==0?(axis==0?.80:1.0):(axis==0?1.0:.80));
   if(Math.Abs(q+row-3)<.08)result=Texture(p,3,.72); // Continuous ridge cap course.
  }
  // Only roofing material: gable masonry is baked independently.
  if(end==2){
   double bound=.625,z=(bound-p0)*128,q=q0+z/128;
   if(z>best&&q>=qlo&&q<=qhi&&z>=Height(q+row)-12&&z<=Height(q+row)) {best=z;result=Texture(0,q+row,.55);}
  }
  if(row==6){
   double bound=row==0?-.625:.625,z=(bound-q0)*128,p=p0+z/128;
   if(z>best&&p>=plo&&p<=phi&&z>=Height(bound+row)-12&&z<=Height(bound+row))result=Texture(p,row,.52);
  }
  return result;
 }
 static Color SampleGable(int axis,int row,double x,double y){
  double u0=x/256+y/128,v0=-x/256+y/128,p0=axis==0?u0:v0,q0=axis==0?v0:u0;
  double z=(.5-p0)*128,q=q0+z/128;
  if(q<-.5||q>.5||z<256||z>Height(q+row)-12)return Color.Transparent;
  int sx=122+(int)(Mirror((q+row)*2)*480),sy=(int)((1-((z-256)%256)/256)*(brick.Height-1));
  return Shade(brick.GetPixel(sx,sy),axis==0?.74:1.0);
 }
 public static void Run(string folder,bool gables,string materialPath){
  if(gables)brick=new Bitmap(materialPath);
  else material=new Bitmap(materialPath);
  int rows=gables?1:3;
  for(int axis=0;axis<2;axis++)using(Bitmap atlas=new Bitmap(2272,rows*644+4,PixelFormat.Format32bppArgb)){
   for(int end=0;end<rows;end++)for(int row=0;row<7;row++){
    int ox=2+row*324,oy=2+end*644;
    for(int y=0;y<H;y++)for(int x=0;x<W;x++){
     int r=0,g=0,b=0,n=0;
     for(int sy=0;sy<2;sy++)for(int sx=0;sx<2;sx++){
      double px=x+(sx+.5)/2-160,py=y+(sy+.5)/2-560;
      Color c=gables?SampleGable(axis,row,px,py):Sample(axis,row,end,px,py);
      if(c.A>0){r+=c.R;g+=c.G;b+=c.B;n++;}
     }
     if(n>0)atlas.SetPixel(ox+x,oy+y,Color.FromArgb(n*255/4,r/n,g/n,b/n));
    }
   }
   atlas.Save(Path.Combine(folder,(gables?"brick-gable-":"slate-roof-")+axis+".png"),ImageFormat.Png);
  }
  if(material!=null)material.Dispose();if(brick!=null)brick.Dispose();
 }
}
'@
if(!$OutputFolder){$OutputFolder=if($Gables){'assets/tileset/buildings/walls/brick'}else{'assets/tileset/buildings/roofs/slate'}}
$destination=[System.IO.Path]::GetFullPath((Join-Path (Get-Location) $OutputFolder))
[System.IO.Directory]::CreateDirectory($destination) | Out-Null
if(!$MaterialPath){$MaterialPath=Join-Path $destination $(if($Gables){'brick-material-source.png'}else{'slate-material-source.png'})}
[SlateRoofBaker]::Run($destination,$Gables.IsPresent,[System.IO.Path]::GetFullPath($MaterialPath))
