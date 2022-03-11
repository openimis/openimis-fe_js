FROM node:16 AS react-build
RUN mkdir app
COPY ./ /app
WORKDIR /app
ARG OPENIMIS_CONF_JSON
ENV OPENIMIS_CONF_JSON=${OPENIMIS_CONF_JSON}
RUN yarn load-config
RUN yarn install
RUN yarn build
RUN yarn global add serve
CMD ["yarn","start"]
