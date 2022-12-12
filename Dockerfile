FROM node:16 AS react-build
RUN mkdir /app
COPY ./ /app
WORKDIR /app
RUN chown node /app -R
USER node
ARG OPENIMIS_CONF_JSON
ENV OPENIMIS_CONF_JSON=${OPENIMIS_CONF_JSON}
RUN yarn load-config
RUN echo "package.json with module injected" && cat ./package.json
RUN yarn cache clean && yarn install --verbose
RUN yarn build
RUN yarn global add serve
CMD ["yarn","start"]
