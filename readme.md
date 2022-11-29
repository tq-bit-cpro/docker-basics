<div id="top"></div>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/cpro-iot">
    <img src="https://cpro-karriere.com/image/LOGO/doefwYl1s92eauMm83CoxrkXnOM76tazOd1RDgVzXeyn6h" alt="Logo" width="180" height="80">
  </a>

<h1 align="center">Getting started with Docker & Docker Compose</h1>

  <p align="center">
  This repository is a collection of examples and visualisations for the devops tool Docker & the method of composing several services with Docker Compose.
  </p>
</div>


- [Installing Docker \& Docker Compose](#installing-docker--docker-compose)
  - [Installing Docker Desktop on Windows (Link)](#installing-docker-desktop-on-windows-link)
  - [Installing Docker Engine on Windows + WSL (Link)](#installing-docker-engine-on-windows--wsl-link)
  - [Docker Engine vs. Docker Desktop](#docker-engine-vs-docker-desktop)
- [Brief: What is Docker?](#brief-what-is-docker)
  - [Dockerfiles](#dockerfiles)
    - [Build a basic node application](#build-a-basic-node-application)
    - [Build a frontend in two steps](#build-a-frontend-in-two-steps)
    - [Build a backend in two steps](#build-a-backend-in-two-steps)
  - [Docker Images](#docker-images)
  - [Docker Containers](#docker-containers)
  - [Docker Volumes \& Bind Mounts](#docker-volumes--bind-mounts)
  - [Docker Networks](#docker-networks)
- [Docker Compose](#docker-compose)
  - [Brief: What is docker compose?](#brief-what-is-docker-compose)
  - [Installing docker-compose](#installing-docker-compose)
  - [The docker-compose.yml file](#the-docker-composeyml-file)
  - [An example file to compose a whole technology stack](#an-example-file-to-compose-a-whole-technology-stack)
- [Cheatsheets](#cheatsheets)
  - [Docker](#docker)
  - [Docker-compose](#docker-compose-1)

# Installing Docker & Docker Compose

## Installing Docker Desktop on Windows (Link)

https://docs.docker.com/desktop/install/windows-install/

## Installing Docker Engine on Windows + WSL (Link)

> Docker Engine is not available on Windows per-se - [you'll have to install and enable WSL (Windows Subsystem for Linux) ](https://learn.microsoft.com/en-us/windows/wsl/install) before moving ahead

https://docs.docker.com/engine/install/ubuntu/

## Docker Engine vs. Docker Desktop

Docker Desktop gives useful insights into containers, images, networks and volumes on your local machine. It comes with a catch: Since 2021, Docker Desktop is published under a proprietary license.

> Commercial use of Docker Desktop in larger enterprises (more than 250 employees OR more than $10 million USD in annual revenue) requires a paid subscription. [Source](https://docs.docker.com/desktop/)

If you're just starting out to learn Docker, you should definitely install either Docker Desktop or [Rancher Desktop](https://rancherdesktop.io/). Rancher is a Kubernetes Management tool which builds up on Docker containers.

<p align="right">(<a href="#top">back to top</a>)</p>

# Brief: What is Docker?

- Docker is a tool to create containers of software and manage them.
- When installed, it runs a Docker daemon that's responsible to manage running Docker components, such as networks, containers and volumes.
- Compared to running apps in virtual machines, Docker eliminates the necessity of having a Guest OS overhead.

There are some concepts about docker you should keep in mind

## Dockerfiles

- Dockerfiles include steps to build an application image
- These steps are standardized and run inside a sandboxed environment, independently of the machine's OS
- Dockerfiles can build up on other images by using the `FROM <image>:<tag>` command

Code examples:

### Build a basic node application

```dockerfile
FROM node:latest

WORKDIR /app
COPY package.json .
RUN npm install

CMD [ "npm", "run", "dev" ]
```

### Build a frontend in two steps

Example from https://github.com/cpro-iot/cpro-ui5-ts-template/blob/master/client.prod.dockerfile

```dockerfile
# Build stage
FROM node:14-alpine as build-stage
WORKDIR /client
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

# Prod stage
FROM nginx as production-stage
COPY --from=build-stage /client/dist usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]
```

### Build a backend in two steps

Example from https://github.com/tq-bit/chattergram-redis/blob/master/backend/be.prod.dockerfile

```dockerfile
FROM node:14 as build-stage
WORKDIR /backend
COPY package.json ./
RUN apt-get update || : && apt-get install python -y
RUN npm install
COPY . .
RUN npm run build

FROM node:14 as production-stage
COPY --from=build-stage /backend/dist /backend
COPY --from=build-stage /backend/node_modules /backend/node_modules
EXPOSE 8080
EXPOSE 9090
CMD [ "node", "backend/server.js" ]
```

## Docker Images

- Images are blueprints from which containers can be launched.
- They include steps to replicate a running software product (= container) on any platform where Docker is installed
- Images are build from `Dockerfile`, more on that later
- Images can have names and tags, e.g. `nginx:latest`, `nodejs:16.11.2`, `ubuntu:alpine`

Code examples:

```sh
# Build an image from a dockerfile in current wd
$ sudo docker build --tag hello-world:my-version .

# List all docker images on your local machine
$ sudo docker image ls

# Remove an image from local machine
$ sudo docker image rm hello-world
```

## Docker Containers

- Containers are standardized, isolated software units that yield the same behavior over different machines when managed by the Docker daemon.
- Containers by default are stateless - all persistent memory is freed when a container is destroyed.
- To persist data, docker uses **Docker Volumes and Bind Mounts**
- When started, containers are not accessible by default. They must expose a port or join a network do connect with one another
- To connect containers, docker uses **Docker Networks**

Code examples:

```sh
# Start a container from the image we built above in detached mode
$ docker run --name my-first-app --rm -d hello-world

# List all containers (running and stopped)
$ sudo docker ls --all

# Stop and delete all containers (kill-method)
$ sudo docker stop $(docker container ls -a -q) && docker container rm $(docker container ls -a -q)
```

## Docker Volumes & Bind Mounts

- Docker volumes are partitions of memory managed by Docker.
  - They are used to persist data from containers that does not have to be immediately accessible, e.g. database - or cache data
- Bind mounts connect a path from the local machine to a path inside the container.
  - This method can also be used for data persistence, but comes at risk of unintentional modification.
  - Bind mounts are commonly used for development, e.g. replicating source code changes into containers

Code examples:

```sh
# Launch nginx container with a volume attached that stores SSL certificates using -v or --volume
$ sudo docker run -v my-ssl-volume:/etc/ssl/ nginx:latest

# Do the same thing, but with a bind mount (/home/user/ssl is the absolute path on your local machine)
$ sudo docker run -v /home/user/ssl:/etc/ssh nginx:latest

# Get detailled information about a volume
$ sudo docker volume inspect my-ssl-volume
```

## Docker Networks

- Networks are used to connect containers with one another
  - Each container receives an IP address within the created network
  - Alternatively, you can assign a hostname to a container when starting it
- While a container's IP address can be used, it's good practice to use its hostname instead

```sh
# Create & remove a docker network
$ sudo docker network create my-first-network
$ sudo docker network rm my-first-network

# Start a container on post 8080 with an interactive session with a hostname
docker run --rm -it -p 8080:8080 --name my-first-app --hostname my-first-app hello-world

# Connect a running container to a network
$ sudo docker network connect my-first-network hello-world

# Inspect a container to find out its IP address
$ sudo docker container inspect hello-world | grep -i IPAddress
```

<p align="right">(<a href="#top">back to top</a>)</p>

# Docker Compose

## Brief: What is docker compose?

- A plugin (formerly a binary) to orchestrate container, volume, network and other docker component lifecycles
- It helps managing more complex container setups and can be used to manage and scale clusters of containers

## Installing docker-compose

- As of 2022, docker compose is part of the default docker engine installation process under the package `docker-compose-plugin`
- Read more about the topic here: https://docs.docker.com/compose/reference/

## The docker-compose.yml file

- Instead of asking an admin to write docker commands, docker-compose uses a dedicated `.yml` (or `.yaml`) file
- It includes all services (= application images) to be launched as containers, as well as other docker components, such as networks and volumes
- Docker compose does a few things extra:
  - It creates a default network and connects all containers into it
  - It assigns hostnames to its containers which are equal to its names **within the created network**.

A minimal example docker-compose file can be found under `examples/nodejs_db_compose`

## An example file to compose a whole technology stack

Docker compose files become complex quickly as the stack grows. Appwrite provides a dedicated docker-compose file for development. It can be found on Github

https://github.com/appwrite/appwrite/blob/master/docker-compose.yml

# Cheatsheets

## Docker

![](/docker/cheatsheets/docker.png)

## Docker-compose

![](/docker/cheatsheets/docker-compose.png)