# Kafka Test Service - Debug Guide

## Vấn đề đã phát hiện

Từ log error, chúng ta thấy 2 vấn đề chính:

### 1. **Kafka Broker Address Mismatch**

```
ERROR [Connection] Connection error: connect ECONNREFUSED 172.20.0.4:9092
```

**Nguyên nhân**: Service đang cố kết nối đến `kafka:9092` nhưng trong Kubernetes, service name là `kafka-broker-service:9092`

**Giải pháp**: Đã sửa trong `main.ts`:

```typescript
brokers: [process.env.KAFKA_BROKER ?? "kafka-broker-service:9092"];
```

### 2. **KafkaJS Warning**

```
WARN [undefined] KafkaJS v2.0.0 switched default partitioner
```

**Giải pháp**: Đã thêm environment variable `KAFKAJS_NO_PARTITIONER_WARNING=1`

## Cấu hình Environment Variables

### Local Development

```bash
KAFKA_BROKER=kafka:9092
```

### Kubernetes

```bash
KAFKA_BROKER=kafka-broker-service:9092
KAFKAJS_NO_PARTITIONER_WARNING=1
```

## Deployment Steps

### 1. Đảm bảo Kafka đang chạy

```bash
kubectl apply -f ../k8s/kafka.yaml
kubectl get pods -l app=kafka-broker-service
```

### 2. Deploy test-service

```bash
cd test-service
./deploy-kafka-test.ps1
```

### 3. Test connectivity

```bash
./test-kafka-simple.ps1
```

## Debug Commands

### Kiểm tra Kafka service

```bash
kubectl get service kafka-broker-service
kubectl get pods -l app=kafka-broker-service
```

### Xem logs

```bash
# Test service logs
kubectl logs -l app=test-service -f

# Kafka logs
kubectl logs -l app=kafka-broker-service -f
```

### Test network connectivity

```bash
# Exec vào test-service pod
kubectl exec -it <test-service-pod> -- sh

# Test kết nối đến Kafka
nc -zv kafka-broker-service 9092
```

## Expected Behavior

### Success Case

```
[Nest] LOG [Bootstrap] 🚀 Test Kafka Microservice is running and listening for messages.
[Nest] LOG [Bootstrap] [TEST-SERVICE] KAFKA_BROKER: kafka-broker-service:9092
```

### Error Cases

1. **Connection refused**: Kafka chưa sẵn sàng hoặc service name sai
2. **No leader for topic**: Kafka đang khởi động
3. **ECONNREFUSED**: Network connectivity issues

## Troubleshooting

### 1. Kafka không chạy

```bash
kubectl apply -f ../k8s/kafka.yaml
kubectl wait --for=condition=ready pod -l app=kafka-broker-service --timeout=300s
```

### 2. Service name không đúng

Kiểm tra `kubectl get services` để xem tên service chính xác

### 3. Network issues

Kiểm tra namespace và network policies

## So sánh với các service khác

Các service khác cũng gặp vấn đề tương tự vì chúng đều sử dụng Kafka. Test-service này giúp:

1. **Isolate vấn đề**: Chỉ test Kafka connectivity
2. **Debug configuration**: Xác định cấu hình đúng
3. **Validate setup**: Đảm bảo Kafka hoạt động trước khi deploy service khác
