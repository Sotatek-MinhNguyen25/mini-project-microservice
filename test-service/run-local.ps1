# Script để build và chạy test-service local
Write-Host "=== Building and Running Test Service Locally ===" -ForegroundColor Green

# Kiểm tra xem có đang ở đúng thư mục không
if (-not (Test-Path "package.json")) {
    Write-Host "Error: Không tìm thấy package.json. Hãy chạy script này từ thư mục test-service" -ForegroundColor Red
    exit 1
}

# Cài đặt dependencies nếu chưa có
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pnpm install
}

# Build project
Write-Host "Building project..." -ForegroundColor Yellow
pnpm run build

# Chạy service
Write-Host "Starting test service on port 3010..." -ForegroundColor Green
Write-Host "Service will be available at: http://localhost:3010" -ForegroundColor Cyan
Write-Host "Health check: http://localhost:3010/api/health" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Chạy service với log chi tiết
pnpm run start:prod 