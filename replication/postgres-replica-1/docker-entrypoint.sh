#!/bin/bash
set -e

# if data directory is empty then set up replica
if [ ! -f /var/lib/postgresql/data/PG_VERSION ]; then
  echo "Setting up PostgreSQL replica..."
  
  echo "Waiting for master to be ready..."
  
  until pg_isready -h postgres-master -p 5432 -U myuser; do
    echo "Master is unavailable - sleeping"
    sleep 2
  done
  
  echo "Waiting for replication user to be available..."

  RETRIES=30
  until PGPASSWORD=mypassword psql -h postgres-master -p 5432 -U myuser -d mydatabase -c "SELECT 1 FROM pg_roles WHERE rolname='replicator'" | grep -q 1 || [ $RETRIES -eq 0 ]; do
    echo "Waiting for replication user... ($RETRIES retries left)"
    RETRIES=$((RETRIES-1))
    sleep 2
  done
  
  if [ $RETRIES -eq 0 ]; then
    echo "ERROR: Replication user not found after waiting. Master may not be fully initialized."
    exit 1
  fi
  
  echo "Performing base backup from master..."

  PGPASSWORD=replicator_password pg_basebackup \
      -h postgres-master \
      -D /var/lib/postgresql/data \
      -U replicator \
      -P \
      -v \
      -R \
      -X stream \
      -W
  
  echo "Replica setup complete"
fi

# call the original PostgreSQL entrypoint
# if no arguments provided default to 'postgres' command
if [ $# -eq 0 ]; then
  exec /usr/local/bin/docker-entrypoint.sh postgres
else
  exec /usr/local/bin/docker-entrypoint.sh "$@"
fi

