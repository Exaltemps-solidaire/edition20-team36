# Déploiement

La référence est le `/CLAUDE.md` à la racine du serveur (voir
[docs/guidelines-deploiement.md](docs/guidelines-deploiement.md)) : ce fichier
résume sa recette pour ce dépôt, il ne la remplace pas. En cas d'écart, le
`/CLAUDE.md` du serveur l'emporte.

## Structure

Deux services, chacun avec son `Dockerfile` :

- `api/` : Node, écoute sur `8081`, routes `/health` et `/sante`.
- `frontend/` : Next.js en export statique, servi par nginx sur `80` (conteneur),
  publié sur `8080` côté VM. Routes `/health` et `/sante` en fichiers statiques.

Le front appelle l'API en chemin relatif (`/api/v1/...`), jamais par une URL
absolue : les deux sont servis depuis la même origine.

## Construire, publier, lancer

```bash
podman build -t localhost:5000/team36/api:dev api/
podman build -t localhost:5000/team36/frontend:dev frontend/
podman push localhost:5000/team36/api:dev
podman push localhost:5000/team36/frontend:dev
APP=team36 podman compose -f /srv/team36/app/podman-compose.yml \
  -p team36 up -d --force-recreate
```

## Vérifier

Depuis la machine uniquement (`$URL_PUBLIQUE` n'est pas joignable d'ici) :

```bash
curl -s localhost:8080/ && curl -s localhost:8081/health
```

Depuis le navigateur du visiteur, après déploiement : `$URL_PUBLIQUE/health` et
`$URL_PUBLIQUE/sante` doivent répondre `200` avec un corps non vide (une page
de réveil répond aussi `200`, elle ne prouve rien).

## Variables d'environnement

Voir [.env.example](.env.example) à la racine : toutes les variables lues par
l'application y sont listées, avec une valeur factice.
