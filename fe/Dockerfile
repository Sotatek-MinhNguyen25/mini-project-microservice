# Sử dụng image Node.js 18 dựa trên Alpine Linux để có kích thước nhỏ gọn
FROM node:18-alpine

# Đặt thư mục làm việc bên trong container
WORKDIR /app

# Copy các file package.json và pnpm-lock.yaml
# để tận dụng Docker cache. Nếu các file này không thay đổi,
# bước cài đặt dependency sẽ không chạy lại.
COPY package.json pnpm-lock.yaml ./

# Cài đặt pnpm toàn cục, sau đó cài đặt TẤT CẢ các dependency của dự án.
# Việc bỏ cờ '--prod' sẽ đảm bảo các gói devDependencies (bao gồm các công cụ build
# và các @types/ cần thiết cho TypeScript/Next.js) được cài đặt.
RUN npm install -g pnpm && pnpm install

# Copy toàn bộ mã nguồn của ứng dụng vào thư mục làm việc trong container.
# Bước này bao gồm cả tsconfig.json và các thư mục chứa components, contexts, hooks,
# đảm bảo Next.js có thể tìm thấy các module được import bằng path aliases.
COPY . .

# Chạy lệnh build của dự án Next.js.
# Next.js sẽ sử dụng các dependency đã được cài đặt và cấu hình trong tsconfig.json
# để biên dịch mã nguồn.
RUN pnpm run build

# Khai báo cổng mà ứng dụng frontend sẽ lắng nghe (mặc định cho Next.js là 3000).
EXPOSE 3000

# Lệnh mặc định để chạy ứng dụng khi container khởi động.
# Sử dụng 'start' hoặc 'start:prod' tùy theo script trong package.json của bạn.
CMD ["pnpm", "run", "start"]
