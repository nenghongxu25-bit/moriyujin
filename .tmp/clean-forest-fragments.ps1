$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System; using System.Drawing;
public class ForestClean {
 public static int Clean(string source,string target,int[] keep,int[][] erase) {
 using(var b=new Bitmap(source)) {
 int count=0;
 for(int y=0;y<b.Height;y++)for(int x=0;x<b.Width;x++){
 bool clear=x<keep[0]||y<keep[1]||x>keep[2]||y>keep[3];
 foreach(var r in erase)if(x>=r[0]&&y>=r[1]&&x<=r[2]&&y<=r[3])clear=true;
 if(clear&&b.GetPixel(x,y).ToArgb()!=0){b.SetPixel(x,y,Color.FromArgb(0,0,0,0));count++;}
 }
 b.Save(target,System.Drawing.Imaging.ImageFormat.Png); return count;
 }
 }
 public static string Verify(string source,string target,int[] keep,int[][] erase){
 using(var a=new Bitmap(source))using(var b=new Bitmap(target)){
 if(a.Size!=b.Size)throw new Exception("Dimensions changed");
 int changed=0;
 for(int y=0;y<a.Height;y++)for(int x=0;x<a.Width;x++){
 bool clear=x<keep[0]||y<keep[1]||x>keep[2]||y>keep[3];
 foreach(var r in erase)if(x>=r[0]&&y>=r[1]&&x<=r[2]&&y<=r[3])clear=true;
 if(!clear&&a.GetPixel(x,y).ToArgb()!=b.GetPixel(x,y).ToArgb())throw new Exception("Protected pixel changed");
 if(clear&&b.GetPixel(x,y).A!=0)throw new Exception("Fragment remains");
 if(a.GetPixel(x,y).ToArgb()!=b.GetPixel(x,y).ToArgb())changed++;
 }return a.Width+"x"+a.Height+"; changed="+changed+"; protected changes=0";
 }
 }
}
'@
$root = Split-Path $PSScriptRoot -Parent
$folder = Join-Path $root 'assets/decorate/forest'
$backup = (Get-ChildItem (Join-Path $root 'art-library/backups') -Directory -Filter 'forest-fragment-cleanup-*' | Sort-Object Name -Descending | Select-Object -First 1).FullName
if(-not $backup){throw 'Expected existing backup directory'}
# Manually reviewed subject bounding boxes with a 16px protective margin.
# Explicit rectangles handle neighboring objects inside the same bounding box.
$plans = @(
 @{n='cabin';k=@(0,0,595,590)},
 @{n='military-tent';k=@(4,46,620,568)},
 @{n='rusty-pickup';k=@(23,5,676,349);e=@(@(620,0,679,20))},
 @{n='log-pile';k=@(52,14,576,350)},
 @{n='campfire';k=@(0,29,300,328)},
 @{n='wood-bridge';k=@(10,24,645,350)},
 @{n='bunker-entrance';k=@(0,0,559,372);e=@(@(330,0,520,14),@(0,337,62,372))},
 @{n='military-checkpoint';k=@(0,0,649,284);e=@(@(410,0,440,10))},
 @{n='fallen-log';k=@(137,52,1468,976)},
 @{n='fuel-barrel';k=@(288,78,967,1187)},
 @{n='generator';k=@(220,4,1321,1017)},
 @{n='outhouse';k=@(319,66,994,1195)},
 @{n='pine-tree';k=@(72,0,959,1519)},
 @{n='shrub';k=@(126,115,1184,1058)},
 @{n='wood-fence';k=@(141,175,1439,863)}
)
foreach($p in $plans){
 $name = 'forest-' + $p.n + '-v1.png'
 $source = Join-Path $folder $name
 $saved = Join-Path $backup $name
 if(-not (Test-Path -LiteralPath $saved)){Copy-Item -LiteralPath $source -Destination $saved}
 $meta = $source + '.meta'
 $metaHash = if(Test-Path -LiteralPath $meta){ (Get-FileHash -LiteralPath $meta).Hash }else{''}
 if($metaHash){Copy-Item -LiteralPath $meta -Destination ($saved+'.meta')}
 $staging = Join-Path $backup ('cleaned-'+$name)
 [int[][]]$erase = @()
 if($p.ContainsKey('e')){
  if($p.e[0] -is [Array]){$erase = $p.e}else{$erase = ,([int[]]$p.e)}
 }
 $count = [ForestClean]::Clean($saved,$staging,[int[]]$p.k,$erase)
 $verification = [ForestClean]::Verify($saved,$staging,[int[]]$p.k,$erase)
 if($count -gt 0){ Copy-Item -LiteralPath $staging -Destination $source }
 if($metaHash -and (Get-FileHash -LiteralPath $meta).Hash -ne $metaHash){throw 'Metadata changed'}
 "$name : removed=$count; $verification"
}
"Backup: $backup"
