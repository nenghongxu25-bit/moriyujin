$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$root=Join-Path (Get-Location) 'assets/atlas/picture/items/extraction-loot-v1'
$manifest=Get-Content -LiteralPath (Join-Path $root 'manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$report=@()
foreach($item in $manifest.items){
 $path=Join-Path $root $item.file
 if(-not(Test-Path -LiteralPath $path)){throw "Missing icon: $path"}
 $bitmap=[Drawing.Bitmap]::FromFile($path)
 try {
  $transparent=0;$visible=0
  for($y=0;$y -lt $bitmap.Height;$y+=12){for($x=0;$x -lt $bitmap.Width;$x+=12){if($bitmap.GetPixel($x,$y).A -eq 0){$transparent++}else{$visible++}}}
  if($transparent -eq 0 -or $visible -eq 0){throw "Invalid alpha/content: $path"}
  $report+=@{id=$item.id;width=$bitmap.Width;height=$bitmap.Height;transparentSamples=$transparent;visibleSamples=$visible}
 } finally {$bitmap.Dispose()}
}
$report | ConvertTo-Json | Set-Content -LiteralPath (Join-Path (Get-Location) 'docs/extraction-loot-alpha-report.json') -Encoding UTF8
Write-Output ('PASS: '+$report.Count+' PNG files contain both transparent background and visible object pixels.')
