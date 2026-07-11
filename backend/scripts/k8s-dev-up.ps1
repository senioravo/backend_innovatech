# Deploy InnovaTech full stack for local development — backend + frontend in Kubernetes.
# Requires: kubectl, docker, a running cluster (Rancher Desktop, minikube, kind, etc.)
#
# Usage (from backend/):
#   .\scripts\k8s-dev-up.ps1
#   .\scripts\k8s-dev-up.ps1 -SkipJwtKeys
#   .\scripts\k8s-dev-up.ps1 -SkipBuild
#   .\scripts\k8s-dev-up.ps1 -WaitForFlyway:$false

param(
    [switch]$SkipJwtKeys,
    [switch]$SkipBuild,
    [bool]$WaitForFlyway = $true
)

$ErrorActionPreference = "Stop"
$BackendRoot = Split-Path -Parent $PSScriptRoot
$RepoRoot = Split-Path -Parent $BackendRoot
Set-Location $BackendRoot

if (-not $SkipBuild) {
    Write-Host "==> Building Docker images (Node 26)..." -ForegroundColor Cyan
    $images = @(
        @{ Tag = "innovatech/ms-users:1.0.0"; Path = "./ms-users" },
        @{ Tag = "innovatech/ms-auth:1.0.0"; Path = "./ms-auth" },
        @{ Tag = "innovatech/ms-project-manager:1.0.0"; Path = "./ms-project-manager" },
        @{ Tag = "innovatech/ms-kpi:1.0.0"; Path = "./ms-kpi" },
        @{ Tag = "innovatech/bff:1.0.0"; Path = "./bff" },
        @{ Tag = "innovatech/frontend:1.0.0"; Path = "../frontend" }
    )
    $sentryDsn = $null
    $bffEnvPath = Join-Path $BackendRoot "bff\.env"
    if (Test-Path $bffEnvPath) {
        Get-Content $bffEnvPath | ForEach-Object {
            if ($_ -match '^\s*SENTRY_DSN=(.+)$') { $sentryDsn = $matches[1].Trim() }
        }
    }
    foreach ($img in $images) {
        if ($img.Path -eq "../frontend" -and $sentryDsn) {
            Write-Host "  docker build -t $($img.Tag) $($img.Path) (VITE_SENTRY_DSN=***)" -ForegroundColor DarkGray
            docker build -t $img.Tag $img.Path `
                --build-arg "VITE_SENTRY_DSN=$sentryDsn" `
                --build-arg "VITE_SENTRY_ENVIRONMENT=kubernetes"
        } else {
            Write-Host "  docker build -t $($img.Tag) $($img.Path)" -ForegroundColor DarkGray
            docker build -t $img.Tag $img.Path
        }
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    }
    Write-Host "Docker images built." -ForegroundColor Green
    Write-Host "==> Restarting pods to pick up local images (imagePullPolicy: Never)..." -ForegroundColor Cyan
    kubectl rollout restart deployment/ms-users deployment/ms-auth deployment/ms-project-manager deployment/ms-kpi deployment/bff -n innovatech 2>$null | Out-Null
}

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
Write-Host "  kubectl get pods,svc,ingress,jobs -n innovatech"
Write-Host "  kubectl port-forward -n innovatech svc/api-gateway 8010:8010"
Write-Host "  kubectl port-forward -n innovatech svc/frontend 8080:80"
Write-Host "  API:  http://localhost:8010/api/v1/..."
Write-Host "  App:  http://localhost:8080/  (nginx proxies /api to api-gateway)"
Write-Host ""
Write-Host "Swagger (port-forward each service):" -ForegroundColor Green
Write-Host "  kubectl port-forward -n innovatech svc/bff 3010:3010"
Write-Host "  kubectl port-forward -n innovatech svc/ms-project-manager 3002:3002"
Write-Host "  kubectl port-forward -n innovatech svc/ms-auth 3001:3001"
Write-Host "  kubectl port-forward -n innovatech svc/ms-users 3003:3003"
Write-Host "  kubectl port-forward -n innovatech svc/ms-kpi 3004:3004"
Write-Host "  BFF:    http://localhost:3010/api-docs"
Write-Host "  PM:     http://localhost:3002/api-docs"
Write-Host "  Auth:   http://localhost:3001/api-docs"
Write-Host "  Users:  http://localhost:3003/api-docs"
Write-Host "  KPI:    http://localhost:3004/api-docs"
Write-Host ""
Write-Host "GlitchTip (SENTRY_DSN en k8s/secrets.local.yaml):" -ForegroundColor Green
Write-Host "  Verifica errores en https://app.glitchtip.com (Issues)"
Write-Host "  Demo BFF (desde pod): kubectl exec -n innovatech deploy/bff -- wget -qO- http://127.0.0.1:3010/api/demo/error"
Write-Host ""
Write-Host "With Ingress (add to hosts file):" -ForegroundColor Green
Write-Host "  127.0.0.1 app.innovatech.local api.innovatech.local"
Write-Host "  App:  http://app.innovatech.local/"
Write-Host "  API:  http://api.innovatech.local/api/v1/..."
