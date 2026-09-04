# ============================================
# Multi-stage Dockerfile for Next.js
# ============================================

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_GATEWAY_URL=http://localhost:8080
ARG NEXT_PUBLIC_BIDDING_SOCKET_PATH=/bidding-socket
ARG NEXT_PUBLIC_VNPT_EKYC_BACKEND_URL=
ARG NEXT_PUBLIC_VNPT_EKYC_TOKEN_KEY=
ARG NEXT_PUBLIC_VNPT_EKYC_TOKEN_ID=
ARG NEXT_PUBLIC_VNPT_EKYC_AUTH=
ENV NEXT_PUBLIC_GATEWAY_URL=${NEXT_PUBLIC_GATEWAY_URL}
ENV NEXT_PUBLIC_BIDDING_SOCKET_PATH=${NEXT_PUBLIC_BIDDING_SOCKET_PATH}
ENV NEXT_PUBLIC_VNPT_EKYC_BACKEND_URL=${NEXT_PUBLIC_VNPT_EKYC_BACKEND_URL}
ENV NEXT_PUBLIC_VNPT_EKYC_TOKEN_KEY=${NEXT_PUBLIC_VNPT_EKYC_TOKEN_KEY}
ENV NEXT_PUBLIC_VNPT_EKYC_TOKEN_ID=${NEXT_PUBLIC_VNPT_EKYC_TOKEN_ID}
ENV NEXT_PUBLIC_VNPT_EKYC_AUTH=${NEXT_PUBLIC_VNPT_EKYC_AUTH}
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV UV_THREADPOOL_SIZE=64

RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Leverage Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
