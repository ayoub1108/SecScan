
# EXAMPLE: DO NOT USE IN PRODUCTION
# This is a demonstration file showing what NOT to do

FROM ubuntu:20.04

# Medium: Running as root
# Should use a non-root user instead

# High: Hardcoded credentials in Dockerfile
ENV DB_PASSWORD=insecure_password
ENV API_KEY=1234567890abcdef

# Install dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    curl \
    wget \
    unzip

# Low: Using latest tag for base image (unpredictable)
FROM node:latest

# Medium: Exposing unnecessary ports
EXPOSE 22 80 443 8080 3306

# Copy application code
COPY . /app

# Low: Using a wildcard in COPY
COPY * /app/

# Run the application
CMD ["nginx", "-g", "daemon off;"]
