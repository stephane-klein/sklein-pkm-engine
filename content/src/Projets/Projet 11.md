---
title: Projet 11 - "Première version d'un moteur web PKM"
aliases:
  - Projet 11 - "Première version d'un moteur web PKM"
nanoid: 4e1aa1yam69r
---
Date de la création de cette note : 2024-07-16.

**Quel est l'objectif de ce projet ?**

À partir des [[POC]] listés ci-dessous, je souhaite implémenter un moteur HTML de rendu de mon [[Personal knowledge management]]. Celui-ci sera propulsé par [[SvelteKit]].

- [`obsidian-vault-to-apache-age-poc`](https://github.com/stephane-klein/obsidian-vault-to-apache-age-poc)
- [`obsidian-vault-to-pg_search`](https://github.com/stephane-klein/obsidian-vault-to-pg_search).
- [`obsidian-vault-to-typesense`](https://github.com/stephane-klein/obsidian-vault-to-typesense).

Voir plus loin "Objectif détaillé".

**Pourquoi je souhaite réaliser ce projet ?**

Le [[2024-04-30_1704|30 avril je disais]] :

> Pour le moment, j'utilise [[Obsidian Quartz]] pour déployer <https://notes.sklein.xyz>.
> 
> Est-ce que j'en suis satisfait ? Pour le moment, la réponse est non, parce que je ne le maitrise pas assez.
> 
> J'ai une grande envie d'implémenter une version personnelle basée sur [[SvelteKit]] et [[Apache Age]], mais j'essaie de ne pas tomber dans ce [[Yak!]].

Via de multiples [[Itération|itérations]], je souhaite transformer https://notes.sklein.xyz et https://sklein.xyz vers un site qui s'inspire de [[gwern.net]], [[Andy's working notes]] et de [[Simon Willison - TIL]].

**Objectif détaillé de ce projet**

Dans un premier temps, j'aimerais implémenter une page https://notes.sklein.xyz qui ressemble, par exemple, à la page https://simonwillison.net/2024/Jan/ de [[Simon Willison]].

C'est-à-dire, une page infinie, qui rassemble mes [[Fleeting Note|Notes éphémères]], avec un système de pagination.

Je souhaite que l'intégralité du contenu de chaque note soit rendue, séparée, par des `<hr />`.

Pour chaque note, je souhaite, comme dans cet exemple, afficher l'heure et des tags de la note :

![[Pasted image 20240719125103.png]]

Je souhaite aussi séparer les notes par des dates.

![[Pasted image 20240719125116.png]]

La date et l'heure des notes sont définies dans le nom de fichier des notes (`YYYY-mm-dd_HHMM.md`).

Je souhaite aussi implémenter les pages suivantes :

- `/{date}/` liste toutes les notes d'une journée ;
- `/{note_filename}/` (sans `.md`) affiche une seule note.

Toutes les notes sont classés à "plat", c'est-à-dire directement à la racine du site `/{note_filename}/` (sans `.md`).

**Roadmap**

- [ ] Implémentation d'un script qui injecte des [[nanoid]] dans le frontmatter de toutes les notes ;
- [ ] Implémentation d'un script qui injecte `type: fleeting_note` dans toutes les notes qui se trouvent dans le dossier `/Notes éphémères/` ;
- [ ] Implémentation d'un script qui injecte `type: evergreen_note` à toutes les notes sans `type` ;
- [ ] `/{note_filename}/` (sans `.md`) affiche une seule [[Fleeting Note]] ;
- [ ] `/{date}/` liste toutes les [[Fleeting Note]] d'une journée ;
- [ ] `/` liste de toutes les [[Fleeting Note]] de la plus récente à la plus ancienne ;
- [ ] Afficher les [[Fleeting Note]] liées aux [[Evergreen Note]] en bas des [[Evergreen Note]] ;
- [ ] Afficher les backlink sur les [[Fleeting Note]] ;
- [ ] Afficher les backlink autre que [[Fleeting Note]] sur les pages [[Evergreen Note]] ;
- [ ] Rendering des `WikiLink` ;
- [ ] Rendering des `#tags` ;
- [ ] Rendering des [Callouts](https://help.obsidian.md/Editing+and+formatting/Callouts) ;
- [ ] Permettre de partager un permalien vers une note, basé sur un [[nanoid]] ;
- [ ] Rendering des code source
- [ ] Sur la page `/` implémenter un moteur de recherche, qui permet :
	- [ ] Recherche plain texte
	- [ ] [[Recherche à facettes]] sur les tags
	- [ ] Sur les types de notes

**Choses que je ne souhaite pas faire**

Je souhaite publier quelque chose au plus tôt. Pour cela, dans la première itération, je ne souhaite pas consacrer trop de temps à la mise en forme. Cette première itération sera minimaliste dans son style.

**Repository de ce projet :**

https://github.com/stephane-klein/sklein-pkm-engine/ (non créé au moment de la rédaction de cette note).

**Ressources :**

- [`obsidian-vault-to-apache-age-poc`](https://github.com/stephane-klein/obsidian-vault-to-apache-age-poc)
- [`obsidian-vault-to-pg_search`](https://github.com/stephane-klein/obsidian-vault-to-pg_search).
- [`obsidian-vault-to-typesense`](https://github.com/stephane-klein/obsidian-vault-to-typesense).
- [[Personal knowledge management]]
- [[gwern.net]]
- [poc-meilisearch-blog-sveltekit](https://github.com/stephane-klein/poc-meilisearch-blog-sveltekit)
