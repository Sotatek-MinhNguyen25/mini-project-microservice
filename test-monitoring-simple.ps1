# Simple test for monitoring stack
Write-Host "Testing Monitoring Stack..." -ForegroundColor Green

# Test Test Service
Write-Host "Testing Test Service..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:30100/health" -Method GET -TimeoutSec 5
    Write-Host "Test Service: OK" -ForegroundColor Green
} catch {
    Write-Host "Test Service: FAILED" -ForegroundColor Red
}

# Test Metrics
Write-Host "Testing Metrics..." -ForegroundColor Yellow
try {
    $metrics = Invoke-RestMethod -Uri "http://localhost:30100/metrics" -Method GET -TimeoutSec 5
    Write-Host "Metrics: OK" -ForegroundColor Green
} catch {
    Write-Host "Metrics: FAILED" -ForegroundColor Red
}

# Test Grafana
Write-Host "Testing Grafana..." -ForegroundColor Yellow
try {
    $grafana = Invoke-RestMethod -Uri "http://localhost:32000/api/health" -Method GET -TimeoutSec 5
    Write-Host "Grafana: OK" -ForegroundColor Green
} catch {
    Write-Host "Grafana: FAILED" -ForegroundColor Red
}

Write-Host "`nMonitoring Stack URLs:" -ForegroundColor Green
Write-Host "Grafana: http://localhost:32000 (admin/admin123)" -ForegroundColor Cyan
Write-Host "Test Service: http://localhost:30100" -ForegroundColor Cyan
Write-Host "Prometheus: http://localhost:30900" -ForegroundColor Cyan 