#!/bin/sh
if [ "$#" -ne 2 ]
then
  echo "Usage: $0 <USER_NAME> <USER_PASSWORD>" >&2
  exit 1
fi
BASEDIR=$(dirname "$0")
sh ${BASEDIR}/remove-user.sh $1
sh ${BASEDIR}/add-user.sh $1 $2
