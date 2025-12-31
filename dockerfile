# Use Node 24
FROM node:24-alpine

# App directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install deps
RUN npm install

# Copy rest of the source
COPY . .

# Build TypeScript
RUN npm run build

# Expose app port
EXPOSE 3001

# Start app
CMD ["npm", "run", "start"]
