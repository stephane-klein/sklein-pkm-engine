# production instance

## How to deploy prod instance?

How to deploy *sklein-pkm-engine* on <https://notes.sklein.xyz> instance?

Build services:

```sh
$ ./scripts/docker-build-nginx-prod.sh
$ ./scripts/docker-build-webapp-prod.sh
```

Deploy services:

```sh
$ ./scripts/deploy.sh
```

Initialize database and import data:

```
$ ./scripts/open_ssh_tunnel_elasticsearch.sh
$ ../../import-to-es-database.js
$ ./scripts/upload-static-files.sh
$ ./scripts/close_ssh_tunnel_elasticsearch.sh
```

Go to <https://notes.sklein.xyz>.

## How to deploy a single service?

All these actions can be executed at the desired level of granularity. For example, just build and push the webapp.

Let's say you only want to deploy a webapp, execute:

```sh
$ ./scripts/docker-build-webapp-prod.sh
$ ./scripts/docker-push-webapp-prod.sh
$ ./scripts/deploy.sh --no-upload
```
