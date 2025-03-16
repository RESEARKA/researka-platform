FROM node:16-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY deployment/nginx/researka.conf /etc/nginx/conf.d/default.conf

# Expose ports
EXPOSE 80 443

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
