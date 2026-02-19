cd /app
echo "start dev setup"
mkdir ~/.npm-global -p
rm -rf ~/.npm-global/*
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
source ~/.bashrc  # or ~/.zshrc, ~/.bash_profile, etc., depending on your shell
echo "prepare dev setup"
npm install yargs shelljs
node ./dev_tools/entrypoint-dev.js -c /app/openimis-dev.json -p /frontend-packages
echo "Updating package.json"
node ./openimis-config-vite.js -c /app/openimis-dev.json -p /frontend-packages
echo "Install application"
npm install  --include=dev --legacy-peer-deps
echo "Application has been updated!, will start now"
npm start -- --host --port 3000