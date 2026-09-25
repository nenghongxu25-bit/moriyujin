param([string]$Only='')
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;using System.Drawing;using System.Drawing.Drawing2D;using System.Drawing.Imaging;
public static class FixedContainers {
 class Model {
  public PointF[] body,front,outer,inner,top;
  public PointF a,b,dc,doo,oa,ob,oc,ia,ib,ic;
 }
 static PointF P(float x,float y){return new PointF(x,y);}
 static PointF[] Q(params float[] xy){var points=new PointF[xy.Length/2];for(int i=0;i<points.Length;i++)points[i]=P(xy[i*2],xy[i*2+1]);return points;}
 static GraphicsPath Poly(PointF[] points){var p=new GraphicsPath();p.AddPolygon(points);return p;}
 static Bitmap Cut(Bitmap source,PointF[] points){var r=new Bitmap(512,512,PixelFormat.Format32bppArgb);using(var g=Graphics.FromImage(r))using(var p=Poly(points)){g.SetClip(p);g.DrawImageUnscaled(source,0,0);}return r;}
 static Matrix Map(PointF a,PointF b,PointF c,PointF u,PointF v,PointF w){float x1=b.X-a.X,y1=b.Y-a.Y,x2=c.X-a.X,y2=c.Y-a.Y,det=x1*y2-x2*y1;float ux=v.X-u.X,uy=v.Y-u.Y,vx=w.X-u.X,vy=w.Y-u.Y;float m11=(ux*y2-vx*y1)/det,m21=(vx*x1-ux*x2)/det,m12=(uy*y2-vy*y1)/det,m22=(vy*x1-uy*x2)/det;return new Matrix(m11,m12,m21,m22,u.X-m11*a.X-m21*a.Y,u.Y-m12*a.X-m22*a.Y);}
 static Model Definition(string id){var m=new Model();
  switch(id){
   case "suitcase":
    m.body=Q(54,318,189,228,465,312,474,365,476,381,361,482,55,377);
    m.front=Q(54,318,336,427,469,327,476,381,361,482,55,377);
    m.outer=Q(47,281,173,186,201,185,463,269,479,293,476,325,354,425,47,327);
    m.inner=Q(153,30,473,100,486,310,459,319,186,237,168,209);
    m.a=P(190,232);m.b=P(461,313);m.dc=P(-132,86);m.doo=P(-23,-182);
    m.oa=P(183,194);m.ob=P(465,282);m.oc=P(58,287);
    m.ia=m.a;m.ib=m.b;m.ic=P(167,50);break;
   case "ammo_box":
    m.body=Q(94,282,297,208,448,267,448,410,226,484,94,418);
    m.front=Q(94,282,226,340,448,267,448,410,226,484,94,418);
    m.outer=Q(88,159,331,73,477,128,480,161,237,247,90,203);
    m.inner=Q(260,25,440,25,475,285,290,220);
    m.a=P(297,211);m.b=P(445,268);m.dc=P(-201,73);m.doo=P(-21,-163);
    m.oa=P(333,82);m.ob=P(470,137);m.oc=P(94,164);
    m.ia=m.a;m.ib=m.b;m.ic=P(276,48);break;
   case "medical_case":
    m.body=Q(70,285,210,198,478,294,479,395,339,483,69,365);
    m.front=Q(70,285,339,402,477,301,479,395,339,483,69,365);
    m.outer=Q(72,255,219,158,467,244,481,276,480,319,339,399,76,298);
    m.inner=Q(189,24,237,24,478,107,492,271,481,299,201,200);
    m.a=P(211,202);m.b=P(472,302);m.dc=P(-137,85);m.doo=P(-11,-166);
    m.oa=P(222,167);m.ob=P(474,263);m.oc=P(78,274);
    m.ia=m.a;m.ib=m.b;m.ic=P(200,36);break;
   case "toolbox":
    m.body=Q(88,230,212,171,480,287,480,402,344,482,86,347);
    m.front=Q(88,232,345,360,478,292,480,402,344,482,86,347);
    m.outer=Q(87,193,210,120,472,238,483,278,347,356,88,237);
    m.inner=Q(170,0,510,0,510,300,494,296,205,178);
    m.a=P(214,174);m.b=P(475,287);m.dc=P(-118,61);m.doo=P(-27,-131);
    m.oa=P(213,130);m.ob=P(475,243);m.oc=P(92,205);
    m.ia=m.a;m.ib=m.b;m.ic=P(187,43);break;
   case "trash_bin":
    m.body=Q(219,204,350,140,474,187,483,444,345,482,243,439);
    m.front=Q(219,205,344,269,474,201,483,444,345,482,243,439);
    m.outer=Q(231,176,363,90,476,132,477,166,350,226,230,199);
    m.inner=Q(347,140,374,25,487,29,505,69,483,194,458,192);
    m.a=P(351,142);m.b=P(466,190);m.dc=P(-126,65);m.doo=P(28,-112);
    m.oa=P(366,101);m.ob=P(465,145);m.oc=P(239,176);
    m.ia=m.a;m.ib=m.b;m.ic=P(379,30);break;
   case "supply_crate":
    m.body=Q(68,253,211,164,481,286,480,402,341,483,68,349);
    m.front=Q(68,254,335,379,478,290,480,402,341,483,68,349);
    m.outer=Q(65,231,195,135,480,250,482,286,340,374,65,269);
    m.inner=Q(209,168,226,0,257,0,500,104,502,263,482,286);
    m.a=P(211,167);m.b=P(473,283);m.dc=P(-138,89);m.doo=P(20,-155);
    m.oa=P(200,144);m.ob=P(471,258);m.oc=P(71,236);
    m.ia=m.a;m.ib=m.b;m.ic=P(231,12);break;
   case "computer_tower":
    m.body=Q(154,66,256,32,484,119,484,445,389,483,159,371);
    m.front=Q(382,152,484,119,484,445,389,483);
    m.top=Q(154,66,256,32,484,119,382,158);
    m.outer=Q(154,83,377,155,380,469,153,366);
    m.inner=Q(46,160,171,78,179,366,48,441);
    m.a=P(172,85);m.b=P(172,369);m.dc=P(216,72);m.doo=P(-119,80);
    m.oa=P(160,91);m.ob=P(160,366);m.oc=P(376,163);
    m.ia=m.a;m.ib=m.b;m.ic=P(53,165);break;
   default:throw new Exception("Unknown container "+id);
  }return m;
 }
 static void FixedFace(Graphics g,Bitmap source,PointF[] mask){using(var clip=Poly(mask)){g.ResetTransform();g.SetClip(clip);g.CompositingMode=CompositingMode.SourceCopy;g.DrawImageUnscaled(source,0,0);g.ResetClip();g.CompositingMode=CompositingMode.SourceOver;}}
 public static void AmmoSource(string sheetPath,string path){using(var sheet=new Bitmap(sheetPath))using(var dst=new Bitmap(512,512,PixelFormat.Format32bppArgb)){using(var g=Graphics.FromImage(dst)){g.InterpolationMode=InterpolationMode.HighQualityBicubic;g.DrawImage(sheet,new RectangleF(90,34,375,444),new Rectangle(696,576,500,592),GraphicsUnit.Pixel);}dst.Save(path,ImageFormat.Png);}}
 public static int Build(string id,string input,string output,string layers){
  if(id=="duffel_bag")return Bag(input,output,layers);
  var m=Definition(id);using(var closed=new Bitmap(input+"/frame_00.png"))using(var opened=new Bitmap(id=="ammo_box"?layers+"/complete_open.png":input+"/frame_03.png"))
  using(var body=Cut(opened,m.body))using(var outside=Cut(closed,m.outer))using(var inside=Cut(opened,m.inner)){
   body.Save(layers+"/body.png",ImageFormat.Png);outside.Save(layers+"/lid_outside.png",ImageFormat.Png);inside.Save(layers+"/lid_inside.png",ImageFormat.Png);
   double[] angles=id=="computer_tower"?new double[]{0,27,65,90}:new double[]{0,18,58,90};
   for(int i=0;i<4;i++)using(var dst=new Bitmap(512,512,PixelFormat.Format32bppArgb)){
    using(var g=Graphics.FromImage(dst)){
     g.InterpolationMode=InterpolationMode.HighQualityBicubic;g.PixelOffsetMode=PixelOffsetMode.HighQuality;g.DrawImageUnscaled(body,0,0);
     double a=angles[i]*Math.PI/180;var moving=P((float)(m.a.X+m.dc.X*Math.Cos(a)+m.doo.X*Math.Sin(a)),(float)(m.a.Y+m.dc.Y*Math.Cos(a)+m.doo.Y*Math.Sin(a)));
     using(var matrix=i<2?Map(m.oa,m.ob,m.oc,m.a,m.b,moving):Map(m.ia,m.ib,m.ic,m.a,m.b,moving)){g.Transform=matrix;g.DrawImageUnscaled(i<2?outside:inside,0,0);g.ResetTransform();}
     FixedFace(g,body,m.front);if(m.top!=null)FixedFace(g,body,m.top);
    }dst.Save(output+"/frame_0"+i+".png",ImageFormat.Png);
   }
   return Check(output,m.front,m.top,false);
  }
 }
 static int Bag(string input,string output,string layers){
  var moving=Q(0,0,512,0,512,280,431,279,324,268,225,253,149,210,76,150,0,150);
  using(var stable=new Bitmap(input+"/frame_03.png")){
   RemoveFragments(stable);
   stable.Save(layers+"/body_reference.png",ImageFormat.Png);
   for(int i=0;i<4;i++)using(var original=new Bitmap(input+"/frame_0"+i+".png"))using(var dst=new Bitmap(512,512,PixelFormat.Format32bppArgb)){
    RemoveFragments(original);
    using(var g=Graphics.FromImage(dst)){g.DrawImageUnscaled(stable,0,0);FixedFace(g,original,moving);}
    RemoveFragments(dst);
    dst.Save(output+"/frame_0"+i+".png",ImageFormat.Png);
   }
  }return Check(output,moving,null,true);
 }
 // Keep the connected bag silhouette and its one-pixel antialias fringe.
 // Low-alpha flecks in transparent space must not become visible over bright floors.
 static void RemoveFragments(Bitmap bitmap){
  int w=bitmap.Width,h=bitmap.Height,n=w*h;var alpha=new byte[n];var seen=new bool[n];var queue=new int[n];var keep=new bool[n];int largest=0;
  for(int y=0;y<h;y++)for(int x=0;x<w;x++)alpha[y*w+x]=bitmap.GetPixel(x,y).A;
  for(int p=0;p<n;p++)if(!seen[p]&&alpha[p]>=16){int head=0,tail=1;queue[0]=p;seen[p]=true;
   while(head<tail){int q=queue[head++],x=q%w,y=q/w;for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++){int xx=x+dx,yy=y+dy;if(xx<0||xx>=w||yy<0||yy>=h)continue;int r=yy*w+xx;if(!seen[r]&&alpha[r]>=16){seen[r]=true;queue[tail++]=r;}}}
   if(tail>largest){Array.Clear(keep,0,n);for(int j=0;j<tail;j++)keep[queue[j]]=true;largest=tail;}
  }
  int removed=0;for(int y=0;y<h;y++)for(int x=0;x<w;x++){int p=y*w+x;if(keep[p])continue;bool fringe=false;if(alpha[p]<16)for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++){int xx=x+dx,yy=y+dy;if(xx>=0&&xx<w&&yy>=0&&yy<h&&keep[yy*w+xx])fringe=true;}if(!fringe){if(alpha[p]>0)removed++;bitmap.SetPixel(x,y,Color.Transparent);}}
  Console.WriteLine("Transparent-area cleanup: "+removed+" stray pixels removed");
 }
 static int Check(string output,PointF[] region,PointF[] second,bool invert){int compared=0;using(var shape=Poly(region))using(var extra=second==null?new GraphicsPath():Poly(second))using(var reference=new Bitmap(output+"/frame_00.png")){
   for(int i=1;i<4;i++)using(var frame=new Bitmap(output+"/frame_0"+i+".png"))for(int y=1;y<511;y+=2)for(int x=1;x<511;x+=2){
   bool test=shape.IsVisible(x+.5f,y+.5f);if(invert)test=!test;else test=test||extra.IsVisible(x+.5f,y+.5f);
   if(!test||reference.GetPixel(x,y).A<250)continue;
   // Exclude rasterized polygon boundaries, whose coverage can be fractional.
   bool boundary=false;for(int yy=-1;yy<=1;yy++)for(int xx=-1;xx<=1;xx++){bool inside=shape.IsVisible(x+xx+.5f,y+yy+.5f);if(invert?inside:(!inside&&!extra.IsVisible(x+xx+.5f,y+yy+.5f)))boundary=true;}
   if(boundary)continue;
   if(reference.GetPixel(x,y).ToArgb()!=frame.GetPixel(x,y).ToArgb())throw new Exception("Stationary pixels changed: "+output+" frame "+i+" at "+x+","+y);compared++;
  }
 }if(compared<10000)throw new Exception("Insufficient fixed surface test coverage");return compared;}
}
'@
$records=@(@{id='ammo_box';batch=1},@{id='medical_case';batch=1},@{id='toolbox';batch=1},@{id='trash_bin';batch=2},@{id='duffel_bag';batch=1},@{id='computer_tower';batch=3},@{id='supply_crate';batch=3},@{id='suitcase';batch=2})
$report=@()
foreach($r in $records){
 if($Only -and $Only -ne $r.id){continue}
 $dir="assets/animation/container/loot-points-v$($r.batch)/$($r.id)"
 $backup="art/container-bodies-before-lock/$($r.id)"
 $layers="art/container-fixed-layers/$($r.id)"
 if(-not(Test-Path $backup)){New-Item -ItemType Directory -Force $backup|Out-Null;Copy-Item "$dir/frame_*.png" $backup}
 New-Item -ItemType Directory -Force $layers|Out-Null
 if($r.id -eq 'ammo_box'){[FixedContainers]::AmmoSource((Join-Path (Get-Location) 'art/loot-points-v1/source/ammo_box.png'),(Join-Path (Get-Location) "$layers/complete_open.png"))}
 $count=[FixedContainers]::Build($r.id,(Join-Path (Get-Location) $backup),(Join-Path (Get-Location) $dir),(Join-Path (Get-Location) $layers))
 $report+=@{id=$r.id;batch=$r.batch;fixedPixelComparisons=$count;frameSize=512;frames=4;method=if($r.id -eq 'duffel_bag'){'fixed body, local bag opening'}else{'fixed body, hinged surface'}}
 Write-Output "$($r.id): PASS $count fixed pixel comparisons"
}
if($Only -and (Test-Path docs/container-fixed-bodies-checks.json)){$previous=Get-Content docs/container-fixed-bodies-checks.json -Raw -Encoding UTF8|ConvertFrom-Json;$report=@($previous|Where-Object id -ne $Only)+$report}
$report|ConvertTo-Json -Depth 4|Set-Content docs/container-fixed-bodies-checks.json -Encoding UTF8
