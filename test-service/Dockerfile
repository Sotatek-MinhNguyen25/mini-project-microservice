FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install -g pnpm && pnpm install
RUN npm install -g @nestjs/cli

COPY . .

RUN pnpm run build

EXPOSE 3010

CMD ["pnpm", "run", "start:prod"]