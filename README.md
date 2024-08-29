# sklein Personal Knowledge Management engine

More information on this project (in French): https://notes.sklein.xyz/Projets/Projet-11

## Getting started

```sh
$ mise install
$ pnpm install
$ ./inject-nanoid-to-notes.js
$ ./inject-note-type-to-notes.js
$ ./inject-created-at-to-journal-notes.js
$ ./scripts/move-binary-files-to-static.sh
$ sudo mkdir -p volumes/elasticsearch/; sudo chmod ugo+rwX volumes/elasticsearch/
$ docker compose up -d --wait
$ ./import.js
```

```
$ pnpm run dev
$ firefox http://localhost:5173
```

Screencast:<br />

<img src="screencast.gif" />

## Deployment

See [« How to deploy develop instance? »](./deployment/develop/)
