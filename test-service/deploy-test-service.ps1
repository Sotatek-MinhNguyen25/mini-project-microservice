# Script để deploy test service lên Kubernetes
Write-Host "🚀 Deploying Test Service to Kubernetes..." -ForegroundColor Green

# Build Docker image
Write-Host "📦 Building Docker image..." -ForegroundColor Yellow
docker build -t xinchaoduyanh2/test-service:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker image built successfully!" -ForegroundColor Green

# Apply Kubernetes manifests
Write-Host "🔧 Applying Kubernetes manifests..." -ForegroundColor Yellow
kubectl apply -f ../k8s/test-service.yaml

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Kubernetes deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Kubernetes manifests applied successfully!" -ForegroundColor Green

# Wait for deployment to be ready
Write-Host "⏳ Waiting for deployment to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=available --timeout=300s deployment/test-service

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment timeout!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Deployment is ready!" -ForegroundColor Green

# Show deployment status
Write-Host "📊 Deployment Status:" -ForegroundColor Cyan
kubectl get pods -l app=test-service
kubectl get services -l app=test-service

Write-Host "`n🌐 Service URLs:" -ForegroundColor Cyan
Write-Host "Cluster IP: $(kubectl get service test-service -o jsonpath='{.spec.clusterIP}')" -ForegroundColor White
Write-Host "Port: $(kubectl get service test-service -o jsonpath='{.spec.ports[0].port}')" -ForegroundColor White

Write-Host "`n🧪 Test the service:" -ForegroundColor Cyan
Write-Host "kubectl port-forward service/test-service 8080:80" -ForegroundColor White
Write-Host "curl http://localhost:8080/api/health" -ForegroundColor White

Write-Host "`n✅ Test Service deployed successfully!" -ForegroundColor Green 