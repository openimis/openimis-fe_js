cd /app
echo "Prepare dev setup"
mkdir ~/.npm-global
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
source ~/.bashrc  # or ~/.zshrc, ~/.bash_profile, etc., depending on your shell
node ./dev_tools/entrypoint-dev.js -c ./openimis-dev.json -p /frontend-packages
echo "Updating package.json"
node ./modules-config.js openimis-dev.json
echo "Install application"
npm install 
echo "Application has been updated!, will start now"
npx vite  -- openimis-dev.json