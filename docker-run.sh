#!/bin/bash

# Build the Docker image
echo "Building Docker image..."
docker build -t invoify-dev .

# Run the container
echo "Starting Invoify in development mode..."
docker run -p 3000:3000 \
  -e PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  -e PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
  invoify-dev 