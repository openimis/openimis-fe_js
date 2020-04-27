FROM node:10 AS react-build
RUN mkdir app
COPY ./ /app
WORKDIR /app
RUN node openimis-config.js
RUN . ./modules-installs.txt
RUN yarn install --network-timeout 1000000
RUN yarn build
RUN yarn global add serve
CMD ["serve","-s","build"]
