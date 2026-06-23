# Rebuild and redeploy BFF (fix DELETE 500 from KrakenD + 204 responses).
$ErrorActionPreference = "Stop"
$BackendRoot = Split-Path -Parent $PSScriptRoot
Set-Location $BackendRoot

Write-Host "==> Building innovatech/bff:1.0.3" -ForegroundColor Cyan
docker build -t innovatech/bff:1.0.3 ./bff

Write-Host "==> Applying BFF deployment" -ForegroundColor Cyan
kubectl apply -k bff/k8s

Write-Host "==> Restarting BFF pod" -ForegroundColor Cyan
kubectl rollout restart deployment/bff -n innovatech
kubectl rollout status deployment/bff -n innovatech --timeout=120s

Write-Host "BFF redeployed." -ForegroundColor Green
