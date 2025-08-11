# Generate traffic for test-service to test metrics
Write-Host "Generating traffic for test-service..." -ForegroundColor Green

$baseUrl = "http://localhost:30100"  # NodePort for test-service
$duration = 60  # 1 minute for testing
$interval = 2    # 2 seconds between requests

Write-Host "Starting traffic generation for $duration seconds..." -ForegroundColor Yellow
Write-Host "Base URL: $baseUrl" -ForegroundColor Cyan

$startTime = Get-Date
$endTime = $startTime.AddSeconds($duration)
$requestCount = 0

while ((Get-Date) -lt $endTime) {
    $requestCount++
    $currentTime = Get-Date -Format "HH:mm:ss"
    
    # Randomly choose an endpoint
    $endpoints = @("/", "/health", "/info", "/metrics", "/users")
    $endpoint = $endpoints | Get-Random
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl$endpoint" -Method GET -TimeoutSec 5
        Write-Host "[$currentTime] Request $requestCount to $endpoint - Status: OK" -ForegroundColor Green
    }
    catch {
        Write-Host "[$currentTime] Request $requestCount to $endpoint - Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Random delay between 1-3 seconds
    $delay = Get-Random -Minimum 1 -Maximum 4
    Start-Sleep -Seconds $delay
}

Write-Host "Traffic generation completed!" -ForegroundColor Green
Write-Host "Total requests made: $requestCount" -ForegroundColor Cyan
Write-Host "Check Grafana dashboard at http://localhost:32000" -ForegroundColor Yellow 