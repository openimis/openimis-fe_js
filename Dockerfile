FROM node:16 AS react-build
RUN mkdir /app
COPY ./ /app
WORKDIR /app
RUN chown node /app -R
USER node
ARG OPENIMIS_CONF_JSON
ENV OPENIMIS_CONF_JSON=${OPENIMIS_CONF_JSON}
ENV NODE_ENV=production 
RUN npm run load-config
RUN npm cache clean --force  && npm install --force
RUN npm run build
RUN npm install serve --global
CMD ["npm","start"]
