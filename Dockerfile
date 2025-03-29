FROM node:18-buster-slim

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript using npx to avoid permission issues
RUN npm run build

# Command to run when container starts
CMD ["node", "dist/index.js"]