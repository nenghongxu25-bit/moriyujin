param([switch]$LibraryOnly)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System; using System.Drawing; using System.Drawing.Drawing2D; using System.Drawing.Imaging;
public class ForestResize {
 public static string Resize(string input,string output,int limit){
 using(var src=new Bitmap(input)){
 double scale=Math.Min(1.0,(double)limit/Math.Max(src.Width,src.Height));
 float dw=(float)(src.Width*scale),dh=(float)(src.Height*scale);
 int w=(int)Math.Ceiling(src.Width*scale-1e-9),h=(int)Math.Ceiling(src.Height*scale-1e-9);
 using(var dst=new Bitmap(w,h,PixelFormat.Format32bppArgb)){
 using(var g=Graphics.FromImage(dst))using(var attributes=new ImageAttributes()){
 g.Clear(Color.Transparent);g.CompositingMode=CompositingMode.SourceCopy;
 g.InterpolationMode=InterpolationMode.HighQualityBicubic;g.PixelOffsetMode=PixelOffsetMode.HighQuality;
 attributes.SetWrapMode(WrapMode.TileFlipXY);
 // Float destination uses exactly the SAME scale for both axes.
 // Ceil-sized canvas retains the subpixel remainder without clipping.
 PointF[] points={new PointF(0,0),new PointF(dw,0),new PointF(0,dh)};
 g.DrawImage(src,points,new RectangleF(0,0,src.Width,src.Height),GraphicsUnit.Pixel,attributes);
 }
 dst.Save(output,ImageFormat.Png);
 }
 using(var check=new Bitmap(output)){
 if(check.Width!=w||check.Height!=h)throw new Exception("Dimension mismatch");
 if(Math.Abs(w-src.Width*scale)>=1.00001||Math.Abs(h-src.Height*scale)>=1.00001)throw new Exception("Aspect validation failed");
 bool transparent=false,visible=false;
 for(int y=0;y<h;y++)for(int x=0;x<w;x++){byte a=check.GetPixel(x,y).A;if(a==0)transparent=true;if(a>0)visible=true;}
 if(!transparent||!visible)throw new Exception("Alpha validation failed");
 }
 return src.Width+"x"+src.Height+" -> "+w+"x"+h+"; uniform scale="+scale.ToString("F8")+"; alpha=OK";
 }
 }
}
'@
if($LibraryOnly){return}
$root=Split-Path $PSScriptRoot -Parent
$assets=Join-Path $root 'assets/decorate/forest'
$backup=Join-Path $root 'art-library/backups/forest-before-resize-20260919'
if(Test-Path -LiteralPath $backup){throw 'Backup exists; refusing to resize twice.'}
New-Item -ItemType Directory -Path $backup | Out-Null
$staging=Join-Path $backup 'resized'
New-Item -ItemType Directory -Path $staging | Out-Null
$limits=[ordered]@{
 'abandoned-house'=512; 'bunker-entrance'=512; 'cabin'=512;
 'campfire'=128; 'fallen-log'=256; 'fuel-barrel'=128; 'generator'=128;
 'log-pile'=256; 'military-checkpoint'=512; 'military-tent'=512;
 'outhouse'=256; 'pine-tree'=320; 'rocky-lookout'=512;
 'rusty-pickup'=384; 'sawmill'=512; 'shrub'=192;
 'watchtower'=512; 'wood-bridge'=384; 'wood-fence'=256
}
$rows=@()
foreach($entry in $limits.GetEnumerator()){
 $name='forest-'+$entry.Key+'-v1.png'
 $source=Join-Path $assets $name
 Copy-Item -LiteralPath $source -Destination (Join-Path $backup $name)
 Copy-Item -LiteralPath ($source+'.meta') -Destination (Join-Path $backup ($name+'.meta'))
 $result=[ForestResize]::Resize($source,(Join-Path $staging $name),$entry.Value)
 Write-Output "$name : $result"
 $rows+=@{file=$name;longEdge=$entry.Value;verification=$result;originalSha256=(Get-FileHash -LiteralPath $source).Hash}
}
# All files passed validation before replacing any active resource.
foreach($entry in $limits.GetEnumerator()){
 $name='forest-'+$entry.Key+'-v1.png'
 $target=Join-Path $assets $name
 Copy-Item -LiteralPath (Join-Path $staging $name) -Destination $target
 if((Get-FileHash -LiteralPath ($target+'.meta')).Hash -ne (Get-FileHash -LiteralPath (Join-Path $backup ($name+'.meta'))).Hash){throw 'Metadata changed'}
 if((Get-FileHash -LiteralPath $target).Hash -ne (Get-FileHash -LiteralPath (Join-Path $staging $name)).Hash){throw 'Copy verification failed'}
}
Write-Output ('Original bytes: '+((Get-ChildItem $backup -Filter '*.png' | Measure-Object Length -Sum).Sum))
Write-Output ('Resized bytes: '+((Get-ChildItem $assets -Filter '*.png' | Measure-Object Length -Sum).Sum))
Write-Output "Backup: $backup"
