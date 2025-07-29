# Dockerfile cho mail-service

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Cài đặt pnpm global, sau đó cài đặt TẤT CẢ dependencies (bao gồm devDependencies)
# Điều này đảm bảo @nestjs/cli có sẵn cho lệnh 'nest build'
RUN npm install -g pnpm && pnpm install
RUN pnpm i --save-dev @types/node
COPY . .

RUN pnpm run build

EXPOSE 8082
CMD ["pnpm", "run", "start:prod"]