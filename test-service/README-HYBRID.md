# Hybrid HTTP+Kafka Test Service

Service này kết hợp cả HTTP server và Kafka consumer để giải quyết vấn đề health checks trong Kubernetes.

## Vấn đề ban đầu

Khi chuyển từ HTTP service sang Kafka consumer thuần túy:

- ✅ **Kafka connectivity hoạt động tốt**
- ❌ **Kubernetes không biết service đã sẵn sàng** (READY 0/1)
- ❌ **Không có health check endpoint**

## Giải pháp Hybrid

### Cấu trúc

- **HTTP Server**: Chạy trên port 3010 để health checks
- **Kafka Consumer**: Lắng nghe Kafka messages
- **Cả hai cùng chạy** trong cùng một process

### HTTP Endpoints

```
GET /api - Hello message
GET /api/health - Health check (cho Kubernetes)
GET /api/info - Service information
```

### Kafka Topics

```
test-topic - Test messages
health-check - Health check requests
ping - Ping/pong messages
```

## Deployment

### 1. Rebuild và deploy

```powershell
cd test-service
./rebuild-hybrid.ps1
```

### 2. Kiểm tra status

```bash
kubectl get pods -l app=test-service
```

### 3. Test HTTP endpoints

```bash
kubectl port-forward service/test-service 8080:3010
curl http://localhost:8080/api/health
curl http://localhost:8080/api/info
```

### 4. Xem logs

```bash
kubectl logs -l app=test-service -f
```

## Kubernetes Configuration

### Health Checks

```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3010
  initialDelaySeconds: 30
  periodSeconds: 10
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /api/health
    port: 3010
  initialDelaySeconds: 15
  periodSeconds: 5
  failureThreshold: 3
```

### Environment Variables

```yaml
NODE_ENV: "production"
PORT: "3010"
KAFKA_BROKER: "kafka-broker-service:9092"
KAFKAJS_NO_PARTITIONER_WARNING: "1"
```

## Expected Behavior

### Success Case

```
[Nest] LOG [Bootstrap] 🚀 Test Service is running on: http://localhost:3010
[Nest] LOG [Bootstrap] 📊 Health check: http://localhost:3010/api/health
[Nest] LOG [Bootstrap] 📨 Kafka Microservice is listening for messages.
[Nest] LOG [Bootstrap] [TEST-SERVICE] KAFKA_BROKER: kafka-broker-service:9092
```

### Pod Status

```
NAME                    READY   STATUS    RESTARTS   AGE
test-service-xxx        1/1     Running   0          2m
```

## Lợi ích

1. **Kubernetes Health Checks**: Service được mark là READY
2. **Kafka Connectivity**: Vẫn có thể test Kafka
3. **Debug Friendly**: Có HTTP endpoints để test
4. **Production Ready**: Phù hợp với Kubernetes best practices

## So sánh với các service khác

Các service khác có thể áp dụng pattern tương tự:

- **auth-service**: HTTP + Kafka consumer
- **post-service**: HTTP + Kafka consumer
- **notification-service**: HTTP + Kafka consumer

Pattern này giúp:

- **Isolate vấn đề**: Test từng component riêng biệt
- **Gradual migration**: Chuyển đổi từng bước
- **Better observability**: Có metrics và health checks
