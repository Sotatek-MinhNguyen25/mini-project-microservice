FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 8081

CMD ["npm", "run", "start:prod"] 