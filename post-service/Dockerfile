# Sử dụng image Node.js 18 dựa trên Alpine Linux để có kích thước nhỏ gọn
FROM node:18-alpine

# Đặt thư mục làm việc bên trong container
WORKDIR /app

# Copy các file package*.json để tận dụng Docker cache.
# Nếu các file này không thay đổi, bước cài đặt dependency sẽ không chạy lại.
COPY package*.json ./

# Cài đặt pnpm toàn cục, sau đó cài đặt TẤT CẢ các dependency của dự án (bao gồm devDependencies).
# Việc bỏ cờ '--prod' sẽ đảm bảo các gói @types/ cần thiết cho quá trình build được cài đặt.
RUN npm install -g pnpm && pnpm install

# Cài đặt NestJS CLI toàn cục. Đây là bước quan trọng để lệnh 'nest build' hoạt động.
# Lệnh này phải chạy TRƯỚC khi bạn cố gắng build ứng dụng NestJS.
RUN npm install -g @nestjs/cli

# Copy thư mục prisma (chứa schema.prisma) vào container.
# Đây là bước quan trọng để Prisma có thể tìm thấy schema của nó.
# Giả định thư mục prisma nằm ở gốc của context build.
COPY prisma ./prisma/

# Chạy lệnh generate của Prisma để tạo client.
# Lệnh này cần chạy sau khi các dependencies và schema đã được copy.
RUN npx prisma generate

# Copy toàn bộ mã nguồn của ứng dụng vào thư mục làm việc trong container.
# Bước này nên đặt sau khi cài đặt dependency để tận dụng cache hiệu quả.
# Đảm bảo rằng file schema.prisma đã được copy trước đó.
COPY . .

# Chạy lệnh build của dự án NestJS.
# Vì @nestjs/cli đã được cài đặt toàn cục và các @types/ đã được cài đặt,
# lệnh 'nest build' sẽ được tìm thấy và biên dịch thành công.
RUN pnpm run build

# Khai báo cổng mà ứng dụng sẽ lắng nghe.
# Cổng 8084 được sử dụng trong ví dụ này.
EXPOSE 3002

# Lệnh mặc định để chạy ứng dụng khi container khởi động.
# Sử dụng 'start:prod' để chạy phiên bản đã được build.
CMD ["pnpm", "run", "start:prod"]
