$ErrorActionPreference='Stop'
$root = Split-Path $PSScriptRoot -Parent
$sourceRoot = (Resolve-Path (Join-Path $root 'assets/decorate/forest')).Path
$archive = Join-Path $root 'art-library/images/decorate/forest-source-archive'
New-Item -ItemType Directory -Path $archive -Force | Out-Null
$archive = (Resolve-Path $archive).Path
$names = @('forest-campfire-v2.png','forest-rusty-pickup-clean-v2.png','forest-environment-kit-v1.png','forest-structures-kit-v1.png')
foreach($name in $names){
 foreach($suffix in @('','.meta')){
  $source = Join-Path $sourceRoot ($name+$suffix)
  $destination = Join-Path $archive ($name+$suffix)
  if(-not (Test-Path -LiteralPath $source)){throw "Missing source: $source"}
  if(Test-Path -LiteralPath $destination){throw "Destination exists: $destination"}
 }
}
foreach($name in $names){
 foreach($suffix in @('','.meta')){
  $source = Join-Path $sourceRoot ($name+$suffix)
  $destination = Join-Path $archive ($name+$suffix)
  $hash = (Get-FileHash -LiteralPath $source).Hash
  Move-Item -LiteralPath $source -Destination $destination
  if((Get-FileHash -LiteralPath $destination).Hash -ne $hash){throw 'Hash mismatch'}
 }
 Write-Output "Archived $name"
}
