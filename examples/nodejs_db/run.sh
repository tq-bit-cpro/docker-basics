#!/bin/bash
docker build -t nodejs_db .

echo "Creating network my-network"
docker network create my-network

echo "Starting Postgres DB"
docker run --rm -d -p 5432:5432 --name postgres --hostname postgres -e POSTGRES_PASSWORD=postgres postgres
docker network connect my-network postgres

echo "Starting Nodejs App"
docker run --rm -d -p 8080:8080 --name nodejs_app --hostname nodejs_app nodejs_db
docker network connect my-network nodejs_app
