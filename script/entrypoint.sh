#!/bin/bash
set -e
if [  ! -f "/etc/letsencrypt/live/${NEW_OPENIMIS_HOST}/fullchain.pem" ]; then
  mkdir -p /etc/letsencrypt/live/${NEW_OPENIMIS_HOST}
  echo "copying certificates to  /etc/letsencrypt/live/${NEW_OPENIMIS_HOST}/"
  cp -a /etc/nginx/ssl/live/host/. /etc/letsencrypt/live/${NEW_OPENIMIS_HOST}/
fi
REF=$(date +'%m%d%Y%p')
[ ${FORCE_RELOAD} -eq 1 ] && REDIRECT_TAIL="&${REF}" || REDIRECT_TAIL=''
rm -f /etc/nginx/conf.d/openIMIS.confs
rm -f /etc/nginx/conf.d/default.conf
cp  /conf/openimis.conf /etc/nginx/conf.d/openIMIS.conf
# update the conf
envsubst  '${PUBLIC_URL},${REACT_APP_API_URL},${NEW_OPENIMIS_HOST},${ROOT_MOBILEAPI},${REDIRECT_TAIL},${DATA_UPLOAD_MAX_MEMORY_SIZE},${OPENSEARCH_PROXY_ROOT},${$OPENSEARCH_BASIC_TOKEN}' < /conf/openimis.conf > /etc/nginx/conf.d/openIMIS.conf
# update the loc
for f in $(find /conf/location -regex '.*\.loc'); do envsubst '${PUBLIC_URL},${REACT_APP_API_URL},${NEW_OPENIMIS_HOST},${ROOT_MOBILEAPI},${REDIRECT_TAIL},${DATA_UPLOAD_MAX_MEMORY_SIZE},${OPENSEARCH_PROXY_ROOT},${$OPENSEARCH_BASIC_TOKEN}' < $f > "/etc/nginx/conf.d/location/$(basename $f)"; done

ln -s -f  /usr/share/nginx/html /usr/share/nginx/html/${PUBLIC_URL}
echo "Hosting on https://""$NEW_OPENIMIS_HOST"
echo "root uri $PUBLIC_URL"
echo "root api $REACT_APP_API_URL"
echo "root restapi $ROOT_MOBILEAPI"
echo "OpenSearch proxy base root $OPENSEARCH_PROXY_ROOT"
echo "OpenSearch basic token $OPENSEARCH_BASIC_TOKEN"

exec "$@"
