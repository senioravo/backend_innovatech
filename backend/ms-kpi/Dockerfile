FROM node:26-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY src ./src
COPY keys ./keys
COPY tsconfig.json ./
RUN npm run build
RUN npm prune --omit=dev

ENV NODE_ENV=production
EXPOSE 3004

CMD ["node", "dist/app.js"]
