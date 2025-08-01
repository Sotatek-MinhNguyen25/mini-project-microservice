# Script build tất cả Docker images

Write-Host "Building all Docker images..." -ForegroundColor Yellow

# Build API Gateway
Write-Host "Building API Gateway..." -ForegroundColor Green
cd api-gateway
docker build -t xinchaoduyanh2/api-gateway:latest .
docker push xinchaoduyanh2/api-gateway:latest
cd ..

# Build Auth Service
Write-Host "Building Auth Service..." -ForegroundColor Green
cd auth-service
docker build -t xinchaoduyanh2/auth-service:latest .
docker push xinchaoduyanh2/auth-service:latest
cd ..

# Build Post Service
Write-Host "Building Post Service..." -ForegroundColor Green
cd post-service
docker build -t xinchaoduyanh2/post-service:latest .
docker push xinchaoduyanh2/post-service:latest
cd ..

# Build Mail Service
Write-Host "Building Mail Service..." -ForegroundColor Green
cd mail-service
docker build -t xinchaoduyanh2/mail-service:latest .
docker push xinchaoduyanh2/mail-service:latest
cd ..

# Build Notification Service
Write-Host "Building Notification Service..." -ForegroundColor Green
cd notification-service
docker build -t xinchaoduyanh2/notification-service:latest .
docker push xinchaoduyanh2/notification-service:latest
cd ..

# Build Upload Service
Write-Host "Building Upload Service..." -ForegroundColor Green
cd upload-service
docker build -t xinchaoduyanh2/upload-service:latest .
docker push xinchaoduyanh2/upload-service:latest
cd ..

# Build Test Service
Write-Host "Building Test Service..." -ForegroundColor Green
cd test-service
docker build -t xinchaoduyanh2/test-service:latest .
docker push xinchaoduyanh2/test-service:latest
cd ..

# Build Frontend
Write-Host "Building Frontend..." -ForegroundColor Green
cd fe
docker build -t xinchaoduyanh2/fe:latest .
docker push xinchaoduyanh2/fe:latest
cd ..

Write-Host "All images built and pushed successfully!" -ForegroundColor Green 