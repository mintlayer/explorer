# -------------------------
# Build Stage
# -------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (full, with dev deps)
COPY package*.json ./
RUN npm ci

# Copy all source code
COPY . .

# Build Next.js standalone
RUN npm run build


# -------------------------
# Production Dependencies Stage
# -------------------------
FROM node:22-alpine AS prod-deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts


# -------------------------
# Runner Stage (final image)
# -------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Copy production dependencies for worker entrypoints
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/package*.json ./

# Copy standalone web output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy worker sources and runtime assets so the same image can be used
# for the web Deployment and Kubernetes CronJobs.
COPY --from=builder /app/workers ./workers
COPY --from=builder /app/src/utils/mintlayer-crypto/pkg ./src/utils/mintlayer-crypto/pkg

ENV HOSTNAME=0.0.0.0

# Run the production server
CMD ["node", "server.js"]
