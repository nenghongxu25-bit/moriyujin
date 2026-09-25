$ErrorActionPreference = 'Stop'
# Extend the existing code-native HUD art family; no old bitmap is modified.
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;using System.IO;using System.Drawing;using System.Drawing.Drawing2D;using System.Drawing.Imaging;
public static class SurvivalPageArt {
 static GraphicsPath Round(int w,int h,int r){var p=new GraphicsPath();p.AddArc(2,2,r,r,180,90);p.AddArc(w-r-3,2,r,r,270,90);p.AddArc(w-r-3,h-r-3,r,r,0,90);p.AddArc(2,h-r-3,r,r,90,90);p.CloseFigure();return p;}
 public static void Build(string dir){Directory.CreateDirectory(dir);foreach(var name in new[]{"page","pane","button","accent","slot","close","tab"}){
 int w=name=="page"?1334:name=="pane"?512:name=="slot"||name=="close"?128:256;
 int h=name=="page"?750:name=="pane"?512:name=="slot"||name=="close"?128:96;
 using(var b=new Bitmap(w,h,PixelFormat.Format32bppArgb))using(var g=Graphics.FromImage(b)){
 g.SmoothingMode=SmoothingMode.AntiAlias;var top=Color.FromArgb(250,37,49,45);var bottom=Color.FromArgb(248,23,33,31);
 if(name=="button"||name=="tab"){top=Color.FromArgb(248,60,75,65);bottom=Color.FromArgb(248,41,56,48);}
 if(name=="accent"){top=Color.FromArgb(255,119,111,74);bottom=Color.FromArgb(255,87,84,57);}
 using(var p=Round(w,h,name=="page"?20:12))using(var brush=new LinearGradientBrush(new Rectangle(0,0,w,h),top,bottom,90))using(var pen=new Pen(Color.FromArgb(200,125,141,122),2)){g.FillPath(brush,p);g.DrawPath(pen,p);}
 if(name=="page")using(var p=new Pen(Color.FromArgb(125,129,149,128),1)){g.DrawLine(p,36,104,w-36,104);g.DrawLine(p,36,h-92,w-36,h-92);}
 if(name=="close")using(var p=new Pen(Color.FromArgb(238,233,217),6)){p.StartCap=p.EndCap=LineCap.Round;g.DrawLine(p,44,44,84,84);g.DrawLine(p,84,44,44,84);}
 b.Save(Path.Combine(dir,name+".png"),ImageFormat.Png);
 }} }
}
'@
[SurvivalPageArt]::Build((Join-Path $PSScriptRoot '../assets/ui/survival-pages'))
