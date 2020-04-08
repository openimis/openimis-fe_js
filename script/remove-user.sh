#!/bin/sh
if [ "$#" -ne 1 ]
then
  echo "Usage: $0 <USER_NAME>" >&2
  exit 1
fi
sed -i "/$1:.*/d" /conf/.htpasswd