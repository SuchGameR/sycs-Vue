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

# --- 2. Build --------------------------------------------------------------
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

# --- 3. Stop the container so it releases .output-prod --------------------
Write-Step "Stopping $Container (holds locks on .output-prod)"
docker stop $Container | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Failed to stop $Container" }
Write-Ok 'stopped'

# --- 4. Swap .output -> .output-prod --------------------------------------
# /MIR so files removed from .output do not linger in .output-prod and shadow
# the new build.
Write-Step 'Publishing .output -> .output-prod'
robocopy '.output' '.output-prod' /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
# robocopy: 0-7 = success, 8+ = failure.
if ($LASTEXITCODE -ge 8) { throw "robocopy failed with exit code $LASTEXITCODE" }
if (-not (Test-Path '.output-prod\server\index.mjs')) { throw 'Published output is missing server\index.mjs' }
Write-Ok 'published'

# --- 5. Start and wait for readiness -------------------------------------
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

# --- 6. Report ------------------------------------------------------------
$ha = (Invoke-WebRequest 'http://127.0.0.1:20241/metrics' -UseBasicParsing -TimeoutSec 5).Content
$conns = if ($ha -match 'cloudflared_tunnel_ha_connections (\d+)') { $Matches[1] } else { '?' }

Write-Step 'Cloudflare tunnel'
Write-Ok  "cloudflared left running untouched (ha_connections=$conns)"
Write-Warn 'This is a QUICK tunnel (--url): the public hostname changes every time'
Write-Warn 'cloudflared restarts. It is still the OLD hostname from your console.'
Write-Host ''
Write-Host 'Deployed.' -ForegroundColor Green