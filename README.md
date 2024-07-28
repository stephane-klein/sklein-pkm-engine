# sklein Personal Knowledge Management engine

More information on this project (in French): https://notes.sklein.xyz/Projets/Projet-11

## Getting started

```sh
$ mise install
$ pnpm install
$ ./inject-nanoid-to-notes.js
$ ./inject-note-type-to-notes.js
$ ./inject-created-at-to-fleeting-notes.js
$ ./scripts/move-binary-files-to-static.sh
$ docker compose build
$ docker compose up -d --wait
$ ./scripts/enter-in-pg.sh -f init.sql
$ ./import.js
```

```
$ pnpm run dev
$ firefox http://localhost:5173
```

## Deployment

See [« How to deploy develop instance? »](./deployment/develop/)
