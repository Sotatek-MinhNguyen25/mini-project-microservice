# Script để thêm cấu hình Resources vào các Deployment files
# Giải quyết vấn đề OOMKilled và ELIFECYCLE Command failed

Write-Host "Đang thêm cấu hình Resources vào các Deployment files..." -ForegroundColor Green

# Danh sách các file deployment cần sửa
$deploymentFiles = @(
    "api-gateway.yaml",
    "auth-service.yaml", 
    "post-service.yaml",
    "notification-service.yaml",
    "mail-service.yaml",
    "upload-service.yaml",
    "fe.yaml"
)

foreach ($file in $deploymentFiles) {
    Write-Host "Đang xử lý file: $file" -ForegroundColor Yellow
    
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Xác định loại service để áp dụng resources phù hợp
        $resourcesConfig = ""
        if ($file -eq "fe.yaml") {
            # Frontend - resources nhẹ
            $resourcesConfig = @"
          resources:
            limits:
              memory: "256Mi"
              cpu: "250m"
            requests:
              memory: "128Mi"
              cpu: "100m"
"@
        } elseif ($file -eq "api-gateway.yaml" -or $file -eq "post-service.yaml" -or $file -eq "notification-service.yaml") {
            # Services nặng
            $resourcesConfig = @"
          resources:
            limits:
              memory: "1Gi"
              cpu: "750m"
            requests:
              memory: "512Mi"
              cpu: "500m"
"@
        } else {
            # Services cơ bản
            $resourcesConfig = @"
          resources:
            limits:
              memory: "512Mi"
              cpu: "500m"
            requests:
              memory: "256Mi"
              cpu: "250m"
"@
        }
        
        # Thêm resources vào sau ports và trước livenessProbe
        $pattern = '(\s+ports:\s*\n\s+- containerPort: \d+\n\s+)'
        $replacement = "`$1$resourcesConfig`n"
        
        $newContent = $content -replace $pattern, $replacement
        
        # Lưu file
        Set-Content -Path $file -Value $newContent -Encoding UTF8
        Write-Host "Đã cập nhật $file" -ForegroundColor Green
    } else {
        Write-Host "hông tìm thấy file: $file" -ForegroundColor Red
    }
}

Write-Host "`n Hoàn thành! Tất cả deployment files đã được cập nhật với cấu hình Resources." -ForegroundColor Green
Write-Host "ước tiếp theo:" -ForegroundColor Cyan
Write-Host "1. Chạy: kubectl apply -f ." -ForegroundColor White
Write-Host "2. Chạy: kubectl get pods -A để kiểm tra trạng thái" -ForegroundColor White
Write-Host "3. Chạy: kubectl describe pod <pod-name> để xem logs nếu cần" -ForegroundColor White 