param([string]$PlanFile = '.tmp/image-cleanup-plan.json')
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$plan = Get-Content -LiteralPath ([IO.Path]::Combine($projectRoot, $PlanFile)) -Raw -Encoding UTF8 | ConvertFrom-Json
function Resolve-ProjectFile([string]$relative) {
    $resolved = [IO.Path]::GetFullPath([IO.Path]::Combine($projectRoot, $relative))
    if (-not $resolved.StartsWith($projectRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw "Outside project: $resolved" }
    return $resolved
}
$operations = @()
foreach ($entry in $plan.moves) { $operations += [pscustomobject]@{ From=$entry.from; To=$entry.to } }
foreach ($entry in $plan.duplicates) { $operations += [pscustomobject]@{ From=$entry.from; To=($plan.backup + '/removed-duplicates/' + $entry.from) } }
# Validate every exact source and destination before changing any file.
foreach ($entry in $operations) {
    $source = Resolve-ProjectFile $entry.From
    $target = Resolve-ProjectFile $entry.To
    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { throw "Missing file: $source" }
    if ((Test-Path -LiteralPath $target) -or (Test-Path -LiteralPath ($target + '.meta'))) { throw "Target already exists: $target" }
}
foreach ($entry in $operations) {
    $source = Resolve-ProjectFile $entry.From
    $target = Resolve-ProjectFile $entry.To
    New-Item -ItemType Directory -Path ([IO.Path]::GetDirectoryName($target)) -Force | Out-Null
    if (Test-Path -LiteralPath ($source + '.meta')) { Move-Item -LiteralPath ($source + '.meta') -Destination ($target + '.meta') }
    Move-Item -LiteralPath $source -Destination $target
}
Write-Output ('Moved classified/reserve files: ' + $plan.moves.Count)
Write-Output ('Removed duplicate images to recoverable backup: ' + $plan.duplicates.Count)
