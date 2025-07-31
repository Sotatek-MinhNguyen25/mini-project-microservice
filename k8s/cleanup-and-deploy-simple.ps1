# PowerShell script to cleanup and redeploy K8s

Write-Host "Cleaning up old Kubernetes resources..." -ForegroundColor Yellow
kubectl delete deployment --all --ignore-not-found=true
kubectl delete service --all --ignore-not-found=true
kubectl delete configmap --all --ignore-not-found=true
kubectl delete secret --all --ignore-not-found=true
kubectl delete pvc --all --ignore-not-found=true
kubectl delete pv --all --ignore-not-found=true
Write-Host "Waiting for cleanup to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
Write-Host "Cleanup completed!" -ForegroundColor Green

Write-Host "Deploying new resources..." -ForegroundColor Yellow

Write-Host "1. Deploying Zookeeper..." -ForegroundColor Cyan
kubectl apply -f k8s/zookeeper.yaml

Write-Host "2. Deploying Kafka..." -ForegroundColor Cyan
kubectl apply -f k8s/kafka.yaml # Sẽ dùng file bạn vừa gửi với Service name là kafka

# 3. Deploying ConfigMaps
Write-Host "3. Deploying ConfigMaps..." -ForegroundColor Cyan
kubectl apply -f k8s/api-gateway-config.yaml
kubectl apply -f k8s/auth-service-config.yaml
kubectl apply -f k8s/post-service-config.yaml
kubectl apply -f k8s/mail-service-config.yaml
kubectl apply -f k8s/notification-service-config.yaml
kubectl apply -f k8s/upload-service-config.yaml
kubectl apply -f k8s/fe-config.yaml

# 4. Deploying Secrets
Write-Host "4. Deploying Secrets..." -ForegroundColor Cyan
kubectl apply -f k8s/api-gateway-secrets.yaml
kubectl apply -f k8s/auth-service-secrets.yaml
kubectl apply -f k8s/post-service-secrets.yaml
kubectl apply -f k8s/mail-service-secrets.yaml
kubectl apply -f k8s/notification-service-secrets.yaml
kubectl apply -f k8s/upload-service-secrets.yaml
kubectl apply -f k8s/fe-secrets.yaml

# 5. Deploying Microservices (each .yaml file contains both Deployment and Service)
Write-Host "5. Deploying Microservices (Deployments and Services)..." -ForegroundColor Cyan
kubectl apply -f k8s/auth-service.yaml
kubectl apply -f k8s/post-service.yaml
kubectl apply -f k8s/mail-service.yaml
kubectl apply -f k8s/notification-service.yaml
kubectl apply -f k8s/upload-service.yaml
kubectl apply -f k8s/api-gateway.yaml
kubectl apply -f k8s/fe.yaml

Write-Host "Deployment completed!" -ForegroundColor Green

Write-Host "Checking deployment status..." -ForegroundColor Yellow
kubectl get pods
kubectl get services
kubectl get configmaps
kubectl get secrets

Write-Host "All done! Your microservices should be running now." -ForegroundColor Green