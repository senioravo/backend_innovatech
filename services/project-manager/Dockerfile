FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY scripts ./scripts
COPY db ./db

ENV NODE_ENV=production
EXPOSE 3002

CMD ["node", "src/app.js"]
