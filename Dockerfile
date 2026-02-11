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
ARG VITE_API_BASE=https://badminton.xenocer.com/
ENV VITE_API_BASE=$VITE_API_BASE

# Build the application
RUN pnpm run build

# Expose port 3000 for serve
EXPOSE 3000

# Start serve
CMD ["serve", "-s", "dist", "-l", "3000"]
