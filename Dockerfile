FROM node:10 AS react-build
RUN mkdir app
COPY . /app/
WORKDIR /app
RUN node modules-requirements.js
RUN . ./modules-installs.txt
RUN yarn install
RUN yarn build

FROM nginx:alpine
COPY --from=react-build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]