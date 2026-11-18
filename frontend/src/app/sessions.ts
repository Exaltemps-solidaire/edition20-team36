export type StatutSession = "a_traiter" | "en_cours" | "terminee";

export type Session = {
  id: string;
  titre: string;
  date: string;
  formateurice: string;
  module: string;
  public: string;
  statut: StatutSession;
  resultat?: string;
};

// Données fictives, le temps que l'itération 2 pose la création réelle de session.
export const sessions: Session[] = [
  {
    id: "sopra",
    titre: "Form'Action Entreprise — Sopra Steria",
    date: "18 nov. 2026",
    formateurice: "Amina Diallo",
    module: "Fresque de la rue",
    public: "Entreprise",
    statut: "a_traiter",
  },
  {
    id: "voltaire",
    titre: "Fresque de la rue — École Voltaire",
    date: "14 nov. 2026",
    formateurice: "Lucie Martel",
    module: "Fresque de la rue",
    public: "Grand public / Scolaire",
    statut: "en_cours",
  },
  {
    id: "carillon-11",
    titre: "Accueil inconditionnel — Carillon Paris 11e",
    date: "5 nov. 2026",
    formateurice: "Amina Diallo",
    module: "Accueil inconditionnel",
    public: "Commerces",
    statut: "terminee",
    resultat: "12 personnes formées",
  },
  {
    id: "mairie-10",
    titre: "Fresque de la rue — Mairie du 10e",
    date: "28 oct. 2026",
    formateurice: "Lucie Martel",
    module: "Fresque de la rue",
    public: "Grand public",
    statut: "terminee",
    resultat: "24 personnes sensibilisées",
  },
];

const GROUPES: { statut: StatutSession; titre: string }[] = [
  { statut: "a_traiter", titre: "À traiter" },
  { statut: "en_cours", titre: "En cours de remplissage" },
  { statut: "terminee", titre: "Terminées" },
];

export type GroupeSessions = { statut: StatutSession; titre: string; sessions: Session[] };

export function grouperSessionsParStatut(liste: Session[]): GroupeSessions[] {
  return GROUPES.map((groupe) => ({
    ...groupe,
    sessions: liste.filter((session) => session.statut === groupe.statut),
  })).filter((groupe) => groupe.sessions.length > 0);
}

export type NouvelleSessionInput = {
  titre: string;
  date: string;
  formateurice: string;
  module: string;
  public: string;
};

export type ResultatCreationSession =
  | { ok: true; session: Session }
  | { ok: false; erreur: string };

// Stockage en mémoire, côté front, le temps de l'itération : voir adr.md.
export function creerSession(input: NouvelleSessionInput): ResultatCreationSession {
  if (!input.titre.trim()) {
    return { ok: false, erreur: "Le titre de la session est obligatoire." };
  }
  return {
    ok: true,
    session: {
      id: crypto.randomUUID(),
      titre: input.titre.trim(),
      date: input.date,
      formateurice: input.formateurice,
      module: input.module,
      public: input.public,
      statut: "a_traiter",
    },
  };
}
