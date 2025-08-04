# Script đơn giản để test Kafka connectivity
Write-Host "🧪 Testing Kafka Connectivity..." -ForegroundColor Green

# Get the test-service pod name
$podName = kubectl get pods -l app=test-service -o jsonpath='{.items[0].metadata.name}'
Write-Host "📦 Test Service Pod: $podName" -ForegroundColor Cyan

# Check if pod is running
$podStatus = kubectl get pod $podName -o jsonpath='{.status.phase}'
if ($podStatus -eq "Running") {
    Write-Host "✅ Pod is running" -ForegroundColor Green
} else {
    Write-Host "❌ Pod is not running. Status: $podStatus" -ForegroundColor Red
    exit 1
}

# Show recent logs
Write-Host "`n📋 Recent logs:" -ForegroundColor Cyan
kubectl logs $podName --tail=30

# Check if Kafka service exists
Write-Host "`n🔍 Checking Kafka service..." -ForegroundColor Cyan
$kafkaService = kubectl get service kafka-broker-service -o jsonpath='{.metadata.name}' 2>$null
if ($kafkaService -eq "kafka-broker-service") {
    Write-Host "✅ Kafka service exists" -ForegroundColor Green
} else {
    Write-Host "❌ Kafka service not found!" -ForegroundColor Red
    Write-Host "💡 Deploy Kafka first: kubectl apply -f ../k8s/kafka.yaml" -ForegroundColor Yellow
    exit 1
}

# Check Kafka pod status
Write-Host "`n🔍 Checking Kafka pod status..." -ForegroundColor Cyan
$kafkaPodStatus = kubectl get pods -l app=kafka-broker-service -o jsonpath='{.items[0].status.phase}' 2>$null
if ($kafkaPodStatus -eq "Running") {
    Write-Host "✅ Kafka pod is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  Kafka pod status: $kafkaPodStatus" -ForegroundColor Yellow
}

Write-Host "`n✅ Kafka connectivity test completed!" -ForegroundColor Green
Write-Host "💡 If you see connection errors, make sure Kafka is fully started" -ForegroundColor Cyan 