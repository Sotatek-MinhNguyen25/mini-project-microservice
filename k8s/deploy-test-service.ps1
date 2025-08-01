# Script deploy riêng cho Test Service
Write-Host "Deploying Test Service to Kubernetes..." -ForegroundColor Green

# Build Docker image
Write-Host "Building Docker image..." -ForegroundColor Yellow
cd ../test-service
docker build -t xinchaoduyanh2/test-service:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Docker image built successfully!" -ForegroundColor Green

# Push to registry (optional)
Write-Host "Pushing to registry..." -ForegroundColor Yellow
docker push xinchaoduyanh2/test-service:latest

if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed, but continuing with local deployment..." -ForegroundColor Yellow
}

cd ../k8s

# Apply ConfigMap
Write-Host "Applying ConfigMap..." -ForegroundColor Yellow
kubectl apply -f test-service-config.yaml

# Apply Secrets
Write-Host "Applying Secrets..." -ForegroundColor Yellow
kubectl apply -f test-service-secrets.yaml

# Apply main deployment
Write-Host "Applying Test Service deployment..." -ForegroundColor Yellow
kubectl apply -f test-service.yaml

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
kubectl get services -l app=test-service
kubectl get configmaps -l app=test-service

Write-Host "`nService URLs:" -ForegroundColor Cyan
Write-Host "Cluster IP: $(kubectl get service test-service -o jsonpath='{.spec.clusterIP}')" -ForegroundColor White
Write-Host "Port: $(kubectl get service test-service -o jsonpath='{.spec.ports[0].port}')" -ForegroundColor White

Write-Host "`nTest the service:" -ForegroundColor Cyan
Write-Host "kubectl port-forward service/test-service 8080:3010" -ForegroundColor White
Write-Host "curl http://localhost:8080/api/health" -ForegroundColor White
Write-Host "curl http://localhost:8080/api/info" -ForegroundColor White

Write-Host "`nTest Service deployed successfully!" -ForegroundColor Green 