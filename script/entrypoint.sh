#!/bin/bash
set -e
rm -f /etc/nginx/conf.d/openIMIS.conf
cp  /script/default.conf /etc/nginx/conf.d/openIMIS.conf
echo "Hosting on https://"$NEW_OPENIMIS_HOST
sed -i 's|NEW_OPENIMIS_HOST|'$NEW_OPENIMIS_HOST'|g' /etc/nginx/conf.d/openIMIS.conf
echo "Pointing to legacy openIMIS on https://"$LEGACY_OPENIMIS_HOST
sed -i  's|LEGACY_OPENIMIS_HOST|'$LEGACY_OPENIMIS_HOST'|g' /etc/nginx/conf.d/openIMIS.conf
exec "$@"