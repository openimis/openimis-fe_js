#!/bin/sh
certbot certonly --webroot -w /var/www/html -d $NEW_OPENIMIS_HOST
sed -i  's/\/etc\/ssl\/certs\/localhost\.crt/\/etc\/letsencrypt\/live\/'$NEW_OPENIMIS_HOST'\/fullchain\.pem/g' /etc/nginx/conf.d/default.conf
sed -i  's/\/etc\/ssl\/private\/localhost\.key/\/etc\/letsencrypt\/live\/'$NEW_OPENIMIS_HOST'\/privkey\.pem/g' /etc/nginx/conf.d/default.conf
openresty -s reload