#!/bin/bash
cd /app
echo "Prepare dev setup"


yarn install shelljs
# Install required global dependencies
echo "Installing global dependencies"
# Run the entrypoint-dev.js script
echo "Running entrypoint-dev.js"
node ./dev_tools/entrypoint-dev.js -c /app/openimis-dev.json -p /frontend-packages

# Update package.json
echo "Updating package.json"
node ./openimis-config.js openimis-dev.json
echo "Install application"
yarn install --legacy-peer-deps --include=dev
echo "Application has been updated!, will start now"
yarn dev
