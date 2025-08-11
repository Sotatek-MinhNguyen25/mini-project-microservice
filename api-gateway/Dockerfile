FROM node:18-alpine

# Đặt thư mục làm việc bên trong container
WORKDIR /app

# Copy các file package.json và pnpm-lock.yaml (hoặc package-lock.json)
# để tận dụng Docker cache. Nếu các file này không thay đổi,
# bước cài đặt dependency sẽ không chạy lại.
COPY package*.json ./

# Cài đặt pnpm toàn cục, sau đó cài đặt các dependency của dự án.
# @nestjs/cli là một devDependency, nên nó sẽ không được cài đặt với --prod.
# Chúng ta sẽ cài đặt nó riêng biệt.
RUN npm install -g pnpm && pnpm install --prod

# Cài đặt NestJS CLI toàn cục. Đây là bước quan trọng để lệnh 'nest build' hoạt động.
# Lệnh này phải chạy TRƯỚC khi bạn cố gắng build ứng dụng NestJS.
RUN npm install -g @nestjs/cli
RUN npm i --save-dev @types/node
# Copy toàn bộ mã nguồn của ứng dụng vào thư mục làm việc trong container.
# Bước này nên đặt sau khi cài đặt dependency để tận dụng cache hiệu quả.
COPY . .

# Chạy lệnh build của dự án NestJS.
# Vì @nestjs/cli đã được cài đặt toàn cục, lệnh 'nest build' sẽ được tìm thấy.
RUN pnpm run build

# Khai báo cổng mà ứng dụng sẽ lắng nghe.
EXPOSE 8000

# Lệnh mặc định để chạy ứng dụng khi container khởi động.
# Sử dụng 'start:prod' để chạy phiên bản đã được build.
CMD ["pnpm", "run", "start:prod"]