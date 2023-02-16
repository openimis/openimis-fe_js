#!/bin/bash
set -e
rm -f /etc/nginx/conf.d/openIMIS.conf
rm -f /etc/nginx/conf.d/default.conf
cp  /conf/openimis.conf /etc/nginx/conf.d/openIMIS.conf
echo "Hosting on https://""$NEW_OPENIMIS_HOST"
echo "root uri $ROOT_URI"
echo "root api $ROOT_API"
echo "root restapi $ROOT_MOBILEAPI"
envsubst  '${ROOT_URI},${ROOT_API},${NEW_OPENIMIS_HOST},${ROOT_MOBILEAPI}' < /conf/openimis.conf > /etc/nginx/conf.d/openIMIS.conf

if [  ! -f "/etc/letsencrypt/live/${NEW_OPENIMIS_HOST}/fullchain.pem" ]; then
  mkdir -p /etc/letsencrypt/live
  cp -R /etc/nginx/ssl/live/host /etc/letsencrypt/live/${NEW_OPENIMIS_HOST}
fi
exec "$@"