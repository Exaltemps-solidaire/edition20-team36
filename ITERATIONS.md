# Itérations — La Cloche, suivi des formations

**Plan validé le 2026-11-18.**

**Source du plan** : proposé par l'agent (aucun plan d'itérations trouvé dans la passation — ni fichier `cadrage/*iteration*`, ni clé `iterations` dans `passation.json`). Le plan de livraison de l'équipe dans `PASSATION.md` donne 4 grandes étapes ; elles sont redécoupées ici en itérations plus petites pour tenir les règles de taille (5 fichiers, 1 écran, 10 min de code).

**Temps restant annoncé** : 90 minutes, au 2026-11-18 (lors de `/planifier-iterations`).
**Durée du tour de test PM Lab** : 10 minutes (valeur par défaut, le développeur ne savait pas).
**Capacité initiale** : une itération coûte au moins 10 min (code) + ~5 min (publication) + 10 min (test) = ~25 min. Sur 90 minutes : 3 itérations complètes tiennent confortablement (75 min), avec ~15 min de marge pour une 4ᵉ itération de stabilisation ou un léger dépassement.

⚠️ **Au début de l'itération 1**, le développeur annonce 60 minutes restantes (au lieu de 90) : la capacité tombe à ~2 itérations complètes (50 min) + une marge de 10 min. L'itération 3 (« Ajout de participant·es ») est donc incertaine en l'état — à réévaluer avec le temps restant réel après l'itération 2, et à signaler aux cadreurs (✂️ possible).

**Hors périmètre (rappel, voir `matiere/arbitrages.md` et le PRD)** :
- Gestion Qualiopi (reste sur IZIFORPRO) — seul le livret récapitulatif est dans le périmètre.
- Suivi des commerces du Carillon au-delà de l'enregistrement de leur présence en session.
- Gestion des formateurs hors flux session.
- Bilans financiers.
- Connexion / comptes / mots de passe (remplacés par l'écran « Qui êtes-vous ? »).
- Questionnaire de satisfaction.

❗️ **Dépendance/pattern à trancher à l'itération 1** : aucun stockage n'a encore été choisi (`adr.md` est vide). Proposition : stockage en mémoire côté API (tableau en module), le plus simple pour tenir des itérations de quelques minutes sans poser de base de données sous 90 minutes. Conséquence assumée : les données ne survivent pas à un redémarrage du conteneur — acceptable pour une démo de hackathon avec des données fictives. À confirmer avec le développeur avant de coder l'itération 1, et à consigner dans `adr.md`.

---

## Itération 1 : L'écran principal est en ligne, avec le choix de rôle et la liste des sessions

- **Dans le périmètre** :
  - Écran « Qui êtes-vous ? » au lancement : liste de personas (coordinatrice de terrain, responsable d'antenne), bouton pour changer de rôle à tout moment.
  - Écran principal : liste des sessions de formation (données en dur ou en mémoire), visible selon le rôle incarné.
  - `.env.example` et `DEPLOIEMENT.md` à la racine, conformes au contrat de déployabilité.
  - Déploiement effectif selon `docs/guidelines-deploiement.md`.
- **Hors périmètre** : création de session, participants, présences, validation, tableau de bord — tout vient dans les itérations suivantes.
- **Critères d'acceptation** :
  - Étant donné l'application démarrée, quand je l'ouvre, alors je vois l'écran « Qui êtes-vous ? » avec au moins les deux rôles du scénario.
  - Étant donné un rôle choisi, quand j'arrive sur l'écran principal, alors je vois une liste de sessions (même fictive) avec date, module, public, statut.
  - Étant donné l'application déployée, quand j'appelle `/health` et `/sante` sur le port 8080, alors je reçois `200`.
- **Hypothèse de l'équipe couverte** : aucune — itération d'amorçage, pas encore de flux de saisie.
- **Codage estimé** : 10 minutes.
- **Fichiers prévus** : `frontend/src/app/page.tsx` (écran rôle + liste), un composant de sélection de rôle, `.env.example`, `DEPLOIEMENT.md`, éventuellement `api/src/routes.ts` si la liste vient de l'API plutôt que du front.
- **Tests unitaires prévus** : 1 à 3, sur la logique de sélection de rôle et/ou le filtrage de la liste par rôle (pas sur le balisage).
- **Étapes ajoutées à la démo** : ouvrir l'app, choisir « coordinatrice de terrain », voir la liste des sessions.
- **Bilan** :
  - Durée de codage réelle : 5 minutes (sous le budget de 10 min).
  - Critères satisfaits : les 3 (écran « Qui êtes-vous ? », liste de sessions par rôle, `/health` et `/sante` en 200 avec corps non vide).
  - ❗️ Dépassement hors codage : le déploiement a pris l'essentiel du temps restant (60 min annoncées en début d'itération), à cause du quota de pull anonyme de Docker Hub sur cette VM partagée — `pgvector/pgvector:pg17` (Postgres), `registry:2`, `chrislusf/seaweedfs` (S3) et `temporalio/auto-setup` ont d'abord échoué au démarrage de la plateforme (corrigé par une deuxième passe de `gitlab-ci-local`, les images déjà tirées restant en cache), puis `nginx:1.27-alpine` a échoué de façon persistante à la construction de l'image frontend.
  - **Décision prise avec le développeur (urgence 10 min restantes)** : remplacer, pour ce service, l'étage final nginx par un petit serveur Node statique (`frontend/serve.mjs`), sur la base `node:24-alpine` déjà en cache — aucune nouvelle image à tirer. Documenté dans `adr.md`. À revenir sur nginx (`nginx.conf` déjà prêt, avec ses en-têtes de sécurité) dès que l'image est de nouveau joignable : ❗️ reporté, à planifier dans une itération dédiée.
  - Stockage : en mémoire pour l'instant, rien n'est encore persistant (conforme à la décision notée en tête de ce fichier).
  - Rien de reporté côté critères d'acceptation.
  - Le harnais n'a rien bloqué : `npm test` passe, aucun secret ni document de passation dans les services déployés.
  - **Modifications** :
    - `frontend/src/app/personas.ts` (nouveau) : les deux personas du scénario (coordinatrice, responsable d'antenne) — sert le critère « écran Qui êtes-vous ? ».
    - `frontend/src/app/sessions.ts` (nouveau) : données de sessions en dur + `grouperSessionsParStatut` (logique testée) — sert le critère « liste de sessions ».
    - `frontend/src/app/sessions.test.ts` (nouveau) : 2 tests unitaires sur le regroupement par statut.
    - `frontend/src/app/page.tsx` (remplacé le boilerplate) : écran de rôle puis liste des sessions, bascule de rôle.
    - `frontend/src/app/page.module.css` (remplacé) : styles repris du prototype (palette, cartes, badges).
    - `.env.example`, `DEPLOIEMENT.md` (nouveaux, racine) : contrat de déployabilité, règles 2 et 8.
    - `api/Dockerfile`, `frontend/Dockerfile` : images de base qualifiées en `docker.io/library/...` (résolution des noms courts).
    - `frontend/nginx.conf` : en-têtes de sécurité ajoutés (CSP adaptée, sans les adresses injoignables du template) — pas encore utilisé tant que le stopgap Node sert le front.
    - `frontend/serve.mjs` (nouveau, stopgap) : sert `out/` et répond `/health`/`/sante`, le temps que `nginx:1.27-alpine` soit de nouveau tirable.
    - `podman-compose.yml` (nouveau, racine) : les deux services, réseau `core-network`, ports 8080/8081.

---

## Itération 2 : La coordinatrice crée une session de formation

- **Dans le périmètre** :
  - Formulaire de création de session : date, formateur, module, public, nombre de participants prévus.
  - La session créée apparaît dans la liste de l'écran principal, avec le statut « Prévue » ou « En cours de remplissage ».
- **Hors périmètre** : ajout des participant·es (itération 3), présences, validation, tableau de bord.
- **Critères d'acceptation** :
  - Étant donné l'écran principal, quand je clique sur « Créer une session » et remplis le formulaire, alors la session apparaît dans la liste avec les champs saisis.
  - Étant donné un champ obligatoire vide, quand je valide, alors la création est refusée avec un message clair.
- **Hypothèse de l'équipe couverte** : aucune directement — pose la base du flux que l'itération 3 testera (émargement/présences).
- **Codage estimé** : 8 minutes.
- **Fichiers prévus** : `frontend/src/app/page.tsx` ou une nouvelle route de formulaire, un composant de formulaire, `api/src/routes.ts` (route de création), stockage en mémoire.
- **Tests unitaires prévus** : 1 à 3, sur la validation du formulaire (champs obligatoires) et/ou la règle d'ajout à la liste.
- **Étapes ajoutées à la démo** : créer une session « Form'Action Sopra Steria », vérifier qu'elle apparaît dans la liste.
- **Bilan** : _à remplir en fin d'itération._

---

## Itération 3 : La coordinatrice ajoute les participant·es à une session

- **Dans le périmètre** :
  - Depuis une session, formulaire d'ajout de participant·e : nom, prénom, mail, téléphone, entreprise.
  - La liste des participant·es d'une session s'affiche sur l'écran de la session.
- **Hors périmètre** : présences, upload de la feuille d'émargement, alerte de discordance, validation.
- **Critères d'acceptation** :
  - Étant donné une session créée, quand j'ajoute un·e participant·e avec ses coordonnées, alors il/elle apparaît dans la liste de la session.
  - Étant donné plusieurs participant·es ajouté·es, quand j'ouvre la session, alors je vois leur nombre et la liste complète.
- **Hypothèse de l'équipe couverte** : prépare le terrain de l'hypothèse d'oubli de présence (testée à l'itération « alerte de discordance », à venir).
- **Codage estimé** : 8 minutes.
- **Fichiers prévus** : composant/écran de détail de session, formulaire d'ajout de participant·e, `api/src/routes.ts` (route d'ajout), stockage en mémoire.
- **Tests unitaires prévus** : 1 à 3, sur la validation des champs participant et/ou le rattachement à la bonne session.
- **Étapes ajoutées à la démo** : ouvrir la session créée, ajouter un·e participant·e, vérifier qu'il/elle apparaît.
- **Bilan** : _à remplir en fin d'itération._

---

## À venir (non détaillé, ordre de priorité de l'équipe)

1. Enregistrement des présences : cocher présent·e/absent·e pour chaque participant·e d'une session.
2. Upload de la feuille d'émargement (fichier joint à la session).
3. Alerte de discordance : si le nombre de présences cochées diffère du nombre sur la feuille uploadée, avertir avant validation — teste l'hypothèse d'oubli du formateur.
4. Validation de la session : passage au statut « Terminée » + envoi (simulé) des supports de formation aux présent·es, livret Qualiopi joint si module Qualiopi.
5. Tableau de bord formations : sessions réalisées, personnes formées, sessions à venir (4 semaines), répartition par module et par public — mis à jour dès qu'une session passe à « Terminée ».
6. Itération de stabilisation finale si le temps restant ne permet plus qu'une seule itération : figer ce qui sera montré au pitch.
