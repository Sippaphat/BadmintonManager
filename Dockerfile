# Stage 1: Build the React Application
FROM node:18-alpine as build

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build argument for API base URL
ARG VITE_API_BASE=https://badminton.xenocer.com/
ENV VITE_API_BASE=$VITE_API_BASE

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
