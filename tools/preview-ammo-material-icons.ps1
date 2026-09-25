Add-Type -AssemblyName System.Drawing
$items=Get-Content art/ammo-materials-v1/sources.json -Raw -Encoding UTF8 | ConvertFrom-Json
$sheet=New-Object Drawing.Bitmap(960,960)
$g=[Drawing.Graphics]::FromImage($sheet)
$g.Clear([Drawing.Color]::FromArgb(35,38,42))
$font=New-Object Drawing.Font('Arial',11)
$i=0
foreach($item in $items){
 $x=($i%4)*240;$y=[Math]::Floor($i/4)*480
 $img=New-Object Drawing.Bitmap((Join-Path (Get-Location) ('assets/atlas/picture/items/ammo-materials-v1/'+$item.id+'.png')))
 $g.DrawString($item.id,$font,[Drawing.Brushes]::White,$x+8,$y+8)
 for($bg=0;$bg -lt 3;$bg++){
  $top=$y+34+$bg*140
  if($bg -eq 1){$g.FillRectangle([Drawing.Brushes]::WhiteSmoke,$x+4,$top,232,136)}
  if($bg -eq 2){for($cy=0;$cy -lt 136;$cy+=16){for($cx=0;$cx -lt 232;$cx+=16){$b=if((($cx/16+$cy/16)%2) -eq 0){[Drawing.Brushes]::Gray}else{[Drawing.Brushes]::LightGray};$g.FillRectangle($b,$x+4+$cx,$top+$cy,[Math]::Min(16,232-$cx),[Math]::Min(16,136-$cy))}}}
  $w=if($item.gridWidth -eq 2){180}else{128};$h=if($item.gridWidth -eq 2){90}else{128}
  $g.DrawImage($img,[int]($x+8),[int]($top+4),[int]$w,[int]$h)
  if($item.gridWidth -eq 1){$g.DrawImage($img,[int]($x+168),[int]($top+40),64,64)}
 }
 $img.Dispose();$i++
}
$sheet.Save((Join-Path (Get-Location) 'art/ammo-materials-v1/preview.png'),[Drawing.Imaging.ImageFormat]::Png)
$font.Dispose();$g.Dispose();$sheet.Dispose()
