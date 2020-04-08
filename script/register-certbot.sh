#!/bin/sh
(crontab -l 2>/dev/null; echo "19 2 * * * /script/renew-certificate.sh") | crontab -