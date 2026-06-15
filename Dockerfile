FROM node:24 AS dev-stage

# Install system dependencies
RUN apt-get update && apt-get install -y nano openssl software-properties-common

# Generate self-signed SSL certificate
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/privkey.pem \
    -out /etc/ssl/private/fullchain.pem \
    -subj "/C=DE/ST=_/L=_/O=_/OU=_/CN=localhost"

# Set up global npm directory
RUN mkdir -p /home/node/.npm-global 
RUN chown node:node /home/node/.npm-global 
RUN npm config set prefix /home/node/.npm-global 
RUN mkdir -p  /usr/local/lib/node_modules
RUN chown node:node  /usr/local/lib/node_modules
RUN npm config set prefix  /usr/local/lib/node_modules

# Create /frontend-packages directory with proper permissions
RUN mkdir -p /frontend-packages && chown node:node /frontend-packages

# Create and set permissions for /openimis-fe_js
RUN mkdir /openimis-fe_js
WORKDIR /openimis-fe_js
COPY ./ /openimis-fe_js
RUN chown node:node /openimis-fe_js -R
# Set environment variables
ARG OPENIMIS_CONF_JSON
ENV OPENIMIS_CONF_JSON=${OPENIMIS_CONF_JSON}
ENV NODE_ENV=development
USER node
ENTRYPOINT ["/bin/bash", "/openimis-fe_js/script/entrypoint-dev.sh"]

FROM dev-stage AS build-stage
USER node
ARG MODE=production
ENV GENERATE_SOURCEMAP=true
ENV NODE_ENV=$MODE
# NPM reliability settings
RUN npm config set fetch-timeout 600000 && \
    npm config set fetch-retry-mintimeout 30000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set maxsockets 4
RUN npm config set prefix /home/node/.npm-global
RUN npm install -g npm@latest
RUN npm install -g shelljs yargs
RUN npm install --legacy-peer-deps --include=dev
RUN node ./openimis-config-vite.js -c ./openimis.json
RUN npm install --legacy-peer-deps --include=dev
RUN npx vite build --mode $MODE

FROM nginx:latest
COPY --from=build-stage /openimis-fe_js/dist/ /usr/share/nginx/html
COPY --from=build-stage /etc/ssl/private/ /etc/nginx/ssl/live/host
COPY ./conf /conf
COPY ./script/entrypoint.sh /script/entrypoint.sh
RUN openssl dhparam -out /etc/nginx/dhparam.pem 2048
RUN chmod a+x /script/entrypoint.sh
WORKDIR /script
ENV DATA_UPLOAD_MAX_MEMORY_SIZE=12582912
ENV NEW_OPENIMIS_HOST="localhost"
ENV PUBLIC_URL="front"
ENV REACT_APP_API_URL="api"
ENV REACT_APP_SENTRY_DSN=""
ENV ROOT_MOBILEAPI="rest"
ENV FORCE_RELOAD=""
ENV OPENSEARCH_PROXY_ROOT="opensearch"
ENTRYPOINT ["/bin/bash", "/script/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
