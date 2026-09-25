$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;using System.Drawing;using System.Drawing.Imaging;using System.Drawing.Drawing2D;using System.Runtime.InteropServices;using System.Collections.Generic;
public class LootRegistration {
 static Rectangle movingBounds;
 public static void Clean(string source,string target){using(var bitmap=new Bitmap(source)){var p=Read(bitmap);var labels=new int[512*512];var queue=new int[labels.Length];int label=0,biggest=0,bigSize=0;for(int n=0;n<labels.Length;n++){if(labels[n]!=0||p[n*4+3]<=8)continue;label++;int start=0,end=1;queue[0]=n;labels[n]=label;while(start<end){int at=queue[start++],x=at%512,y=at/512;for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++){int xx=x+dx,yy=y+dy;if(xx<0||xx>=512||yy<0||yy>=512)continue;int next=yy*512+xx;if(labels[next]==0&&p[next*4+3]>8){labels[next]=label;queue[end++]=next;}}}if(end>bigSize){bigSize=end;biggest=label;}}
 for(int n=0;n<labels.Length;n++){if(labels[n]==biggest)continue;bool fringe=false;if(labels[n]==0){int x=n%512,y=n/512;for(int yy=Math.Max(0,y-2);yy<=Math.Min(511,y+2);yy++)for(int xx=Math.Max(0,x-2);xx<=Math.Min(511,x+2);xx++)if(labels[yy*512+xx]==biggest)fringe=true;}if(!fringe)p[n*4+3]=0;}
 var d=bitmap.LockBits(new Rectangle(0,0,512,512),ImageLockMode.WriteOnly,PixelFormat.Format32bppArgb);Marshal.Copy(p,0,d.Scan0,p.Length);bitmap.UnlockBits(d);bitmap.Save(target,ImageFormat.Png);}}
 static byte[] Read(Bitmap b){var d=b.LockBits(new Rectangle(0,0,512,512),ImageLockMode.ReadOnly,PixelFormat.Format32bppArgb);var p=new byte[512*512*4];Marshal.Copy(d.Scan0,p,0,p.Length);b.UnlockBits(d);return p;}
 static Rectangle Bounds(byte[] p){int l=512,t=512,r=0,b=0;for(int y=0;y<512;y++)for(int x=0;x<512;x++)if(p[(y*512+x)*4+3]>32){l=Math.Min(l,x);r=Math.Max(r,x);t=Math.Min(t,y);b=Math.Max(b,y);}return Rectangle.FromLTRB(l,t,r+1,b+1);}
 static double Loss(byte[] a,byte[] b,List<int> samples,double s,double dx,double dy){if(256+dx+(movingBounds.Left-256)*s<2||256+dy+(movingBounds.Top-256)*s<2||256+dx+(movingBounds.Right-256)*s>510||256+dy+(movingBounds.Bottom-256)*s>510)return 1e9;double error=0;foreach(int pos in samples){int x=pos%512,y=pos/512,sx=(int)Math.Round((x-256-dx)/s+256),sy=(int)Math.Round((y-256-dy)/s+256);if(sx<0||sx>=512||sy<0||sy>=512){error+=140;continue;}int ai=pos*4,bi=(sy*512+sx)*4;double aa=a[ai+3]/255.0,ba=b[bi+3]/255.0;double d=Math.Abs(aa-ba)*110;for(int c=0;c<3;c++)d+=Math.Min(60,Math.Abs(a[ai+c]*aa-b[bi+c]*ba))/3.0;error+=d;}return error/samples.Count;}
 public static string Fix(string reference,string source,string target,string mode){using(var ra=new Bitmap(reference))using(var rb=new Bitmap(source)){
  var a=Read(ra);var b=Read(rb);movingBounds=Bounds(b);var box=Bounds(a);var samples=new List<int>();
  for(int y=Math.Max(0,box.Top-8);y<Math.Min(512,box.Bottom+8);y+=3)for(int x=Math.Max(0,box.Left-8);x<Math.Min(512,box.Right+8);x+=3){double u=(x-box.Left)/(double)box.Width,v=(y-box.Top)/(double)box.Height;bool use=mode=="right"?u>.72:mode=="top"?v<.45:mode=="jacket"?v<.45||u>.82:v>.65;if(use)samples.Add(y*512+x);}
  double bs=1,bx=0,by=0,best=Loss(a,b,samples,1,0,0),before=best;
  // Global coarse search prevents a small local feature from capturing registration.
  for(double s=.88;s<=1.121;s+=.04)for(int dx=-32;dx<=32;dx+=8)for(int dy=-32;dy<=32;dy+=8){double e=Loss(a,b,samples,s,dx,dy);if(e<best){best=e;bs=s;bx=dx;by=dy;}}
  foreach(double step in new double[]{4,2,1,.5}){for(int iter=0;iter<5;iter++){double os=bs,ox=bx,oy=by;for(int ds=-1;ds<=1;ds++)for(int dx=-1;dx<=1;dx++)for(int dy=-1;dy<=1;dy++){double s=os+ds*step*.003,x=ox+dx*step,y=oy+dy*step;if(s<.85||s>1.15)continue;double e=Loss(a,b,samples,s,x,y);if(e<best){best=e;bs=s;bx=x;by=y;}}if(os==bs&&ox==bx&&oy==by)break;}}
  var moving=Bounds(b);double left=256+bx+(moving.Left-256)*bs,top=256+by+(moving.Top-256)*bs,right=256+bx+(moving.Right-256)*bs,bottom=256+by+(moving.Bottom-256)*bs;
  if(left<1||top<1||right>511||bottom>511)throw new Exception("Transform clips frame: "+source);
  using(var dst=new Bitmap(512,512,PixelFormat.Format32bppArgb)){using(var g=Graphics.FromImage(dst)){g.Clear(Color.Transparent);g.InterpolationMode=InterpolationMode.HighQualityBicubic;g.PixelOffsetMode=PixelOffsetMode.HighQuality;g.DrawImage(rb,(float)(256+bx-256*bs),(float)(256+by-256*bs),(float)(512*bs),(float)(512*bs));}dst.Save(target,ImageFormat.Png);}
  return String.Format(System.Globalization.CultureInfo.InvariantCulture,"{{\"scale\":{0:F5},\"dx\":{1:F2},\"dy\":{2:F2},\"before\":{3:F4},\"after\":{4:F4},\"samples\":{5}}}",bs,bx,by,before,best,samples.Count);
 }}
}
'@
$backup='art/loot-frame-stabilization-before'
$report=@()
foreach($batch in 1..3){
 $items=(Get-Content "assets/config/loot-points-v$batch.json" -Raw -Encoding UTF8|ConvertFrom-Json).items
 foreach($item in $items){
  if((Test-Path "art/container-fixed-layers/$($item.id)/body.png") -or (Test-Path "art/container-fixed-layers/$($item.id)/body_reference.png")){Write-Output "$($item.id): retained fixed-body frames; rebuild with lock-container-bodies.ps1";continue}
  if($item.id -eq 'weapon_crate' -and (Test-Path 'art/weapon-crate-before-fixed-body')){Write-Output 'weapon_crate: retained immutable-body animation; rebuild with lock-weapon-crate-body.ps1';continue}
  $dir="assets/animation/container/loot-points-v$batch/$($item.id)"
  $saved="$backup/loot-points-v$batch/$($item.id)"
  if(-not(Test-Path $saved)){New-Item -ItemType Directory -Force $saved|Out-Null;Copy-Item "$dir/frame_*.png" $saved}
  $clean=".tmp/loot-registration-cleaned/loot-points-v$batch/$($item.id)"
  New-Item -ItemType Directory -Force $clean|Out-Null
  foreach($frame in 0..3){[LootRegistration]::Clean((Join-Path (Get-Location) "$saved/frame_0$frame.png"),(Join-Path (Get-Location) "$clean/frame_0$frame.png"))}
  Copy-Item "$clean/frame_00.png" "$dir/frame_00.png" -Force
  $mode=if($item.id -in @('safe','wardrobe','refrigerator','filing_cabinet','weapon_locker','medical_cabinet','computer_tower')){'right'}elseif($item.id -eq 'cash_register'){'top'}elseif($item.id -eq 'hanging_jacket'){'jacket'}else{'bottom'}
  foreach($frame in 1..3){
   $result=[LootRegistration]::Fix((Join-Path (Get-Location) "$clean/frame_00.png"),(Join-Path (Get-Location) "$clean/frame_0$frame.png"),(Join-Path (Get-Location) "$dir/frame_0$frame.png"),$mode)|ConvertFrom-Json
   $report+=@{id=$item.id;batch=$batch;frame=$frame;mode=$mode;transform=$result}
  }
  Write-Output "$($item.id): registered three moving frames to stationary body"
 }
}
$report|ConvertTo-Json -Depth 6|Set-Content docs/loot-frame-registration.json -Encoding UTF8
