# -------------------------
# Build Stage
# -------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (full, with dev deps)
COPY package*.json ./
RUN npm ci

# Copy all source code
COPY . .

# Build Next.js standalone
RUN npm run build


# -------------------------
# Runner Stage (final image)
# -------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only the standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

ENV HOSTNAME=0.0.0.0

# Run the production server
CMD ["node", "server.js"]
