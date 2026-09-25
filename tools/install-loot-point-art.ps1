param([string]$Manifest='docs/loot-points-art-manifest.json',[string]$Pack='loot-points-v1')
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System; using System.Drawing; using System.Drawing.Imaging; using System.Drawing.Drawing2D;
public static class LootFrames {
 public static void Split(string path,string target,bool alignTop) {
  using(var sheet=new Bitmap(path)) {
   int cw=sheet.Width/2,ch=sheet.Height/2; var frames=new Bitmap[4];var bounds=new Rectangle[4];double scale=1;
   for(int i=0;i<4;i++) {
    frames[i]=sheet.Clone(new Rectangle(i%2*cw,i/2*ch,cw,ch),PixelFormat.Format32bppArgb);
    int l=cw,t=ch,r=0,b=0,empty=0;
    for(int y=0;y<ch;y++)for(int x=0;x<cw;x++){int a=frames[i].GetPixel(x,y).A;if(a==0)empty++;if(a>16){l=Math.Min(l,x);r=Math.Max(r,x);t=Math.Min(t,y);b=Math.Max(b,y);}}
    if(empty<cw*ch/10)throw new Exception("Missing transparent alpha: "+path);
    bounds[i]=Rectangle.FromLTRB(l,t,r+1,b+1);
    scale=Math.Min(scale,Math.Min(440.0/bounds[i].Width,440.0/bounds[i].Height));
   }
   for(int i=0;i<4;i++)using(var dst=new Bitmap(512,512,PixelFormat.Format32bppArgb)) {
    var b=bounds[i];float dx=(float)(476-b.Right*scale),dy=(float)(alignTop?36-b.Top*scale:476-b.Bottom*scale);
    using(var g=Graphics.FromImage(dst)){g.Clear(Color.Transparent);g.InterpolationMode=InterpolationMode.HighQualityBicubic;g.PixelOffsetMode=PixelOffsetMode.HighQuality;g.DrawImage(frames[i],dx,dy,(float)(cw*scale),(float)(ch*scale));}
    dst.Save(System.IO.Path.Combine(target,"frame_0"+i+".png"),ImageFormat.Png);frames[i].Dispose();
   }
  }
 }
}
'@
$records=(Get-Content $Manifest -Raw -Encoding UTF8|ConvertFrom-Json).items
foreach($item in $records){
 if(Test-Path "art/$Pack/rigid-layers/$($item.id)/body.png"){throw 'This item uses rigid layered animation. Rebuild with tools/build-v4-rigid-animation.ps1 -Publish; do not replace with independently generated frames.'}
 if(Test-Path "art/loot-frame-stabilization-before/$Pack/$($item.id)"){throw 'This pack has registered animation frames. Use tools/stabilize-loot-frames.ps1 to rebuild from the preserved originals instead of overwriting the corrections.'}
 $source="art/$Pack/source/$($item.id).png"
 $target="assets/animation/container/$Pack/$($item.id)"
 New-Item -ItemType Directory -Force -Path (Split-Path $source),$target|Out-Null
 Copy-Item -LiteralPath $item.source -Destination $source
 [LootFrames]::Split((Join-Path (Get-Location) $source),(Join-Path (Get-Location) $target),($item.id -in @('cash_register','refrigerator')))
 Write-Output "$($item.id): four transparent 512x512 frames"
}
