# Assignment #5 - PostgreSQL Replication

This is "Microservices and High-Load" course 5th homework assignment.

The goal is to try different replication strategies and see how they affect the performance of the application.

_No files were provided by the course, everything is done as the assignment._

## Requirements

- [k6](https://grafana.com/docs/k6/latest/set-up/)
- Docker
- Docker Compose

## Structure

- `server` - Node.js Express application that has two endpoints: `GET /users/search` and `GET /users/:id`.
- `load-test.js` - k6 script that runs the load test
- `database-init.sql` - SQL script that creates the database and seed it with 2 000 000 random users with combinations of pre-defined first and last names 
- `grafana` - Grafana dashboard from https://grafana.com/grafana/dashboards/23848-docker-exporter-logporter/
- `prometheus` - Prometheus configuration

## Run

```bash
docker compose up -d
```

## Steps

Below are the steps I took in order to complete the assignment once I had prepared the environment (database, load-test.js, etc.).

I specifically avoid creating an index for the table so that the load will be more noticeable. 
Without an effective index queries that use `LIKE` condition will be pretty expensive because of the sequential table scan.

### Load-testing with just one PostgreSQL instance

Running the load test that will last for 3 minutes:

```bash
k6 run load-test.js
```

Grafana shows that for some time the load went up significantly. 

Disk Read Bytes metric peaked and then dropped back to 0 even though the load was still there. This happens because of database caching:

![grafana-no-replica-load.jpg](/screenshots/grafana-no-replica-load.jpg)

k6 results for comparison later:

![k6-no-replica-load.jpg](/screenshots/k6-no-replica-load.jpg)