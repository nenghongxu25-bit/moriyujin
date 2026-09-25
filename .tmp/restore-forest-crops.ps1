$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System; using System.Drawing; using System.Collections.Generic;
public class RestoreForest {
 public static string Crop(string path,string output,int x0,int y0,int x1,int y1,string split){
 using(var b=new Bitmap(path)){
 int w=b.Width,h=b.Height;var seen=new bool[w*h];var best=new List<int>();
 for(int y=y0;y<=y1;y++)for(int x=x0;x<=x1;x++){
 int p=y*w+x;if(seen[p]||!Allowed(x,y,x0,y0,x1,y1,split)||b.GetPixel(x,y).A==0)continue;
 var q=new Queue<int>();var c=new List<int>();q.Enqueue(p);seen[p]=true;
 while(q.Count>0){int z=q.Dequeue();c.Add(z);int px=z%w,py=z/w;
 for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++){int nx=px+dx,ny=py+dy;if(!Allowed(nx,ny,x0,y0,x1,y1,split))continue;int n=ny*w+nx;if(!seen[n]&&b.GetPixel(nx,ny).A>0){seen[n]=true;q.Enqueue(n);}}
 }if(c.Count>best.Count)best=c;
 }
 int lx=w,ly=h,rx=0,ry=0;foreach(int p in best){lx=Math.Min(lx,p%w);rx=Math.Max(rx,p%w);ly=Math.Min(ly,p/w);ry=Math.Max(ry,p/w);}
 using(var result=new Bitmap(rx-lx+17,ry-ly+17,System.Drawing.Imaging.PixelFormat.Format32bppArgb)){
 foreach(int p in best)result.SetPixel(p%w-lx+8,p/w-ly+8,b.GetPixel(p%w,p/w));
 result.Save(output,System.Drawing.Imaging.ImageFormat.Png);
 using(var check=new Bitmap(output)){foreach(int p in best)if(check.GetPixel(p%w-lx+8,p/w-ly+8).ToArgb()!=b.GetPixel(p%w,p/w).ToArgb())throw new Exception("Pixel mismatch");}
 return "source bounds="+lx+","+ly+".."+rx+","+ry+"; output="+result.Width+"x"+result.Height+"; original pixels="+best.Count+"; 8px transparent margin; verified";
 }
 }
 }
 static bool Allowed(int x,int y,int x0,int y0,int x1,int y1,string split){
 if(x<x0||y<y0||x>x1||y>y1)return false;
 double boundary=728+Math.Max(0,x-240)*0.32;
 if(split=="tower")return y>boundary;
 if(split=="checkpoint"&&x<430)return y<=boundary;
 return true;
 }
}
'@
$root=Split-Path $PSScriptRoot -Parent
$assets=Join-Path $root 'assets/decorate/forest'
$backup=Join-Path $root 'art-library/backups/forest-crop-restoration-20260919'
New-Item -ItemType Directory -Path $backup -Force | Out-Null
$plans=@(
 @{n='campfire';sheet='environment';r=@(100,930,530,1240);s=''},
 @{n='sawmill';sheet='structures';r=@(0,0,715,475);s=''},
 @{n='military-checkpoint';sheet='structures';r=@(0,430,680,785);s='checkpoint'},
 @{n='watchtower';sheet='structures';r=@(60,720,420,1253);s='tower'},
 @{n='rocky-lookout';sheet='structures';r=@(450,780,1253,1253);s=''}
)
foreach($p in $plans){
 $name='forest-'+$p.n+'-v1.png'
 $target=Join-Path $assets $name
 $old=Join-Path $backup $name
 if(-not (Test-Path -LiteralPath $old)){
  Copy-Item -LiteralPath $target -Destination $old
  Copy-Item -LiteralPath ($target+'.meta') -Destination ($old+'.meta')
 }
 $staged=Join-Path $backup ('restored-'+$name)
 $sheet=Join-Path $assets ('forest-'+$p.sheet+'-kit-v1.png')
 $r=$p.r
 $result=[RestoreForest]::Crop($sheet,$staged,$r[0],$r[1],$r[2],$r[3],$p.s)
 "$name : $result"
}
"Staged in $backup; not applied yet."
