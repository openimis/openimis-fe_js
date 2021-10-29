FROM node:16 AS react-build
RUN mkdir app
COPY ./ /app
WORKDIR /app
ARG OPENIMIS_CONF_JSON
ENV OPENIMIS_CONF_JSON=${OPENIMIS_CONF_JSON}
RUN node openimis-config.js
#RUN . ./modules-adds.txt
#RUN . ./modules-installs.txt
RUN yarn install
RUN yarn build
RUN yarn global add serve
CMD ["yarn","start"]
