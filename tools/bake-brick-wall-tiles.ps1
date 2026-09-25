param([string]$OutputFolder='assets/tileset/buildings/walls/brick',[string]$MaterialPath='')
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
public static class BrickWallBaker {
 const int W=256, T=384, H=256;
 static Bitmap source;
 static double Frac(double n){return n-Math.Floor(n);}
 static Color Tex(double u,double z,double light) {
  // A mirrored repeat keeps both ends identical, even if the generated material is imperfect.
  double phase=Frac(u*2); double q=phase<.5?phase*2:(1-phase)*2;
  int sx=122+(int)(q*480),sy=Math.Max(0,Math.Min(source.Height-1,(int)((1-z/H)*(source.Height-1))));
  Color c=source.GetPixel(sx,sy);
  return Color.FromArgb(255,Math.Min(255,(int)(c.R*light)),Math.Min(255,(int)(c.G*light)),Math.Min(255,(int)(c.B*light)));
 }
 static bool Occupied(int mask,int i,int j){
  if(mask>=16)mask=mask==16?5:10;
  bool a=i>=5&&i<=10,b=j>=5&&j<=10;
  return (a&&b)||((mask&1)!=0&&b&&i>=8)||((mask&2)!=0&&a&&j>=8)||((mask&4)!=0&&b&&i<=7)||((mask&8)!=0&&a&&j<=7);
 }
 static Color Sample(int mask,double x,double y){
  double u0=x/256+y/128,v0=-x/256+y/128,best=-1;int face=0;double bu=0,bv=0;
  for(int i=0;i<16;i++)for(int j=0;j<16;j++){
   if(!Occupied(mask,i,j))continue;
   double ulo=(i-8)/16.0,uhi=(i-7)/16.0,vlo=(j-8)/16.0,vhi=(j-7)/16.0;
   bool doorway=mask==16?(i>=4&&i<=11):mask==17&&(j>=4&&j<=11);
   double enter=Math.Max(doorway?208:0,Math.Max((ulo-u0)*128,(vlo-v0)*128));
   double leave=Math.Min(H,Math.Min((uhi-u0)*128,(vhi-v0)*128));
   if(enter>=leave||leave<=best)continue;
   best=leave;bu=u0+best/128;bv=v0+best/128;
   face=best>=H-1e-8?0:((uhi-u0)*128<(vhi-v0)*128?1:2);
  }
  if(best<0)return Color.Transparent;
  // Keep complete caps. Runtime separates their pixels and controls opacity
  // from the adjoining wall; transparent neighbours must not leave open ends.
  if(face==0){
   // Map both ground axes on wide wall caps rather than stretching one texture scanline.
   double across=Frac(bv*2);across=across<.5?across*2:(1-across)*2;
   return Tex(bu,H*(.35+.3*across),1.10);
  }
  return Tex(face==1?bv:bu,best,face==1?.74:1.0);
 }
 public static void Run(string folder,string materialPath){
  source=new Bitmap(materialPath);
  Bake(folder,0,16,4,1044,1556,"brick-wall-atlas.png");
  source.Dispose();
 }
 static void Bake(string folder,int first,int count,int columns,int width,int height,string filename){
  using(Bitmap atlas=new Bitmap(width,height,PixelFormat.Format32bppArgb)){
   for(int tile=0;tile<count;tile++){
    int mask=first+tile;
    int ox=2+(tile%columns)*260,oy=2+(tile/columns)*388;
    for(int y=0;y<T;y++)for(int x=0;x<W;x++){
     int r=0,g=0,b=0,n=0;
     for(int sy=0;sy<2;sy++)for(int sx=0;sx<2;sx++){
      Color c=Sample(mask,x+(sx+.5)/2-128,y+(sy+.5)/2-336);
      if(c.A>0){r+=c.R;g+=c.G;b+=c.B;n++;}
     }
     if(n>0)atlas.SetPixel(ox+x,oy+y,Color.FromArgb(n*255/4,r/n,g/n,b/n));
    }
   }
   atlas.Save(Path.Combine(folder,filename),ImageFormat.Png);
  }
 }
}
'@
$destination=[System.IO.Path]::GetFullPath((Join-Path (Get-Location) $OutputFolder))
[System.IO.Directory]::CreateDirectory($destination) | Out-Null
if(!$MaterialPath){$MaterialPath=Join-Path $destination 'brick-material-source.png'}
[BrickWallBaker]::Run($destination,[System.IO.Path]::GetFullPath($MaterialPath))
