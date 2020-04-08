#!/bin/sh
echo "`date` Check certificate" >> /var/log/certbot
certbot renew --post-hook "openresty -s reload"