# Script để rebuild và redeploy hybrid HTTP+Kafka service
Write-Host "Rebuilding Hybrid HTTP+Kafka Test Service..." -ForegroundColor Green

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pnpm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Dependencies installation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Dependencies installed successfully!" -ForegroundColor Green

# Build the application
Write-Host "Building application..." -ForegroundColor Yellow
pnpm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Application built successfully!" -ForegroundColor Green

# Build Docker image
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker build -t xinchaoduyanh2/test-service:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Docker image built successfully!" -ForegroundColor Green

# Delete existing deployment
Write-Host "Deleting existing deployment..." -ForegroundColor Yellow
kubectl delete deployment test-service --ignore-not-found=true

# Apply Kubernetes manifests
Write-Host "Applying Kubernetes manifests..." -ForegroundColor Yellow
kubectl apply -f ../k8s/test-service-config.yaml
kubectl apply -f ../k8s/test-service.yaml

if ($LASTEXITCODE -ne 0) {
    Write-Host "Kubernetes deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Kubernetes manifests applied successfully!" -ForegroundColor Green

# Wait for deployment to be ready
Write-Host "Waiting for deployment to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=available --timeout=300s deployment/test-service

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment timeout!" -ForegroundColor Red
    exit 1
}

Write-Host "Deployment is ready!" -ForegroundColor Green

# Show deployment status
Write-Host "Deployment Status:" -ForegroundColor Cyan
kubectl get pods -l app=test-service

Write-Host "`nPod Logs:" -ForegroundColor Cyan
$podName = kubectl get pods -l app=test-service -o jsonpath='{.items[0].metadata.name}'
Write-Host "Pod name: $podName" -ForegroundColor White
Write-Host "To view logs: kubectl logs $podName -f" -ForegroundColor White

Write-Host "`nTest HTTP endpoints:" -ForegroundColor Cyan
Write-Host "kubectl port-forward service/test-service 8080:3010" -ForegroundColor White
Write-Host "curl http://localhost:8080/api/health" -ForegroundColor White
Write-Host "curl http://localhost:8080/api/info" -ForegroundColor White

Write-Host "`nHybrid Test Service deployed successfully!" -ForegroundColor Green
Write-Host "Service now supports both HTTP health checks and Kafka consumer" -ForegroundColor Cyan 