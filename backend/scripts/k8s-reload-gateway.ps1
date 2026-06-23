# Recarga la config de KrakenD en el cluster (tras cambiar api-gateway/k8s/krakend.json).
$ErrorActionPreference = "Stop"
$BackendRoot = Split-Path -Parent $PSScriptRoot
Set-Location $BackendRoot

Write-Host "==> Applying api-gateway ConfigMap + deployment" -ForegroundColor Cyan
kubectl apply -k api-gateway/k8s

Write-Host "==> Restarting api-gateway pod" -ForegroundColor Cyan
kubectl rollout restart deployment/api-gateway -n innovatech
kubectl rollout status deployment/api-gateway -n innovatech --timeout=120s

Write-Host "Gateway reloaded." -ForegroundColor Green
