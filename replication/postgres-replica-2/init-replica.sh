#!/bin/bash
set -e

echo "Waiting for master to be ready and replication user to exist..."

until pg_isready -h postgres-master -p 5432 -U myuser; do
  echo "Master is unavailable - sleeping"
  sleep 2
done

# wait a bit more for replication user to be created
sleep 5

if [ ! -f /var/lib/postgresql/data/PG_VERSION ]; then
  echo "Data directory is empty. Setting up replica from master..."
  
  PGPASSWORD=replicator_password pg_basebackup \
      -h postgres-master \
      -D /var/lib/postgresql/data \
      -U replicator \
      -P \
      -v \
      -R \
      -X stream \
      -W
  
  echo "Replica setup complete!"
else
  echo "Data directory already exists, skipping base backup."
fi

