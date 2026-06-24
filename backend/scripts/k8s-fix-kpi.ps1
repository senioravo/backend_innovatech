# Repara el stack KPI en Kubernetes (ms-kpi + BFF + rutas KrakenD).
#
# Errores que corrige:
#   - BFF CrashLoopBackOff: frontendKpiRoutes sin import en apiGateway.ts
#   - ms-kpi no desplegado o imagen local faltante
#   - KPI 404: KrakenD K8s sin /consultations/kpis ni /notifications
#
# Requisitos: kubectl, docker, cluster activo, namespace innovatech (o se crea con apply -k .)
#
# Uso (desde backend/):
#   .\scripts\k8s-fix-kpi.ps1
#   .\scripts\k8s-fix-kpi.ps1 -SkipBuild
#   .\scripts\k8s-fix-kpi.ps1 -SkipSmoke

param(
    [switch]$SkipBuild,
    [switch]$SkipSmoke
)

$ErrorActionPreference = "Stop"
$BackendRoot = Split-Path -Parent $PSScriptRoot
Set-Location $BackendRoot

$KpiImage = "innovatech/ms-kpi:1.0.0"
$BffImage = "innovatech/bff:1.0.3"
$Namespace = "innovatech"

function Assert-FileContains {
    param([string]$Path, [string]$Pattern, [string]$FixHint)
    if (-not (Test-Path $Path)) {
        Write-Host "ERROR: No existe $Path" -ForegroundColor Red
        exit 1
    }
    $content = Get-Content $Path -Raw
    if ($content -notmatch $Pattern) {
        Write-Host "ERROR: Falta en $Path" -ForegroundColor Red
        Write-Host $FixHint -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "==> Comprobando codigo del BFF (import frontendKpiRoutes)" -ForegroundColor Cyan
$apiGatewayTs = Join-Path $BackendRoot "bff/src/presentation/http/gateway/apiGateway.ts"
Assert-FileContains -Path $apiGatewayTs `
    -Pattern "import frontendKpiRoutes" `
    -FixHint "Agrega en apiGateway.ts:`n  import frontendKpiRoutes from '../routes/frontendKpiRoutes.js';"

Write-Host "==> Comprobando ms-kpi en kustomization.yaml" -ForegroundColor Cyan
$kustomization = Join-Path $BackendRoot "k8s/kustomization.yaml"
Assert-FileContains -Path $kustomization `
    -Pattern "ms-kpi/k8s" `
    -FixHint "Agrega en k8s/kustomization.yaml:`n  - ../ms-kpi/k8s"

Write-Host "==> Comprobando cluster kubectl" -ForegroundColor Cyan
kubectl get nodes | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: kubectl no puede conectar al cluster." -ForegroundColor Red
    exit 1
}

kubectl get namespace $Namespace 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "==> Namespace $Namespace no existe; creando..." -ForegroundColor Yellow
    kubectl apply -f k8s/namespace.yaml
}

if (-not $SkipBuild) {
    Write-Host "==> Construyendo imagenes Docker ($KpiImage, $BffImage)" -ForegroundColor Cyan
    docker build -t $KpiImage ./ms-kpi
    docker build -t $BffImage ./bff
} else {
    Write-Host "==> Omitiendo docker build (-SkipBuild)" -ForegroundColor Yellow
}

Write-Host "==> Aplicando ms-kpi, BFF y api-gateway (KrakenD K8s)" -ForegroundColor Cyan
kubectl apply -k ms-kpi/k8s
kubectl apply -k bff/k8s
kubectl apply -k api-gateway/k8s

Write-Host "==> Reiniciando ms-kpi, BFF y api-gateway" -ForegroundColor Cyan
kubectl rollout restart deployment/ms-kpi deployment/bff deployment/api-gateway -n $Namespace
kubectl rollout status deployment/ms-kpi -n $Namespace --timeout=120s
kubectl rollout status deployment/bff -n $Namespace --timeout=120s
kubectl rollout status deployment/api-gateway -n $Namespace --timeout=120s

Write-Host ""
Write-Host "Pods KPI/BFF/Gateway:" -ForegroundColor Green
kubectl get pods -n $Namespace -l 'app.kubernetes.io/name in (ms-kpi,bff,api-gateway)'

if (-not $SkipSmoke) {
    Write-Host ""
    Write-Host "==> Smoke rapido KPI (requiere port-forward en 8010 si no hay Ingress)" -ForegroundColor Cyan
    Write-Host "    kubectl port-forward -n $Namespace svc/api-gateway 8010:8080" -ForegroundColor DarkGray

    $portForwardJob = Start-Job -ScriptBlock {
        kubectl port-forward -n innovatech svc/api-gateway 8010:8080 2>$null
    }
    Start-Sleep -Seconds 3

    try {
        $loginBody = '{"email":"gestor@innovatech.cl","password":"Secret123"}'
        $login = Invoke-RestMethod -Uri "http://localhost:8010/api/v1/auth/login" `
            -Method POST -ContentType "application/json" -Body $loginBody -ErrorAction Stop
        $token = $login.data.token
        if (-not $token) { throw "Login sin token" }

        foreach ($path in @("/api/v1/kpis/dashboard", "/api/v1/consultations/kpis", "/api/v1/notifications")) {
            try {
                $null = Invoke-RestMethod -Uri "http://localhost:8010$path" `
                    -Headers @{ Authorization = "Bearer $token" } -ErrorAction Stop
                Write-Host "  OK  $path" -ForegroundColor Green
            } catch {
                $code = $_.Exception.Response.StatusCode.value__
                Write-Host "  FAIL $path (HTTP $code)" -ForegroundColor Red
            }
        }
    } catch {
        Write-Host "  Smoke omitido o fallo conexion: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "  Ejecuta manualmente: npm run smoke" -ForegroundColor Yellow
    } finally {
        Stop-Job $portForwardJob -ErrorAction SilentlyContinue
        Remove-Job $portForwardJob -Force -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "Listo. Si algo falla, revisa logs:" -ForegroundColor Green
Write-Host "  kubectl logs -n $Namespace deploy/bff --tail=30"
Write-Host "  kubectl logs -n $Namespace deploy/ms-kpi --tail=30"
