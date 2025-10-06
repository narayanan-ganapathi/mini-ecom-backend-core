# Base image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy dependencies first (for better caching)
COPY package*.json ./

RUN npm install --production

# Copy the rest of your app
COPY . .

# Expose the port your Node.js app runs on
EXPOSE 5000

# Start command
CMD ["node", "src/index.js"]
