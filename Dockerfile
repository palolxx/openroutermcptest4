FROM node:18-slim

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the TypeScript project
RUN npm run build

# Command to run when starting the container
CMD ["node", "dist/index.js"] 