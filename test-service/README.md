# Test Service

Một microservice đơn giản để test việc deploy lên Kubernetes.

## Tính năng

- Health check endpoint
- Service information endpoint
- Hello world endpoint
- CORS enabled
- Health checks cho Kubernetes

## Các endpoint

- `GET /api` - Hello message
- `GET /api/health` - Health check
- `GET /api/info` - Service information

## Chạy locally

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm run start:dev

# Build and run in production mode
pnpm run build
pnpm run start:prod
```

## Build Docker image

```bash
# Build image
docker build -t test-service:latest .

# Run container
docker run -p 3010:3010 test-service:latest
```

## Deploy lên Kubernetes

```bash
# Build Docker image
docker build -t xinchaoduyanh2/test-service:latest .

# Apply Kubernetes manifests
kubectl apply -f ../k8s/test-service.yaml

# Check deployment status
kubectl get pods -l app=test-service
kubectl get services -l app=test-service
kubectl get configmaps -l app=test-service

# Test service
kubectl port-forward service/test-service 8080:3010
curl http://localhost:8080/api/health
```

## Cấu trúc project

```
test-service/
├── src/
│   ├── main.ts          # Entry point
│   ├── app.module.ts    # Root module
│   ├── app.controller.ts # Controllers
│   └── app.service.ts   # Services
├── Dockerfile           # Docker configuration
├── package.json         # Dependencies
├── pnpm-workspace.yaml  # PNPM workspace config
└── tsconfig.json        # TypeScript config
```

## Environment Variables

- `PORT` - Port để chạy service (default: 3010)
- `NODE_ENV` - Environment (development/production) 