#!/bin/bash
docker build -t nodejs_standalone .
docker run --rm -p 8080:8080 --name nodejs_app --hostname nodejs_app nodejs_standalone