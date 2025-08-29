FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json if present
COPY package*.json ./

# Install dependencies
RUN npm install || true

# Copy the rest of the app
COPY . .

# Expose port 8989
EXPOSE 8989

# Start the backend on port 8989
CMD ["node", "backend.js"]
