FROM node:16 AS react-build
RUN mkdir /app
COPY ./ /app
WORKDIR /app
RUN chown node /app -R
USER node
ARG OPENIMIS_CONF_JSON
ENV OPENIMIS_CONF_JSON=${OPENIMIS_CONF_JSON}
RUN npm run load-config
RUN npm  install
RUN npm  run build
RUN npm install --global serve
CMD ["yarn","start"]
