export type Role = "coordinatrice" | "responsable_antenne";

export type Persona = {
  id: string;
  nom: string;
  role: Role;
  roleLabel: string;
};

export const personas: Persona[] = [
  {
    id: "amina",
    nom: "Amina Diallo",
    role: "coordinatrice",
    roleLabel: "Coordinatrice de terrain",
  },
  {
    id: "delphine",
    nom: "Delphine Roussel",
    role: "responsable_antenne",
    roleLabel: "Responsable d'antenne",
  },
];
