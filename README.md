# Assignment #5 - PostgreSQL Replication

This is "Microservices and High-Load" course 5th homework assignment.

The goal is to try different replication strategies and see how they affect the performance of the application.

_No files were provided by the course, everything is done as the assignment._

## Requirements

- [k6](https://grafana.com/docs/k6/latest/set-up/)
- Docker
- Docker Compose

## Structure

The project is organized into two separate setups for comparison:

### `single-instance/` - Single PostgreSQL Instance (No Replication)

- `server/` - Node.js Express application that has two endpoints: `GET /users/search` and `GET /users/:id`
- `load-test.js` - k6 script that runs the load test
- `database-init.sql` - SQL script that creates the database and seed it with 2 000 000 random users with combinations of pre-defined first and last names
- `grafana/` - Grafana dashboard from https://grafana.com/grafana/dashboards/23848-docker-exporter-logporter/
- `prometheus/` - Prometheus configuration
- `docker-compose.yaml` - Docker Compose configuration with one PostgreSQL instance

### `replication/` - PostgreSQL Master with 2 Replicas

- `server/` - Node.js Express application (same as single-instance)
- `load-test.js` - k6 script that runs the load test
- `database-init.sql` - SQL script that creates the database and seed it with 2 000 000 random users
- `grafana/` - Grafana dashboard configuration
- `prometheus/` - Prometheus configuration
- `docker-compose.yaml` - Docker Compose configuration with 1 master and 2 replicas of PostgreSQL
- `postgres-master/` - Master PostgreSQL configuration files
- `postgres-replica-1/` - Replica 1 configuration
- `postgres-replica-2/` - Replica 2 configuration
- `check-replication.sh` - Script to verify replication status
- `QUICKSTART.md` - Quick start guide for replication setup
- `REPLICATION_SETUP.md` - Detailed replication setup documentation

## Run

### Single Instance Setup

```bash
cd single-instance
docker compose up -d
```

### Replication Setup

```bash
cd replication
docker compose up -d
```

## Steps

Below are the steps I took in order to complete the assignment once I had prepared the environment (database, load-test.js, etc.).

I specifically avoid creating an index for the table so that the load will be more noticeable.
Without an effective index queries that use `LIKE` condition will be pretty expensive because of the sequential table scan.

### Load-testing READ with one PostgreSQL instance

Running the load test that will last for 3 minutes:

```bash
cd single-instance
k6 run load-test.js
```

Grafana shows that for some time the load went up significantly.

Disk Read Bytes metric peaked and then dropped back to 0 even though the load was still there. This happens because of database caching:

![grafana-no-replica-load.jpg](/screenshots/grafana-no-replica-load.jpg)

Load testing results:

![k6-no-replica-load.jpg](/screenshots/k6-no-replica-load.jpg)

### Load-testing READ with two replicas and one master PostgreSQL node

For this to work `server.js` code was updated to use pool of connections to the replicas. Then in the code it's specified which handlers are read-only and which are write-only.
read-only handlers will use the connection from the pool of replica connections and write-only handlers will use the connection to the master.

Running the load test that will last for 3 minutes:

```bash
cd replication
k6 run load-test.js
```

During and after the load test Grafana shows that both replicas were working at the price of more disk space, RAM and CPU usage.

![grafana-no-replica-load.jpg](/screenshots/grafana-2-replicas-load.jpg)

Load testing results:

![k6-2-replicas-load.jpg](/screenshots/k6-2-replicas-load.jpg)

It appears that having two replicas the setup was able to handle the load better than having just one instance.
- less avg request duration
- three times more requests per second
