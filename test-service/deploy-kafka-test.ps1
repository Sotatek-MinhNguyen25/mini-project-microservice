# Script để deploy Kafka Test Service lên Kubernetes
Write-Host "🚀 Deploying Kafka Test Service to Kubernetes..." -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
pnpm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Dependencies installation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green

# Build the application
Write-Host "🔨 Building application..." -ForegroundColor Yellow
pnpm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Application built successfully!" -ForegroundColor Green

# Build Docker image
Write-Host "🐳 Building Docker image..." -ForegroundColor Yellow
docker build -t xinchaoduyanh2/test-service:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker image built successfully!" -ForegroundColor Green

# Check if Kafka is running
Write-Host "🔍 Checking Kafka service status..." -ForegroundColor Yellow
$kafkaPods = kubectl get pods -l app=kafka-broker-service -o jsonpath='{.items[*].status.phase}' 2>$null
if ($kafkaPods -eq "Running") {
    Write-Host "✅ Kafka is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  Kafka might not be running. Current status: $kafkaPods" -ForegroundColor Yellow
    Write-Host "💡 Make sure to deploy Kafka first: kubectl apply -f ../k8s/kafka.yaml" -ForegroundColor Cyan
}

# Apply Kubernetes manifests
Write-Host "🔧 Applying Kubernetes manifests..." -ForegroundColor Yellow
kubectl apply -f ../k8s/test-service-config.yaml
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

Write-Host "`n📋 Pod Logs:" -ForegroundColor Cyan
$podName = kubectl get pods -l app=test-service -o jsonpath='{.items[0].metadata.name}'
Write-Host "Pod name: $podName" -ForegroundColor White
Write-Host "To view logs: kubectl logs $podName -f" -ForegroundColor White

Write-Host "`n🧪 Test Kafka connectivity:" -ForegroundColor Cyan
Write-Host "kubectl exec -it $podName -- sh" -ForegroundColor White
Write-Host "Then check if Kafka connection is established" -ForegroundColor White

Write-Host "`n✅ Kafka Test Service deployed successfully!" -ForegroundColor Green 