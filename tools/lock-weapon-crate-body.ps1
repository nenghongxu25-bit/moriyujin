$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;using System.Drawing;using System.Drawing.Drawing2D;using System.Drawing.Imaging;
public static class FixedWeaponCrate {
 static PointF P(float x,float y){return new PointF(x,y);}
 static GraphicsPath Poly(PointF[] points){var p=new GraphicsPath();p.AddPolygon(points);return p;}
 static Bitmap Cut(Bitmap source,PointF[] points){var result=new Bitmap(512,512,PixelFormat.Format32bppArgb);using(var g=Graphics.FromImage(result))using(var p=Poly(points)){g.SetClip(p);g.DrawImageUnscaled(source,0,0);}return result;}
 static Matrix Map(PointF a,PointF b,PointF c,PointF u,PointF v,PointF w){float x1=b.X-a.X,y1=b.Y-a.Y,x2=c.X-a.X,y2=c.Y-a.Y,det=x1*y2-x2*y1;float ux=v.X-u.X,uy=v.Y-u.Y,vx=w.X-u.X,vy=w.Y-u.Y;float m11=(ux*y2-vx*y1)/det,m21=(vx*x1-ux*x2)/det,m12=(uy*y2-vy*y1)/det,m22=(vy*x1-uy*x2)/det;return new Matrix(m11,m12,m21,m22,u.X-m11*a.X-m21*a.Y,u.Y-m12*a.X-m22*a.Y);}
 public static void Build(string input,string output){using(var closed=new Bitmap(input+"/frame_00.png"))using(var opened=new Bitmap(input+"/frame_03.png")){
  var bodyPoly=new[]{P(40,245),P(132,191),P(480,335),P(482,411),P(381,482),P(39,312)};
  var frontPoly=new[]{P(39,245),P(382,386),P(480,337),P(482,411),P(381,482),P(39,312)};
  using(var body=Cut(opened,bodyPoly))using(var front=Cut(opened,frontPoly))
  using(var outside=Cut(closed,new[]{P(132,177),P(479,321),P(480,350),P(383,399),P(40,254),P(40,233)}))
  using(var inside=Cut(opened,new[]{P(124,58),P(478,201),P(484,335),P(128,198)})){
   body.Save(output+"/fixed_body.png",ImageFormat.Png);
   double[] angles={0,18,58,90};
   for(int i=0;i<4;i++)using(var frame=new Bitmap(512,512,PixelFormat.Format32bppArgb)){
    using(var g=Graphics.FromImage(frame)){
     g.InterpolationMode=InterpolationMode.HighQualityBicubic;g.PixelOffsetMode=PixelOffsetMode.HighQuality;
     g.DrawImageUnscaled(body,0,0);double radians=angles[i]*Math.PI/180;
     var h=P(132,195);var hr=P(474,337);var moving=P((float)(132-89*Math.Cos(radians)),(float)(195+49*Math.Cos(radians)-130*Math.Sin(radians)));
     using(var transform=i<2?Map(P(132,187),P(474,329),P(43,245),h,hr,moving):Map(P(132,195),P(474,337),P(132,65),h,hr,moving)){
      g.Transform=transform;g.DrawImageUnscaled(i<2?outside:inside,0,0);g.ResetTransform();
     }
     // Same pixels in every frame: front/right faces and lower body never animate.
     using(var clip=Poly(frontPoly)){g.SetClip(clip);g.CompositingMode=CompositingMode.SourceCopy;g.DrawImageUnscaled(front,0,0);g.ResetClip();}
    }
    frame.Save(output+"/frame_0"+i+".png",ImageFormat.Png);
   }
   int checkedPixels=0;
   using(var first=new Bitmap(output+"/frame_00.png"))for(int i=1;i<4;i++)using(var next=new Bitmap(output+"/frame_0"+i+".png")){
    for(int x=60;x<360;x++)for(int y=(int)(245+(x-39)*141.0/343)+8;y<(int)(312+(x-39)*170.0/342)-8;y++){
     if(front.GetPixel(x,y).A<250)continue;
     if(first.GetPixel(x,y).ToArgb()!=next.GetPixel(x,y).ToArgb())throw new Exception("Fixed body pixel changed between frames");checkedPixels++;
    }
   }
   Console.WriteLine("PASS: "+checkedPixels+" stationary face pixel comparisons identical across four frames.");
  }
 }}
}
'@
$dir='assets/animation/container/loot-points-v1/weapon_crate'
$backup='art/weapon-crate-before-fixed-body'
if(-not(Test-Path $backup)){New-Item -ItemType Directory -Force $backup|Out-Null;Copy-Item "$dir/frame_*.png" $backup}
[FixedWeaponCrate]::Build((Join-Path (Get-Location) $backup),(Join-Path (Get-Location) $dir))
Write-Output 'Built four opening frames with one immutable body and a fixed lid hinge.'
