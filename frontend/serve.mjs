// Sert l'export statique de Next.js (out/) sans dépendance, le temps que nginx:1.27-alpine
// soit de nouveau joignable (bloqué par le quota de pull anonyme de Docker Hub). À remettre sur
// nginx (voir nginx.conf) dès que l'image peut être tirée : ce serveur n'a pas ses en-têtes de
// sécurité ni son repli SPA.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

const racine = path.join(import.meta.dirname, "out");
const port = Number(process.env.PORT ?? 80);

const typesMime = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

async function lireFichier(chemin) {
  try {
    return await readFile(chemin);
  } catch {
    return null;
  }
}

const serveur = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://frontend");
  let chemin = decodeURIComponent(url.pathname);

  if (chemin === "/health" || chemin === "/sante") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" }).end("ok");
    return;
  }

  if (chemin === "/") chemin = "/index.html";

  const candidats = [chemin, `${chemin}.html`, `${chemin}/index.html`];
  for (const candidat of candidats) {
    const contenu = await lireFichier(path.join(racine, candidat));
    if (contenu) {
      const type = typesMime[path.extname(candidat)] ?? "application/octet-stream";
      res.writeHead(200, { "Content-Type": type }).end(contenu);
      return;
    }
  }

  const page404 = await lireFichier(path.join(racine, "404.html"));
  res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" }).end(page404 ?? "404");
});

serveur.listen(port, () => console.log(`frontend : à l'écoute sur le port ${port}`));

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    serveur.close(() => process.exit(0));
  });
}
