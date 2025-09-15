# ============= deps =============
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ============= builder ==========
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Aggiungi gli ARG per le variabili necessarie durante il build
ARG NEXT_PUBLIC_BACKEND_API_URL
ARG NEXT_PUBLIC_BETTER_AUTH_URL
ARG MONGODB_URI
ARG BETTER_AUTH_SECRET
ARG BACKEND_API_URL
ARG API_JWT_SECRET
ARG BETTER_AUTH_URL
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG GITHUB_CLIENT_ID
ARG GITHUB_CLIENT_SECRET
ARG GMAIL_USER
ARG GMAIL_PASS
ARG EMAIL_VERIFICATION_CALLBACK_URL

# Converti gli ARG in ENV per il processo di build
ENV NEXT_PUBLIC_BACKEND_API_URL=$NEXT_PUBLIC_BACKEND_API_URL
ENV NEXT_PUBLIC_BETTER_AUTH_URL=$NEXT_PUBLIC_BETTER_AUTH_URL
ENV MONGODB_URI=$MONGODB_URI
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV BACKEND_API_URL=$BACKEND_API_URL
ENV API_JWT_SECRET=$API_JWT_SECRET
ENV BETTER_AUTH_URL=$BETTER_AUTH_URL
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
ENV GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID
ENV GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET
ENV GMAIL_USER=$GMAIL_USER
ENV GMAIL_PASS=$GMAIL_PASS
ENV EMAIL_VERIFICATION_CALLBACK_URL=$EMAIL_VERIFICATION_CALLBACK_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ============= runner ===========
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]