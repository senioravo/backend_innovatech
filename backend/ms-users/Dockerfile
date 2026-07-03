FROM node:26-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src ./src
COPY scripts ./scripts
COPY tsconfig.json ./
RUN npm run build
RUN npm prune --omit=dev

ENV NODE_ENV=production
EXPOSE 3003

CMD ["node", "dist/app.js"]
