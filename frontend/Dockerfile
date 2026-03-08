FROM node:22.20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies from lockfile for deterministic and faster rebuilds.
RUN npm ci --no-audit --no-fund

# Copy project files
COPY . .

# Expose port 3000
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]