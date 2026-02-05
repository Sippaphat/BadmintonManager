# Node.js build and serve stage
FROM node:18-alpine

WORKDIR /app

# Copy package files first to leverage cache
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Install server dependencies
WORKDIR /app/server
COPY server/package.json server/pnpm-lock.yaml* ./
RUN npm install

# Install serve to host static files
RUN npm install -g serve

# Go back to app root
WORKDIR /app

# Expose server port and web port
EXPOSE 5000 9009

# Start server in background and serve the built application
CMD sh -c "cd /app/server && node index.js & cd /app && serve -s dist -l 9009"
