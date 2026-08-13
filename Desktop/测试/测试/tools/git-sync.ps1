param(
    [ValidateSet("pull", "push", "sync")]
    [string]$Action = "sync"
)

$ErrorActionPreference = "Stop"

function Write-Info([string]$Message) {
    Write-Host $Message -ForegroundColor Cyan
}

function Invoke-Git([string[]]$Args) {
    & git @Args
    if ($LASTEXITCODE -ne 0) {
        throw "git $($Args -join ' ') failed with exit code $LASTEXITCODE"
    }
}

$projectRoot = $PSScriptRoot | Split-Path -Parent
$repoRoot = (git -C $projectRoot rev-parse --show-toplevel 2>$null)
if (-not $repoRoot) {
    throw "Not inside a git repository."
}

Set-Location $repoRoot

$projectRelative = $projectRoot.Substring($repoRoot.Length).TrimStart("\", "/") -replace "\\", "/"

$branch = (git branch --show-current).Trim()
if (-not $branch) {
    throw "Current HEAD is detached. Checkout a branch before syncing."
}

$status = (git status --porcelain -- $projectRelative)
if ($status) {
    Write-Info "Working tree has local changes. Commit or stash them before sync."
    git status --short -- $projectRelative
    exit 1
}

switch ($Action) {
    "pull" {
        Write-Info "Pulling origin/$branch ..."
        Invoke-Git @("pull", "--rebase", "origin", $branch)
    }
    "push" {
        Write-Info "Pushing $branch ..."
        Invoke-Git @("push", "origin", $branch)
    }
    "sync" {
        Write-Info "Pulling origin/$branch ..."
        Invoke-Git @("pull", "--rebase", "origin", $branch)
        Write-Info "Pushing $branch ..."
        Invoke-Git @("push", "origin", $branch)
    }
}
