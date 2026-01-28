#!/bin/bash
cd /openimis-fe_js
npm i shelljs yargs
# node dev_tools/entrypoint-dev.js -c openimis.json -p ../frontend-packages/
# node openimis-config-vite.js -c openimis.json -p ../frontend-packages/
node dev_tools/entrypoint-dev.js -c openimis-dev.json -p ../frontend-packages/
node openimis-config-vite.js -c openimis-dev.json -p ../frontend-packages/

npm install
yarn start --host
