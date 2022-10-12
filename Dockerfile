FROM node:16-alpine AS react-build
RUN apk update && apk upgrade
RUN mkdir app
COPY ./ /app
WORKDIR /app
ARG OPENIMIS_CONF_JSON
ENV OPENIMIS_CONF_JSON=${OPENIMIS_CONF_JSON}
RUN yarn load-config
# The network-timeout is necessary for slow systems like the Raspberry Pi
RUN yarn install --network-timeout 100000
RUN yarn build
RUN yarn global add serve
CMD ["yarn","start"]
