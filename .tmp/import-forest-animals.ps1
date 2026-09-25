$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'resize-forest-assets.ps1') -LibraryOnly
$root=Split-Path $PSScriptRoot -Parent
$manifest=Get-Content -Raw (Join-Path $PSScriptRoot 'forest-animal-generation.json') | ConvertFrom-Json
$hd=Join-Path $root 'art-library/images/decorate/forest-new-preview-hd'
$preview=Join-Path $root 'assets/decorate/forest/new-preview'
foreach($asset in $manifest.assets){
 $name='forest-'+$asset.name+'-v1.png'
 $saved=Join-Path $hd $name
 $target=Join-Path $preview $name
 if((Test-Path -LiteralPath $saved) -or (Test-Path -LiteralPath $target)){throw 'Output exists'}
 Copy-Item -LiteralPath $asset.source -Destination $saved
 $limit=128
 if($asset.name -eq 'wolf'){$limit=192}
 $result=[ForestResize]::Resize($saved,$target,$limit)
 Write-Output "$name : $result"
}
