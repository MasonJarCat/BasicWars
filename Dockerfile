# syntax = docker/dockerfile:1

# Use Node.js version 18.17.1
ARG NODE_VERSION=18.17.1
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Node.js"

# Set the working directory for the app
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install dependencies only
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy the application code into the container
COPY . .

# Expose the application port
EXPOSE 3000

# Start the server by default
CMD ["npm", "run", "start"]
