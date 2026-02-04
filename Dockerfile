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

# Install serve to host static files
RUN npm install -g serve

# Expose port 8000
EXPOSE 8000

# Serve the built application on port 8000
CMD ["serve", "-s", "dist", "-l", "8000"]
