#!/bin/bash
DATE=$(date +%F_%H-%M-%S)
docker exec prod_postgres pg_dumpall -U studysen_user > ./backups/backup-$DATE.sql
find ./backups/*.sql -mtime +7 -delete