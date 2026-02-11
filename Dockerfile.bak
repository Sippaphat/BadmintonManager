# Node.js build and serve stage
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files first to leverage cache
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build argument for API base URL
ARG VITE_API_BASE=http://localhost:5000
ENV VITE_API_BASE=$VITE_API_BASE

# Build the application
RUN npm run build

# Install serve to host static files
RUN npm install -g serve

# Expose server port and web port
EXPOSE 9009

# Start server in background and serve the built application
CMD sh -c "cd /app/server && node index.js & cd /app && serve -s dist -l 9009"
