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