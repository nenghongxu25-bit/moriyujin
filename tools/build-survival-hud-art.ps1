# Editable vector construction source; raster export only. Never edits existing artwork.
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
public static class SurvivalHudArt {
 static Color Ink=Color.FromArgb(239,235,215), Edge=Color.FromArgb(170,157,165,151), Fill=Color.FromArgb(205,30,42,39);
 static Graphics g; static Pen pen; static Brush ink;
 static void Line(params float[] p){for(int i=2;i<p.Length;i+=2)g.DrawLine(pen,p[i-2],p[i-1],p[i],p[i+1]);}
 static GraphicsPath Round(float x,float y,float w,float h,float r){var p=new GraphicsPath();p.AddArc(x,y,r,r,180,90);p.AddArc(x+w-r,y,r,r,270,90);p.AddArc(x+w-r,y+h-r,r,r,0,90);p.AddArc(x,y+h-r,r,r,90,90);p.CloseFigure();return p;}
 public static void Build(string dir){Directory.CreateDirectory(dir);
 foreach(string name in new[]{"panel","slot","circle","ring","thumb","bag","make","crosshair","hand","search","chop","dig","talk","run","mode","avatar"}){
 using(var b=new Bitmap(256,256,PixelFormat.Format32bppArgb))using(g=Graphics.FromImage(b))using(pen=new Pen(Ink,5))using(ink=new SolidBrush(Ink)){
 g.SmoothingMode=SmoothingMode.AntiAlias;g.ScaleTransform(2,2);pen.StartCap=pen.EndCap=LineCap.Round;pen.LineJoin=LineJoin.Round;
 bool bare=name=="crosshair"||name=="avatar";
 bool circle=name=="circle"||name=="ring"||name=="thumb"||name=="hand"||name=="search"||name=="chop"||name=="dig"||name=="talk"||name=="run";
 using(var fill=new SolidBrush(name=="thumb"?Color.FromArgb(220,167,173,151):Fill))using(var edge=new Pen(Edge,1.7f)){
 if(!bare){if(circle){if(name!="ring")g.FillEllipse(fill,3,3,122,122);g.DrawEllipse(edge,3,3,122,122);}else using(var path=Round(3,3,122,122,14)){g.FillPath(fill,path);g.DrawPath(edge,path);}}
 }
 switch(name){
 case "bag": using(var p=Round(39,39,50,53,9)){g.DrawPath(pen,p);}Line(52,37,52,28,75,28,75,37);Line(40,56,87,56);Line(51,54,51,65);Line(76,54,76,65);Line(48,78,80,78);break;
 case "make": Line(39,91,87,39);Line(34,41,83,91);Line(31,42,43,30,58,43,46,56,31,42);Line(78,31,77,44,89,49,98,38);break;
 case "crosshair":g.DrawEllipse(pen,29,29,70,70);Line(64,15,64,40);Line(64,88,64,113);Line(15,64,40,64);Line(88,64,113,64);g.FillEllipse(ink,59,59,10,10);break;
 case "hand":Line(46,66,46,35,53,35,53,64);Line(54,61,54,27,62,27,62,60);Line(63,60,63,30,71,30,71,63);Line(72,64,72,39,80,39,80,76,74,92,53,94,33,74,34,64,46,72);break;
 case "search":g.DrawEllipse(pen,32,29,48,48);Line(76,73,96,96);break;
 case "chop":Line(39,96,79,31);Line(70,31,95,44,87,62,61,48);break;
 case "dig":Line(76,27,88,34,80,48,68,41,76,27);Line(75,45,52,80);Line(43,68,65,82,47,99,35,93,43,68);break;
 case "talk":using(var p=Round(28,32,72,48,14)){g.DrawPath(pen,p);}Line(44,81,40,96,59,81);g.FillEllipse(ink,43,53,5,5);g.FillEllipse(ink,62,53,5,5);g.FillEllipse(ink,80,53,5,5);break;
 case "run":g.FillEllipse(ink,71,25,15,15);Line(43,55,62,45,78,65,94,65);Line(64,49,53,72,73,79,77,99);Line(54,73,42,92,25,92);Line(24,49,36,49);Line(20,61,32,61);break;
 case "mode":for(int x=39;x<=87;x+=24){Line(x,83,x,45,x+5,34,x+10,45,x+10,83,x,83);}break;
 case "avatar":g.FillEllipse(ink,44,25,40,40);g.FillEllipse(ink,26,73,76,44);break;
 }
 b.Save(Path.Combine(dir,name+".png"),ImageFormat.Png);
 }
 }
 }
}
'@
[SurvivalHudArt]::Build((Join-Path $PSScriptRoot '../assets/ui/survival-hud'))
