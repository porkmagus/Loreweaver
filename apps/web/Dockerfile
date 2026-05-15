FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/
RUN npm install

# Copy source
COPY tsconfig.json ./
COPY packages/shared/ ./packages/shared/
COPY apps/web/ ./apps/web/

# Build
RUN npm run build -w packages/shared && npm run build -w apps/web

# Production stage: serve with a static server
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g serve

COPY --from=builder /app/apps/web/dist ./dist

EXPOSE 5173

CMD ["serve", "dist", "-l", "5173"]
