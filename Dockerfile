FROM node:10 AS react-build
RUN mkdir app
COPY . /app/
WORKDIR /app
RUN node openimis-config.js
RUN . ./modules-installs.txt
RUN yarn install
RUN yarn build
RUN yarn global add serve