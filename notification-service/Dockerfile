FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install -g pnpm && pnpm install --prod
RUN npm install -g @nestjs/cli
COPY . .
RUN npx prisma generate
RUN pnpm run build

EXPOSE 8006
CMD ["pnpm", "run", "start:prod"] 