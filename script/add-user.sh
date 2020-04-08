#!/bin/sh
if [ "$#" -ne 2 ]
then
  echo "Usage: $0 <USER_NAME> <USER_PASSWORD>" >&2
  exit 1
fi
echo -n "$1:" >> /conf/.htpasswd
openssl passwd $2 >> /conf/.htpasswd