# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build argument for API base URL
ARG VITE_API_BASE=https://badminton-api.xenocer.com
ENV VITE_API_BASE=$VITE_API_BASE

# Build argument for Google Client ID
ARG VITE_GOOGLE_CLIENT_ID=634347628772-ot3d906un0ar1oq5p3b98tci67l99non.apps.googleusercontent.com
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Build the application
RUN pnpm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install serve
RUN npm install -g serve

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Expose port 9009
EXPOSE 9009

# Start serve
CMD ["serve", "-s", "dist", "-l", "9009"]
