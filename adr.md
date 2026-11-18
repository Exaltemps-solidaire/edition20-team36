# Architecture Decision Record (ADR)

Journal des décisions d'architecture prises pendant le hackathon (dépendance nouvelle, stockage, pattern structurant).

Une entrée par décision, ajoutée à la fin, au format :

```
### AAAA-MM-JJ — <titre court>

- **Décision** : ce qui a été choisi
- **Contexte** : le problème à résoudre
- **Alternatives envisagées** : les autres options, et pourquoi elles sont écartées
- **Conséquences** : les compromis acceptés
```

Le fichier est un journal : on ajoute, on ne réécrit pas. Pour revenir sur une décision, une nouvelle entrée le dit explicitement.

---

## Décisions

### 2026-11-18 — Stopgap : le frontend sert son export statique avec Node, pas nginx

- **Décision** : l'étage final du `frontend/Dockerfile` part de `node:24-alpine` (déjà en cache local) et sert `out/` via un petit serveur Node (`frontend/serve.mjs`), au lieu de `nginx:1.27-alpine` comme prévu par le gabarit.
- **Contexte** : à 10 minutes de la fin du temps annoncé pour l'itération 1, `nginx:1.27-alpine` échouait de façon répétée au pull (`toomanyrequests`, quota Docker Hub anonyme de la VM partagée), après que la même cause avait déjà retardé le démarrage de la plateforme (Postgres, registre, S3, Temporal). Publier quelque chose primait sur attendre un déblocage incertain.
- **Alternatives envisagées** : (1) continuer à réessayer le pull de nginx en boucle — rejeté, aucune garantie de délai sous la contrainte des 10 minutes ; (2) attendre sans publier — rejeté par la règle « une itération qui ne publie rien est une itération perdue ».
- **Conséquences** : `frontend/nginx.conf` (en-têtes de sécurité, repli des routes) n'est plus utilisé par le conteneur tant que ce stopgap tient — à revenir sur nginx dès que l'image est de nouveau joignable, reporté en tâche dans `ITERATIONS.md`. Le serveur Node n'a pas les en-têtes de sécurité du template nginx.

### 2026-11-18 — Retour sur nginx : fin du stopgap Node

- **Décision** : `frontend/Dockerfile` revient à un étage final `nginx:1.27-alpine` + `nginx.conf` (en-têtes de sécurité compris) ; `frontend/serve.mjs` est supprimé.
- **Contexte** : un `podman pull docker.io/library/nginx:1.27-alpine` de vérification (sans toucher au déploiement en place) a réussi — le quota de pull anonyme de Docker Hub qui bloquait l'itération 1 n'est plus franchi. Le stopgap du 2026-11-18 n'a donc plus de raison d'être.
- **Alternatives envisagées** : garder le stopgap Node (plus simple, mais sans les en-têtes de sécurité du template nginx, et hors du gabarit du serveur) — écarté dès que le blocage a disparu.
- **Conséquences** : reconstruit, repoussé et redéployé ; `/health` et `/sante` toujours 200, CSP et en-têtes de sécurité confirmés présents sur la réponse.

### 2026-11-18 — Correction de la CSP : `script-src 'self' 'unsafe-inline'`

- **Décision** : ajouter `script-src 'self' 'unsafe-inline'` à la CSP de `frontend/nginx.conf` (elle n'était pas déclarée, donc repliée sur `default-src 'self'`).
- **Contexte** : signalé par le développeur juste après le retour sur nginx — la page s'affichait (200) mais plus aucun bouton ne répondait. Diagnostic : le App Router de Next.js injecte un script inline (`(self.__next_f=self.__next_f||[]).push(...)`) pour hydrater la page depuis le payload RSC, même en export statique ; sans `'unsafe-inline'` sur `script-src`, le navigateur bloque cet inline et React n'hydrate jamais. Root CLAUDE.md avertissait explicitement de ce risque (« elle ne déclare pas de script-src... la page rend blanc sans erreur serveur »).
- **Alternatives envisagées** : CSP par nonce (une valeur différente par réponse) — écartée, incompatible avec un export 100 % statique servi tel quel par nginx (il faudrait une génération de page à la volée) ; revenir au stopgap Node sans CSP du tout — écarté, ça masquerait le bug sans le corriger et on perdrait les autres en-têtes de sécurité.
- **Conséquences** : `script-src 'unsafe-inline'` affaiblit la CSP (un script injecté dans le HTML s'exécuterait) ; risque jugé limité ici (pas de `dangerouslySetInnerHTML`, pas de contenu utilisateur injecté tel quel dans le HTML). Vérifié par la présence du header sur la réponse ; pas de vérification en navigateur réel possible depuis cette VM (Chromium headless absent de dépendances système, pas de droits root pour les installer) — à confirmer par le développeur dans son navigateur.
