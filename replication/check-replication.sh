#!/bin/bash

# Script to check PostgreSQL replication status

echo "=== PostgreSQL Replication Status ==="
echo ""

# Check master
echo "1. Checking Master (postgres:5432)..."
docker exec postgres psql -U myuser -d mydatabase -c "SELECT pg_is_in_recovery() as is_replica, pg_current_wal_lsn() as current_wal_lsn;" 2>/dev/null || echo "Master not accessible"
echo ""

# Check replica 1
echo "2. Checking Replica 1 (postgres-replica-1:5433)..."
docker exec postgres-replica-1 psql -U myuser -d mydatabase -c "SELECT pg_is_in_recovery() as is_replica, pg_last_wal_receive_lsn() as received_lsn, pg_last_wal_replay_lsn() as replayed_lsn;" 2>/dev/null || echo "Replica 1 not accessible"
echo ""

# Check replica 2
echo "3. Checking Replica 2 (postgres-replica-2:5434)..."
docker exec postgres-replica-2 psql -U myuser -d mydatabase -c "SELECT pg_is_in_recovery() as is_replica, pg_last_wal_receive_lsn() as received_lsn, pg_last_wal_replay_lsn() as replayed_lsn;" 2>/dev/null || echo "Replica 2 not accessible"
echo ""

# Check replication slots on master
echo "4. Replication Slots on Master:"
docker exec postgres psql -U myuser -d mydatabase -c "SELECT slot_name, slot_type, active, pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) as lag FROM pg_replication_slots;" 2>/dev/null || echo "Could not query replication slots"
echo ""

# Check replication connections on master
echo "5. Active Replication Connections on Master:"
docker exec postgres psql -U myuser -d mydatabase -c "SELECT application_name, client_addr, state, sync_state, sync_priority FROM pg_stat_replication;" 2>/dev/null || echo "No replication connections found"
echo ""

echo "=== Done ==="

