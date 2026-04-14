FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g pnpm

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001
CMD ["node", "dist/main.js"]
