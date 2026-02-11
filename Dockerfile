FROM node:18-alpine

WORKDIR /app

# Install pnpm and serve
RUN npm install -g pnpm serve

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build argument for API base URL
ARG VITE_API_BASE=https://badminton.xenocer.com
ENV VITE_API_BASE=$VITE_API_BASE

# Build argument for Google Client ID
ARG VITE_GOOGLE_CLIENT_ID=634347628772-ot3d906un0ar1oq5p3b98tci67l99non.apps.googleusercontent.com
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Build the application
RUN pnpm run build

# Expose port 8000 for serve
EXPOSE 8000

# Start serve
CMD ["serve", "-s", "dist", "-l", "8000"]
