FROM node:16 AS build-stage
RUN mkdir /app
COPY ./ /app
WORKDIR /app
RUN chown node /app -R
RUN npm install --global serve
RUN apt-get update && apt-get install -y nano openssl software-properties-common 
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/privkey.pem -out /etc/ssl/private/fullchain.pem -subj "/C=DE/ST=_/L=_/O=_/OU=_/CN=localhost"
USER node
ARG OPENIMIS_CONF_JSON
ENV OPENIMIS_CONF_JSON=${OPENIMIS_CONF_JSON}
ENV NODE_ENV=production
RUN npm run load-config
RUN npm install 
RUN npm run build


### NGINX


FROM nginx:latest
#COPY APP
COPY --from=build-stage /app/build/ /usr/share/nginx/html
#COPY DEFAULT CERTS
COPY --from=build-stage /etc/ssl/private/ /etc/nginx/ssl/live/host

COPY conf/openimis.conf /conf/openimis.conf
COPY script/entrypoint.sh /script/entrypoint.sh
RUN chmod a+x /script/entrypoint.sh
WORKDIR /script
ENV DATA_UPLOAD_MAX_MEMORY_SIZE=12582912
ENV NEW_OPENIMIS_HOST="localhost"
ENV PUBLIC_URL="front"
ENV REACT_APP_API_URL="api"
ENV ROOT_MOBILEAPI="rest"
ENV FORCE_RELOAD=""

ENTRYPOINT ["/bin/bash","/script/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
