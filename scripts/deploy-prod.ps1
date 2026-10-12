<#
.SYNOPSIS
  Builds SYCS and publishes it to the container that cloudflared tunnels to.

.DESCRIPTION
  The request chain is:

      cloudflared --url http://localhost:3000   (quick tunnel, Windows host)
        -> host localhost:3000
          -> container sycs-nuxt-app
            -> node .output-prod/server/index.mjs

  `bun run build` alone changes nothing live: it writes .output, while the
  container only ever reads .output-prod. And the container's node process holds
  those files open, so .output-prod cannot be replaced until it is stopped --
  which is why this stops the container before the swap and starts it again after.

  cloudflared is deliberately NOT touched. It is a pass-through proxy, so it
  picks up the restarted origin on the next request. Restarting it would be
  actively harmful here: this is a *quick* tunnel (--url), so a restart issues a
  brand new random hostname and every existing link to the app breaks.

.PARAMETER SkipBuild
  Re-publish the existing .output without rebuilding. Useful when the build is
  already known-good.

.PARAMETER StopDevServer
  Kill a running `nuxt dev` instead of refusing. Nuxt refuses to build while a
  dev server owns the project, so this is required to build at all.

.EXAMPLE
  powershell -File scripts/deploy-prod.ps1 -StopDevServer
#>
[CmdletBinding()]
param(
  [switch]$SkipBuild,
  [switch]$StopDevServer
)

$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)

$Container = 'sycs-nuxt-app'
$Origin    = 'http://localhost:3000'
# Used at the end to prove the origin is serving *this* run's build and not a
# leftover from a previous deploy that happened to still be on disk.
$DeployStart = Get-Date

function Write-Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "    $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "    $msg" -ForegroundColor Yellow }

# --- 1. A dev server blocks the build -------------------------------------
$dev = Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -match 'nuxt(\.mjs)?\s+dev' }

if ($dev) {
  if (-not $StopDevServer) {
    throw "A Nuxt dev server is running (PID $($dev.ProcessId -join ', ')). Nuxt will not build while it owns the project.`nRe-run with -StopDevServer to stop it first."
  }
  Write-Step 'Stopping Nuxt dev server(s)'
  $dev | ForEach-Object {
    Write-Ok "stopping PID $($_.ProcessId)"
    Stop-Process -Id $_.ProcessId -Force
  }
  Start-Sleep -Seconds 1
}

# --- 2. Reap orphaned builds ----------------------------------------------
# docker-compose bind-mounts the whole project (.:/app), so a build and the
# running container write into the same tree. A run that was interrupted leaves
# `nuxi.mjs build` parked with an esbuild child and no console; the next build
# then competes with it over .nuxt/.output and hangs without printing anything.
# Nothing is lost by clearing them: a build is a pure function of the source.
Write-Step 'Clearing stale build processes'
$stale = Get-CimInstance Win32_Process -Filter "Name='node.exe' OR Name='esbuild.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -match 'nuxi\.mjs\s+build|esbuild' }
if ($stale) {
  $stale | ForEach-Object {
    Write-Ok "stopping stale PID $($_.ProcessId) ($($_.Name))"
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
  }
  Start-Sleep -Seconds 1
} else {
  Write-Ok 'none found'
}

# --- 3. Stop the container before building, not just before the swap ------
# The container has to be down for the whole write. Because `.:` is bind
# mounted, its node process keeps handles open inside .output-prod while Nitro
# rewrites the sibling .output, and Windows cannot replace a file that is still
# open -- which is exactly the EPERM/EPERM-stall this script exists to avoid.
Write-Step "Stopping $Container"
docker stop $Container | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Failed to stop $Container" }
Write-Ok 'stopped'

# --- 4. Build --------------------------------------------------------------
if ($SkipBuild) {
  Write-Step 'Skipping build (-SkipBuild)'
} else {
  Write-Step 'Building (.output)'
  # NUXT_BUILD_DIR is left unset on purpose: it only moves the Nuxt build dir,
  # while Nitro's output always lands in .output. Setting it from a Linux
  # container writes symlinks through the bind mount that Windows cannot unlink,
  # which then breaks the next host build with EPERM.
  & bun run nuxt build
  if ($LASTEXITCODE -ne 0) { throw "Build failed with exit code $LASTEXITCODE" }
}

$built = Join-Path $PWD '.output\server\index.mjs'
if (-not (Test-Path $built)) { throw "Build produced no .output\server\index.mjs -- refusing to publish." }
Write-Ok 'build artifact present'

# --- 5. Swap .output -> .output-prod --------------------------------------
# /MIR so files removed from .output do not linger in .output-prod and shadow
# the new build.
Write-Step 'Publishing .output -> .output-prod'
robocopy '.output' '.output-prod' /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
# robocopy: 0-7 = success, 8+ = failure.
if ($LASTEXITCODE -ge 8) { throw "robocopy failed with exit code $LASTEXITCODE" }
if (-not (Test-Path '.output-prod\server\index.mjs')) { throw 'Published output is missing server\index.mjs' }
Write-Ok 'published'

# Belt and braces: /MIR can exit 0 while having skipped a file it considered
# up to date. If the published entry point is older than this run started, the
# container would boot the previous build, so fail loudly instead of reporting a
# deploy that did not happen.
$published = Get-Item '.output-prod\server\index.mjs'
if ($published.LastWriteTime -lt $DeployStart) {
  throw "Published entry point is stale (written $($published.LastWriteTime); this run started $DeployStart)."
}
Write-Ok "published entry point is current ($($published.LastWriteTime))"

# --- 6. Start and wait for readiness -------------------------------------
Write-Step "Starting $Container"
docker start $Container | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Failed to start $Container" }

$ready = $false
for ($i = 1; $i -le 30; $i++) {
  Start-Sleep -Seconds 1
  try {
    $r = Invoke-WebRequest "$Origin/search" -UseBasicParsing -TimeoutSec 5
    if ($r.StatusCode -lt 500) { $ready = $true; break }
  } catch { }
}
if (-not $ready) { throw "Container did not answer on $Origin within 30s. Check: docker logs $Container" }
Write-Ok "origin healthy ($Origin -> HTTP $($r.StatusCode))"

# --- 7. Verify published client assets actually resolve --------------------
# This is not paranoia. Observed on a real deploy: the container answered HTTP
# 200 for / and the health check passed, while 13 of 60 /_nuxt/*.js chunks 404'd.
# Docker Desktop's bind mount had not finished syncing the freshly mirrored
# .output-prod into the container by the time Nitro booted, so the server cached
# a view of the directory that was missing those files. The files were present
# and readable on disk, and a plain `node .output/server/index.mjs` on the host
# served all of them with 200 -- only the container was wrong, and only until it
# was restarted. A 200 on "/" is blind to this because the HTML renders fine and
# the missing chunks are lazy-loaded later, so the breakage shows up in the
# browser as a dead UI rather than a failed deploy.
Write-Step 'Verifying published client assets'

$assetNames = @(Get-ChildItem '.output-prod\public\_nuxt' -Filter *.js -File |
                ForEach-Object { $_.Name } | Sort-Object)

function Get-BadAssets {
  $bad = @()
  foreach ($name in $assetNames) {
    try {
      $resp = Invoke-WebRequest "$Origin/_nuxt/$name" -UseBasicParsing -TimeoutSec 10
      if ($resp.StatusCode -ne 200) { $bad += $name }
    } catch { $bad += $name }
  }
  return $bad
}

if ($assetNames.Count -eq 0) {
  throw 'No client assets found in .output-prod\public\_nuxt -- refusing to report success.'
}

$bad = Get-BadAssets
if ($bad.Count -gt 0) {
  # Most likely the bind-mount sync race above. One restart after the files have
  # had time to land reliably clears it; anything still missing is a real
  # publish failure and must not be papered over.
  Write-Warn "$($bad.Count)/$($assetNames.Count) assets 404 on first check; restarting container to resync"
  docker restart $Container | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Failed to restart $Container" }

  $ready = $false
  for ($i = 1; $i -le 30; $i++) {
    Start-Sleep -Seconds 1
    try {
      $resp = Invoke-WebRequest "$Origin/search" -UseBasicParsing -TimeoutSec 5
      if ($resp.StatusCode -lt 500) { $ready = $true; break }
    } catch { }
  }
  if (-not $ready) { throw "Container did not recover after restart. Check: docker logs $Container" }

  $bad = Get-BadAssets
  if ($bad.Count -gt 0) {
    $preview = ($bad | Select-Object -First 10) -join ', '
    throw "$($bad.Count) client assets still unreachable after restart: $preview"
  }
  Write-Ok "all $($assetNames.Count) assets reachable after restart"
} else {
  Write-Ok "all $($assetNames.Count) assets reachable"
}

# --- 8. Report ------------------------------------------------------------
$ha = (Invoke-WebRequest 'http://127.0.0.1:20241/metrics' -UseBasicParsing -TimeoutSec 5).Content
$conns = if ($ha -match 'cloudflared_tunnel_ha_connections (\d+)') { $Matches[1] } else { '?' }

Write-Step 'Cloudflare tunnel'
Write-Ok  "cloudflared left running untouched (ha_connections=$conns)"
Write-Warn 'This is a QUICK tunnel (--url): the public hostname changes every time'
Write-Warn 'cloudflared restarts. It is still the OLD hostname from your console.'
Write-Host ''
Write-Host 'Deployed.' -ForegroundColor Green