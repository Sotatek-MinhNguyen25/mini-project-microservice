FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install -g pnpm && pnpm install 
RUN npm install -g @nestjs/cli


COPY prisma ./prisma/

# Chạy lệnh generate của Prisma để tạo client.
# Lệnh này cần chạy sau khi các dependencies và schema đã được copy.
RUN npx prisma generate
COPY . .

RUN pnpm run build

EXPOSE 8082

CMD ["pnpm", "run", "start:prod"] 