#!/bin/bash
docker stop nodejs_app
docker stop postgres
docker network rm my-network