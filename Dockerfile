# Use an official lightweight nginx image
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy all static files from the app to nginx html dir
COPY . .

# Expose port 80
EXPOSE 80

# No CMD needed, nginx default is fine
