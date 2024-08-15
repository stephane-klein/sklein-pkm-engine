# Develop instance

## How to deploy develop instance?

How to deploy *sklein-pkm-engine* on <https://notes.develop.sklein.xyz> instance?

Build services:

```sh
$ ./scripts/docker-build-nginx-develop.sh
$ ./scripts/docker-build-webapp-develop.sh
```

Deploy services:

```sh
$ ./scripts/deploy.sh
```

Initialize database and import data:

```
$ ./scripts/open_ssh_tunnel_elasticsearch.sh
$ ../../import.js
$ ./scripts/upload-static-files.sh
$ ./scripts/close_ssh_tunnel_elasticsearch.sh
```

Go to <https://notes.develop.sklein.xyz>.

## How to deploy a single service?

All these actions can be executed at the desired level of granularity. For example, just build and push the webapp.

Let's say you only want to deploy a webapp, execute:

```sh
$ ./scripts/docker-build-webapp-develop.sh
$ ./scripts/docker-push-webapp-develop.sh
$ ./scripts/deploy.sh --no-upload
```
