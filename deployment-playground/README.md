# Deployment playground

I use this playground to test the version of the application packaged as in production, in a Docker container.

```
$ docker compose build
$ docker compose up -d --wait
$ direnv allow
$ ./scripts/enter-in-pg.sh -f ../init.sql
$ ../import.js
```

Go to http://localhost/

