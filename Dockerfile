FROM node:16 AS react-build
RUN mkdir /app
COPY ./ /app
WORKDIR /app
RUN chown node /app -R
RUN npm install --global serve
USER node
ARG OPENIMIS_CONF_JSON
ENV OPENIMIS_CONF_JSON=${OPENIMIS_CONF_JSON}
ENV NODE_ENV=production 
RUN npm run load-config
RUN npm install 
RUN npm run build
RUN apt-get update && apt-get install -y nano openssl software-properties-common 
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/localhost.key -out /etc/ssl/certs/localhost.crt -subj "/C=BE/ST=_/L=_/O=_/OU=_/CN=localhost"

### NGINX


FROM nginx:latest
#COPY APP
COPY --from=build-stage /app/build/ /usr/share/nginx/html
#COPY DEFAULT CERTS
COPY --from=build-stage /etc/ssl/private /etc/letsencrypt/live/localhost

COPY conf/openimis.conf /conf/openimis.conf
COPY script/entrypoint.sh /script/entrypoint.sh
RUN chmod a+x /script/entrypoint.sh
WORKDIR /script

ENV NEW_OPENIMIS_HOST = "localhost"
ENV ROOT_URI = "front"
ENV ROOT_API = "api"
ENV ROOT_MOBILEAPI = "rest"


ENTRYPOINT ["/bin/bash","/script/entrypoint.sh"]
