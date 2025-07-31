# Hướng dẫn Triển khai và Dọn dẹp Kubernetes

Tài liệu này cung cấp các bước để dọn dẹp và triển khai lại ứng dụng của bạn trên môi trường Kubernetes, đảm bảo các dịch vụ hoạt động ổn định và nhất quán.

---

## 🚀 Các lệnh Triển khai

Bạn có thể chạy script triển khai tùy thuộc vào hệ điều hành của mình:

### Đối với Windows (PowerShell)

```powershell
.\k8s\cleanup-and-deploy-simple.ps1



Sau đó chạy lệnh kubectl get pods -A để kiểm tra và yêu cầu tất cả pod k bị lỗi