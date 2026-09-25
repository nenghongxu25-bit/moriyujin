$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'resize-forest-assets.ps1') -LibraryOnly
$root=Split-Path $PSScriptRoot -Parent
$manifest=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'forest-new-generation.json') | ConvertFrom-Json
$hd=Join-Path $root 'art-library/images/decorate/forest-new-preview-hd'
$preview=Join-Path $root 'assets/decorate/forest/new-preview'
New-Item -ItemType Directory -Path $hd -Force | Out-Null
foreach($asset in $manifest.assets){
 $filename='forest-'+$asset.name+'-v1.png'
 $saved=Join-Path $hd $filename
 $target=Join-Path $preview $filename
 if((Test-Path -LiteralPath $saved) -or (Test-Path -LiteralPath $target)){throw "Output exists: $filename"}
 Copy-Item -LiteralPath $asset.source -Destination $saved
 $limit=128
 if($asset.name -eq 'broken-planks'){$limit=256}
 $result=[ForestResize]::Resize($saved,$target,$limit)
 "$filename : $result"
}
