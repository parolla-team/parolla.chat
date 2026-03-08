# Parolla.chat

Ce repo contient la landing page pour le Projet d'assistant IA pour la langue Corse Parolla (https://parolla.chat).

## 📂 Structure du projet

```
/
├── public/
│   └── images/ -> les images pour le blog
├── src/
│   ├── content/ -> le contenue pour le blog
│   ├── assets/  -> toutes les images
│   ├── components/
│   │   └── Card.astro
│   ├── layouts/
│   │   └── Layout.astro
│   ├── i18n/
│   │   └── ui.ts -> Contient le text et sa traduction en corse
│   └── pages/
│       ├── blog/
│       ├── co/
│       ├── fr/
│       └── index.astro
└── package.json
```

## 🚀 Déploiment

Nous avons un déploiment automatique quand la branch main reçoit un push.

### Annotation communautaire

Pour activer la page d'annotation (`/annotate`) avec persistance SQLite :

```bash
pnpm run serve   # build + lance le serveur Node
# ou
pnpm run build && node server/index.js
```

Le serveur sert le site statique + les routes `/api/pairs`, `/api/annotate`.

Variables d'environnement :
- `PORT` : port (défaut 4321)
- `ANNOTATIONS_DB` : chemin SQLite (défaut `./data/annotations.db`)
- `ANNOTATIONS_ADMIN_KEY` : clé pour bloquer des utilisateurs et exporter les annotations 

## 📒 Blog

Ajouter un nouveau fichier MDX dans le dossier suivant et suivre la structure de l'article existant:
- https://github.com/parolla-team/parolla.chat/tree/main/src/content/blog



## 🧞 Commandes

All commands are run from the root of the project, from a terminal:

| Command                | Action                                             |
| :--------------------- | :------------------------------------------------- |
| `npm install`          | Installs dependencies                              |
| `npm run dev`          | Starts local dev server at `localhost:3000`        |
| `npm run build`        | Build your production site to `./dist/`            |
| `npm run preview`      | Preview your build locally, before deploying       |
| `npm run astro ...`    | Run CLI commands like `astro add`, `astro preview` |
| `npm run astro --help` | Get help using the Astro CLI                       |

## Credit
_A page template built with astro and tailwindcss using tailus blocks ([theme](https://github.com/Tailus-UI/astro-theme))._
