# 1️⃣ Build Stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and lockfile
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the app
COPY . .

# Build the Next.js app
RUN npm run build

# 2️⃣ Production Stage
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Copy package.json and lockfile
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy build output from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./ 

# Expose port
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "run", "start"]
