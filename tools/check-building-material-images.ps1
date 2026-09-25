$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;using System.Drawing;using System.Drawing.Imaging;using System.Runtime.InteropServices;
public static class MaterialAlphaCheck {
 static byte[] Alpha(string p){using(var b=new Bitmap(p)){var d=b.LockBits(new Rectangle(0,0,b.Width,b.Height),ImageLockMode.ReadOnly,PixelFormat.Format32bppArgb);var all=new byte[d.Stride*b.Height];Marshal.Copy(d.Scan0,all,0,all.Length);b.UnlockBits(d);var a=new byte[b.Width*b.Height];for(int i=0;i<a.Length;i++)a[i]=all[i*4+3];return a;}}
 public static void Same(string a,string b){var x=Alpha(a);var y=Alpha(b);if(x.Length!=y.Length)throw new Exception("size mismatch: "+b);for(int i=0;i<x.Length;i++)if(x[i]!=y[i])throw new Exception("alpha mismatch: "+b+" pixel "+i);}
}
'@
$root='assets/tileset/buildings'
foreach($id in @('wood','concrete','plaster','stone')){
 [MaterialAlphaCheck]::Same('assets/tileset/buildings/walls/brick/brick-wall-atlas.png',"$root/walls/$id/brick-wall-atlas.png")
 foreach($axis in 0,1){[MaterialAlphaCheck]::Same("assets/tileset/buildings/walls/brick/brick-gable-$axis.png","$root/walls/$id/brick-gable-$axis.png")}
}
foreach($id in @('terracotta','metal')){foreach($axis in 0,1){[MaterialAlphaCheck]::Same("assets/tileset/buildings/roofs/slate/slate-roof-$axis.png","$root/roofs/$id/slate-roof-$axis.png")}}
Write-Output 'PASS: all 16 generated wall/gable/roof atlases have pixel-identical alpha silhouettes to accepted originals.'
$sheet=[Drawing.Bitmap]::new(1100,880)
$g=[Drawing.Graphics]::FromImage($sheet)
$g.Clear([Drawing.Color]::FromArgb(43,48,51))
$font=[Drawing.Font]::new('Microsoft YaHei',15)
$ids=@('wood','concrete','plaster','stone')
$labels=@('旧木板墙','旧水泥墙','旧白粉墙','灰石墙')
for($i=0;$i -lt 4;$i++){
 $src=[Drawing.Bitmap]::new([IO.Path]::GetFullPath("$root/walls/$($ids[$i])/brick-wall-atlas.png"))
 $x=$i*275
 $g.DrawImage($src,[Drawing.Rectangle]::new($x+9,24,256,384),[Drawing.Rectangle]::new(2+3*260,2,256,384),[Drawing.GraphicsUnit]::Pixel)
 $g.DrawString($labels[$i],$font,[Drawing.Brushes]::White,$x+50,400)
 $src.Dispose()
}
$floor=[Drawing.Bitmap]::new([IO.Path]::GetFullPath("$root/floors/indoor-floor-atlas.png"))
for($i=0;$i -lt 3;$i++){
 $g.DrawImage($floor,[Drawing.Rectangle]::new(45+$i*360,460,256,128),[Drawing.Rectangle]::new(4+$i*264,4,256,128),[Drawing.GraphicsUnit]::Pixel)
 $g.DrawString(@('木板地板','水泥地板','石板地板')[$i],$font,[Drawing.Brushes]::White,90+$i*360,595)
}
$floor.Dispose()
for($i=0;$i -lt 2;$i++){
 $id=@('terracotta','metal')[$i]
 $src=[Drawing.Bitmap]::new([IO.Path]::GetFullPath("$root/roofs/$id/slate-roof-0.png"))
 for($row=6;$row -ge 0;$row--){
  $x=90+$i*550+(6-$row)*32; $y=555+$row*16
  $g.DrawImage($src,[Drawing.Rectangle]::new($x,$y,160,320),[Drawing.Rectangle]::new(2+$row*324,2,320,640),[Drawing.GraphicsUnit]::Pixel)
 }
 $g.DrawString(@('旧红瓦屋顶','锈蚀金属屋顶')[$i],$font,[Drawing.Brushes]::White,145+$i*550,845)
 $src.Dispose()
}
$sheet.Save([IO.Path]::GetFullPath('docs/building-materials-preview.png'),[Drawing.Imaging.ImageFormat]::Png)
$font.Dispose();$g.Dispose();$sheet.Dispose()
