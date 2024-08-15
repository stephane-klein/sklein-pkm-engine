# Deployment playground

I use this playground to test the version of the application packaged as in production, in a Docker container.

```
$ docker compose build
$ sudo mkdir -p volumes/elasticsearch/; sudo chmod ugo+rwX volumes/elasticsearch/
$ docker compose up -d --wait
$ direnv allow
$ ../import.js
```

Go to http://localhost/

