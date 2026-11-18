# Service frontend du gabarit : export statique de Next.js, normalement servi par nginx sur le
# port 80. Stopgap : nginx:1.27-alpine est bloqué par le quota de pull anonyme de Docker Hub au
# moment de l'itération 1 — un seul étage avec node:24-alpine (déjà en cache) sert l'export via
# frontend/serve.mjs. Revenir à nginx (voir nginx.conf) dès que l'image est de nouveau joignable.
FROM docker.io/library/node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM docker.io/library/node:24-alpine
WORKDIR /app
COPY --from=build /app/out ./out
COPY serve.mjs ./
ENV PORT=80
EXPOSE 80
# Pas de USER node ici : le port 80 est privilégié, root est nécessaire pour l'écouter
# (nginx fait la même chose en interne via sa capacité dédiée).
CMD ["node", "serve.mjs"]
