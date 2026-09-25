param([switch]$PrepareOnly,[switch]$Publish)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;using System.IO;using System.Drawing;using System.Drawing.Imaging;using System.Drawing.Drawing2D;
public static class V4Rigid {
 static PointF P(float x,float y){return new PointF(x,y);}
 static PointF Add(PointF a,PointF b){return P(a.X+b.X,a.Y+b.Y);}
 static PointF Mul(PointF a,float k){return P(a.X*k,a.Y*k);}
 static GraphicsPath Poly(params PointF[] p){var path=new GraphicsPath();path.AddPolygon(p);return path;}
 static Matrix Map(PointF a,PointF b,PointF c,PointF u,PointF v,PointF w){float x1=b.X-a.X,y1=b.Y-a.Y,x2=c.X-a.X,y2=c.Y-a.Y,det=x1*y2-x2*y1;float ux=v.X-u.X,uy=v.Y-u.Y,vx=w.X-u.X,vy=w.Y-u.Y;float m11=(ux*y2-vx*y1)/det,m21=(vx*x1-ux*x2)/det,m12=(uy*y2-vy*y1)/det,m22=(vy*x1-uy*x2)/det;return new Matrix(m11,m12,m21,m22,u.X-m11*a.X-m21*a.Y,u.Y-m12*a.X-m22*a.Y);}
 static Bitmap Cut(Bitmap source,params PointF[] p){var dst=new Bitmap(source.Width,source.Height,PixelFormat.Format32bppArgb);using(var g=Graphics.FromImage(dst))using(var path=Poly(p)){g.SetClip(path);g.DrawImageUnscaled(source,0,0);}return dst;}
 public static void Prepare(string root,string id){string dir=root+"/art/loot-points-v4/rigid-layers/"+id;using(var src=new Bitmap(dir+"/body-source.png")){
  int l=src.Width,t=src.Height,r=0,b=0;for(int y=0;y<src.Height;y++)for(int x=0;x<src.Width;x++)if(src.GetPixel(x,y).A>32){l=Math.Min(l,x);t=Math.Min(t,y);r=Math.Max(r,x);b=Math.Max(b,y);}
  float height=id=="cardboard_box"?285:396;float s=Math.Min(340f/(r-l+1),height/(b-t+1));float dx=440-r*s,dy=476-b*s;
  using(var dst=new Bitmap(512,512,PixelFormat.Format32bppArgb)){using(var g=Graphics.FromImage(dst)){g.InterpolationMode=InterpolationMode.HighQualityBicubic;g.DrawImage(src,dx,dy,src.Width*s,src.Height*s);}for(int y=0;y<512;y++)for(int x=0;x<512;x++){var color=dst.GetPixel(x,y);if(color.A>240)dst.SetPixel(x,y,Color.FromArgb(255,color.R,color.G,color.B));}dst.Save(dir+"/body.png",ImageFormat.Png);}Console.WriteLine(id+" normalized scale="+s+" offset="+dx+","+dy);
 }}
 class Panel {
  public Bitmap texture;public PointF a,b,c,hinge,end,closed,normal;public float rise;public bool vertical;
  public PointF[] Draw(Graphics g,float degrees){double angle=degrees*Math.PI/180;PointF d=Add(Mul(closed,(float)Math.Cos(angle)),vertical?Mul(normal,(float)Math.Sin(angle)):P(0,-rise*(float)Math.Sin(angle)));PointF free=Add(hinge,d);
   using(var m=Map(a,b,c,hinge,end,free)){g.Transform=m;g.DrawImageUnscaled(texture,0,0);g.ResetTransform();}
   PointF far=Add(end,d);using(var pen=new Pen(Color.FromArgb(160,92,67,41),1f)){g.DrawLine(pen,hinge,free);g.DrawLine(pen,free,far);g.DrawLine(pen,far,end);}return new[]{hinge,end,free,far};
  }
 }
 static Panel Part(Bitmap src,PointF a,PointF b,PointF c,PointF hinge,PointF end,PointF closed,PointF normal,float rise,bool vertical){PointF fourth=Add(b,P(c.X-a.X,c.Y-a.Y));return new Panel{texture=Cut(src,a,b,fourth,c),a=a,b=b,c=c,hinge=hinge,end=end,closed=closed,normal=normal,rise=rise,vertical=vertical};}
 public static void Build(string root,string id){string dir=root+"/art/loot-points-v4/rigid-layers/"+id;Directory.CreateDirectory(dir+"/frames");var panels=new System.Collections.Generic.List<Panel>();bool cabinet=id=="kitchen_cabinet";
  using(var body=new Bitmap(dir+"/body.png"))using(var original=new Bitmap(root+"/art/loot-points-v4/repair-backups/"+id+"/frame_"+(cabinet?"00":"03")+".png")){
   if(cabinet){
    panels.Add(Part(original,P(158,183),P(158,355),P(260,235),P(126,183),P(126,359),P(105,49),P(-61,39),0,true));
    panels.Add(Part(original,P(367,287),P(367,460),P(265,242),P(337,280),P(337,460),P(-106,-48),P(-61,39),0,true));
   }else{
    PointF a=P(166,264),b=P(279,194),c=P(436,297),d=P(316,370);
    PointF sa=P(105,202),sb=P(274,315),sc=P(46,225);
    panels.Add(Part(original,sa,sb,sc,a,b,P(77,52),P(0,0),90,false));
    panels.Add(Part(original,sa,sb,sc,b,c,P(-57,36),P(0,0),73,false));
    panels.Add(Part(original,sa,sb,sc,a,d,P(57,-36),P(0,0),73,false));
    panels.Add(Part(original,sa,sb,sc,d,c,P(-77,-52),P(0,0),90,false));
   }
   for(int p=0;p<panels.Count;p++)panels[p].texture.Save(dir+"/panel_"+p+".png",ImageFormat.Png);
   var geometry=new System.Text.StringBuilder("[\n");
   for(int frame=0;frame<4;frame++)using(var dst=new Bitmap(512,512,PixelFormat.Format32bppArgb)){
    using(var g=Graphics.FromImage(dst)){
     g.InterpolationMode=InterpolationMode.HighQualityBicubic;g.PixelOffsetMode=PixelOffsetMode.HighQuality;g.DrawImageUnscaled(body,0,0);
     for(int order=0;order<panels.Count;order++){
      int p=cabinet?order:new int[]{0,3,1,2}[order];
      float angle=cabinet?(p==0?new float[]{0,24,62,110}[frame]:new float[]{0,32,68,100}[frame]):((p==0||p==3)?new float[]{0,0,55,155}[frame]:new float[]{0,65,130,155}[frame]);
      var corners=panels[p].Draw(g,angle);if(frame>0||p>0)geometry.Append(",\n");geometry.Append("{\"frame\":"+frame+",\"panel\":"+p+",\"angle\":"+angle+",\"corners\":[");for(int j=0;j<4;j++){if(j>0)geometry.Append(",");geometry.Append("["+corners[j].X.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+corners[j].Y.ToString(System.Globalization.CultureInfo.InvariantCulture)+"]");}geometry.Append("]}");
     }
    }dst.Save(dir+"/frames/frame_0"+frame+".png",ImageFormat.Png);
   }
   geometry.Append("\n]");File.WriteAllText(dir+"/geometry.json",geometry.ToString());foreach(var p in panels)p.texture.Dispose();
  }
 }
 public static void Contact(string root){using(var dst=new Bitmap(1024,512,PixelFormat.Format32bppArgb)){using(var g=Graphics.FromImage(dst)){g.Clear(Color.WhiteSmoke);string[] ids={"cardboard_box","kitchen_cabinet"};for(int row=0;row<2;row++)for(int f=0;f<4;f++)using(var src=new Bitmap(root+"/art/loot-points-v4/rigid-layers/"+ids[row]+"/frames/frame_0"+f+".png"))g.DrawImage(src,f*256,row*256,256,256);}dst.Save(root+"/docs/v4-rigid-contact.png",ImageFormat.Png);}}
 public static int Check(string root,string id){int count=0;string dir=root+"/art/loot-points-v4/rigid-layers/"+id+"/frames/";using(var mask=id=="cardboard_box"?Poly(P(175,337),P(305,426),P(305,457),P(175,364)):Poly(P(145,145),P(214,106),P(410,199),P(342,242)))using(var first=new Bitmap(dir+"frame_00.png")){
  for(int f=0;f<4;f++)using(var frame=new Bitmap(dir+"frame_0"+f+".png")){
   for(int y=0;y<512;y++)for(int x=0;x<512;x++){
    if((x<2||y<2||x>509||y>509)&&frame.GetPixel(x,y).A>16)throw new Exception(id+" clipping at border frame "+f);
    if(f>0&&mask.IsVisible(x+.5f,y+.5f)&&first.GetPixel(x,y).A>240){count++;if(first.GetPixel(x,y).ToArgb()!=frame.GetPixel(x,y).ToArgb())throw new Exception(id+" fixed body differs at "+x+","+y);}
   }
  }
 }if(count<1000)throw new Exception("Insufficient fixed surface coverage");Console.WriteLine(id+": "+count+" stationary pixels match; no frame-edge clipping");return count;}
}
'@
foreach($id in @('kitchen_cabinet','cardboard_box')){
 if(Test-Path "art/loot-points-v4/rigid-layers/$id/body-source.png"){[V4Rigid]::Prepare((Get-Location).Path,$id)}
 if(-not $PrepareOnly){[V4Rigid]::Build((Get-Location).Path,$id)}
}
if(-not $PrepareOnly){
 [V4Rigid]::Contact((Get-Location).Path)
 $checks=@();foreach($id in @('cardboard_box','kitchen_cabinet')){$count=[V4Rigid]::Check((Get-Location).Path,$id);$checks+=@{id=$id;fixedPixelComparisons=$count;frameSize=512;frames=4;method='one complete body and independent hinged panels'}}
 $checks|ConvertTo-Json|Set-Content docs/v4-rigid-checks.json -Encoding UTF8
}
if($Publish){
 foreach($id in @('kitchen_cabinet','cardboard_box')){
  $target="assets/animation/container/loot-points-v4/$id"
  $backup="art/loot-points-v4/rigid-layers/$id/before-rigid"
  if(-not(Test-Path $backup)){New-Item -ItemType Directory -Path $backup|Out-Null;Copy-Item "$target/frame_*.png" $backup}
  Copy-Item "art/loot-points-v4/rigid-layers/$id/frames/frame_*.png" $target -Force
 }
}
