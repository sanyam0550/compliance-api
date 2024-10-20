FROM node:21.7-bullseye-slim

# Set environment variables
ENV NODE_ENV=production \
    PROJECT_HOME=/usr/app/ \
    PUPPETEER_SKIP_DOWNLOAD=true \
    NODE_TLS_REJECT_UNAUTHORIZED="0"

# Create project home directory
RUN mkdir -p ${PROJECT_HOME}

# Set working directory
WORKDIR ${PROJECT_HOME}


# Install essential system dependencies and Chromium for Puppeteer
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl \
    chromium \
    && rm -rf /var/lib/apt/lists/*

# Update npm to the latest version globally
RUN npm install -g npm@latest @nestjs/cli

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ${PROJECT_HOME}

# Install npm dependencies, omitting devDependencies for production
RUN npm install --quiet --omit=dev

# Clear npm cache to reduce image size
RUN npm cache clean --force

# Copy application source code to the container
COPY . ${PROJECT_HOME}

# Build the Node.js application (optional step if your app has a build process)
RUN npm run build

# Expose necessary port (adjust based on your application)
EXPOSE 3000

# Start the application directly using Node.js in production mode
CMD ["npm", "run", "start:prod"]
