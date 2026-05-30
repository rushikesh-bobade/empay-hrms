FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p uploads/avatars

EXPOSE 5000

CMD ["node", "src/app.js"]
