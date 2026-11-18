import { describe, expect, it } from "vitest";
import { creerSession, grouperSessionsParStatut, type Session } from "./sessions";

const session = (overrides: Partial<Session>): Session => ({
  id: "x",
  titre: "Session",
  date: "1 janv. 2026",
  formateurice: "Quelqu'un",
  module: "Module",
  public: "Public",
  statut: "a_traiter",
  ...overrides,
});

describe("grouperSessionsParStatut", () => {
  it("range les sessions dans l'ordre à traiter, en cours, terminées", () => {
    const liste = [
      session({ id: "1", statut: "terminee" }),
      session({ id: "2", statut: "a_traiter" }),
      session({ id: "3", statut: "en_cours" }),
    ];

    const groupes = grouperSessionsParStatut(liste);

    expect(groupes.map((g) => g.statut)).toEqual(["a_traiter", "en_cours", "terminee"]);
    expect(groupes[0].sessions.map((s) => s.id)).toEqual(["2"]);
  });

  it("omet les groupes sans session", () => {
    const liste = [session({ id: "1", statut: "en_cours" })];

    const groupes = grouperSessionsParStatut(liste);

    expect(groupes).toHaveLength(1);
    expect(groupes[0].statut).toBe("en_cours");
  });
});

describe("creerSession", () => {
  const entree = {
    titre: "Form'Action — Accenture",
    date: "2026-12-01",
    formateurice: "Amina Diallo",
    module: "Fresque de la rue",
    public: "Entreprise",
  };

  it("refuse un titre vide", () => {
    const resultat = creerSession({ ...entree, titre: "  " });

    expect(resultat.ok).toBe(false);
  });

  it("crée une session au statut à traiter avec un titre valide", () => {
    const resultat = creerSession(entree);

    expect(resultat.ok).toBe(true);
    if (resultat.ok) {
      expect(resultat.session.statut).toBe("a_traiter");
      expect(resultat.session.titre).toBe(entree.titre);
    }
  });
});
