# Deploy InnovaTech backend for local development — all services in Kubernetes.
# Requires: kubectl, a running cluster (Rancher Desktop, minikube, kind, etc.)
#
# Usage (from backend/):
#   .\scripts\k8s-dev-up.ps1
#   .\scripts\k8s-dev-up.ps1 -SkipJwtKeys
#   .\scripts\k8s-dev-up.ps1 -WaitForFlyway:$false

param(
    [switch]$SkipJwtKeys,
    [bool]$WaitForFlyway = $true
)

$ErrorActionPreference = "Stop"
$BackendRoot = Split-Path -Parent $PSScriptRoot
Set-Location $BackendRoot

Write-Host "==> Applying local secrets (k8s/secrets.local.yaml)" -ForegroundColor Cyan
kubectl apply -f k8s/secrets.local.yaml

if (-not $SkipJwtKeys) {
    $privateKey = Join-Path $BackendRoot "ms-auth/keys/private.key"
    $publicKey = Join-Path $BackendRoot "ms-auth/keys/public.key"
    if (-not (Test-Path $privateKey) -or -not (Test-Path $publicKey)) {
        Write-Host "JWT keys not found. Generating with ms-auth/scripts/generate-keys.js ..." -ForegroundColor Yellow
        Push-Location (Join-Path $BackendRoot "ms-auth")
        node scripts/generate-keys.js
        Pop-Location
    }
    Write-Host "==> Applying JWT keys secret (innovatech-jwt-keys)" -ForegroundColor Cyan
    kubectl create secret generic innovatech-jwt-keys -n innovatech `
        --from-file=private.key=$privateKey `
        --from-file=public.key=$publicKey `
        --dry-run=client -o yaml | kubectl apply -f -
}

Write-Host "==> Applying full stack (kubectl apply -k .)" -ForegroundColor Cyan
kubectl apply -k .

if ($WaitForFlyway) {
    Write-Host "==> Waiting for Flyway migration jobs ..." -ForegroundColor Cyan
    $jobs = @("ms-users-flyway", "ms-project-manager-flyway")
    foreach ($job in $jobs) {
        kubectl wait --for=condition=complete "job/$job" -n innovatech --timeout=300s
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Job $job did not complete. Logs:" -ForegroundColor Red
            kubectl logs -n innovatech "job/$job" --all-containers=true
            exit 1
        }
    }
    Write-Host "Flyway jobs completed." -ForegroundColor Green
}

Write-Host ""
Write-Host "Stack deployed. Useful commands:" -ForegroundColor Green
Write-Host "  kubectl get pods,svc,jobs -n innovatech"
Write-Host "  kubectl port-forward -n innovatech svc/api-gateway 8010:8080"
Write-Host "  API: http://localhost:8010/api/v1/..."
