param([string]$Manifest='art/ammo-materials-v1/sources.json')
Add-Type -AssemblyName System.Drawing
$items=Get-Content -LiteralPath $Manifest -Raw -Encoding UTF8 | ConvertFrom-Json
$dest=Join-Path (Get-Location) 'assets/atlas/picture/items/ammo-materials-v1'
[IO.Directory]::CreateDirectory($dest) | Out-Null
$report=@()
foreach($item in $items){
 $src=New-Object Drawing.Bitmap($item.source)
 $minX=$src.Width;$minY=$src.Height;$maxX=-1;$maxY=-1;$clear=0
 for($y=0;$y -lt $src.Height;$y++){for($x=0;$x -lt $src.Width;$x++){
  if($src.GetPixel($x,$y).A -gt 8){$minX=[Math]::Min($minX,$x);$minY=[Math]::Min($minY,$y);$maxX=[Math]::Max($maxX,$x);$maxY=[Math]::Max($maxY,$y)}else{$clear++}
 }}
 if($clear -eq 0 -or $maxX -lt 0){$src.Dispose();throw "Missing transparency/content: $($item.id)"}
 $w=[int]$item.gridWidth*256;$h=[int]$item.gridHeight*256
 $sw=$maxX-$minX+1;$sh=$maxY-$minY+1;$scale=[Math]::Min(($w-24)/$sw,($h-24)/$sh)
 $dw=[int]($sw*$scale);$dh=[int]($sh*$scale)
 $out=New-Object Drawing.Bitmap($w,$h,[Drawing.Imaging.PixelFormat]::Format32bppArgb)
 $g=[Drawing.Graphics]::FromImage($out);$g.Clear([Drawing.Color]::Transparent)
 $g.InterpolationMode=[Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
 $g.PixelOffsetMode=[Drawing.Drawing2D.PixelOffsetMode]::HighQuality
 $dr=New-Object Drawing.Rectangle([int](($w-$dw)/2),[int](($h-$dh)/2),$dw,$dh)
 $g.DrawImage($src,$dr,$minX,$minY,$sw,$sh,[Drawing.GraphicsUnit]::Pixel)
 $target=Join-Path $dest ($item.id+'.png');$out.Save($target,[Drawing.Imaging.ImageFormat]::Png)
 $g.Dispose();$out.Dispose();$src.Dispose()
 $report+=@{id=$item.id;width=$w;height=$h;transparentSourcePixels=$clear}
}
$report | ConvertTo-Json | Write-Output
