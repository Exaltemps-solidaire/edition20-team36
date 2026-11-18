import { describe, expect, it } from "vitest";
import { grouperSessionsParStatut, type Session } from "./sessions";

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
