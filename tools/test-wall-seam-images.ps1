$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;using System.Drawing;using System.Drawing.Imaging;
public static class WallSeamImages {
 static Color Pixel(Bitmap atlas,int mask,int x,int y){if(x<0||y<0||x>=256||y>=384)return Color.Transparent;return atlas.GetPixel(2+(mask%4)*260+x,2+(mask/4)*388+y);}
 public static int Overlaps(Bitmap atlas,int mask,int dx){int n=0;for(int y=0;y<384;y++)for(int x=0;x<256;x++)if(Pixel(atlas,mask,x,y).A==255&&Pixel(atlas,mask,x-dx,y-64).A==255)n++;return n;}
 public static void Draw(Graphics g,Bitmap atlas,int[] masks,int[] xs,int[] ys,int ox,int oy){using(var layer=new Bitmap(640,480)){using(var lg=Graphics.FromImage(layer)){for(int i=0;i<masks.Length;i++){int m=masks[i];using(var tile=atlas.Clone(new Rectangle(2+m%4*260,2+m/4*388,256,384),PixelFormat.Format32bppArgb)){var cm=new ColorMatrix();cm.Matrix33=.35f;using(var ia=new ImageAttributes()){ia.SetColorMatrix(cm);lg.DrawImage(tile,new Rectangle(ox+xs[i],oy+ys[i],256,384),0,0,256,384,GraphicsUnit.Pixel,ia);}}}}g.DrawImageUnscaled(layer,0,0);}}
 public static void Run(string oldPath,string newPath,string output){using(var old=new Bitmap(oldPath))using(var fresh=new Bitmap(newPath)){
  foreach(int m in new[]{5,10}){int dx=m==5?128:-128;int before=Overlaps(old,m,dx),after=Overlaps(fresh,m,dx);Console.WriteLine("mask "+m+": opaque pixel overlap "+before+" -> "+after);if(before==0||after!=before)throw new Exception("Complete connector caps not restored");}
  Console.WriteLine("PASS: original full cap pixels restored; runtime controls internal faces.");
 }}
}
'@
$zip=[IO.Compression.ZipFile]::OpenRead([IO.Path]::GetFullPath('archives/wall-seams-before-fix-20260921.zip'))
$temp=Join-Path ([IO.Path]::GetTempPath()) ('wall-seam-'+[guid]::NewGuid()+'.png')
try{
 # Backup entries follow brick, wood, concrete, plaster, stone source order.
 $entry=$zip.Entries|Where-Object {$_.Name -eq 'brick-wall-atlas.png'}|Select-Object -Last 1
 if(!$entry){throw 'Stone wall backup missing'}
 [IO.Compression.ZipFileExtensions]::ExtractToFile($entry,$temp)
 [WallSeamImages]::Run($temp,[IO.Path]::GetFullPath('assets/tileset/buildings/walls/stone/brick-wall-atlas.png'),[IO.Path]::GetFullPath('docs/wall-seams-comparison.png'))
}finally{$zip.Dispose();if(Test-Path -LiteralPath $temp){Remove-Item -LiteralPath $temp}}

node tools/test-wall-caps.cjs
if($LASTEXITCODE -ne 0){throw "Runtime cap regression failed"}
