cd /openimis-fe_js
echo "start dev setup"
# mkdir ~/.npm-global -p
# rm -rf ~/.npm-global/*
# npm config set prefix ~/.npm-global
# export PATH=~/.npm-global/bin:$PATH
# source ~/.bashrc  # or ~/.zshrc, ~/.bash_profile, etc., depending on your shell
echo "prepare dev setup"
npm install yargs shelljs --legacy-peer-deps

# Check if install.lock exists
if [ ! -f install.lock ]; then
    echo "Installing modules..."
    node ./dev_tools/entrypoint-dev.js -c /openimis-fe_js/openimis-dev.json -p /frontend-packages
    # Create lock file after successful installation
    touch install.lock
    echo "Modules installed and lock file created."
else
    echo "Modules already installed (install.lock exists). Skipping module installation."
fi
echo "Updating package.json"
node ./openimis-config-vite.js -c /openimis-fe_js/openimis-dev.json -p /frontend-packages
echo "Install application"
npm install  --include=dev --legacy-peer-deps
echo "Application has been updated!, will start now"
npm start -- --host --port 3000

