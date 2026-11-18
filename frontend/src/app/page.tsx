"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { personas, type Persona } from "./personas";
import {
  ajouterParticipant,
  creerSession,
  grouperSessionsParStatut,
  sessions as sessionsInitiales,
} from "./sessions";

const MODULES = ["Fresque de la rue", "Accueil inconditionnel (Carillon)", "Form'Action entreprise", "Formation Qualiopi", "Sensibilisation grand public"];
const PUBLICS = ["Entreprise", "Commerces du Carillon", "Grand public", "Scolaire", "Bénévoles"];

export default function Home() {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [sessions, setSessions] = useState(sessionsInitiales);
  const [creation, setCreation] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [sessionOuverte, setSessionOuverte] = useState<string | null>(null);
  const [erreurParticipant, setErreurParticipant] = useState<string | null>(null);

  if (!persona) {
    return (
      <main className={styles.page}>
        <div className={styles.header}>
          <div className={styles.context}>Module CRM · La Cloche</div>
          <h1>Qui êtes-vous ?</h1>
          <p className={styles.subtitle}>Choisissez votre rôle pour continuer</p>
        </div>
        <div className={styles.body}>
          {personas.map((p) => (
            <button
              key={p.id}
              type="button"
              className={styles.card}
              onClick={() => setPersona(p)}
            >
              <div className={styles.cardTitle}>{p.nom}</div>
              <div className={styles.cardMeta}>{p.roleLabel}</div>
            </button>
          ))}
        </div>
      </main>
    );
  }

  const groupes = grouperSessionsParStatut(sessions);

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div className={styles.context}>Module CRM · {persona.roleLabel}</div>
        <h1>Sessions de formation</h1>
        <p className={styles.subtitle}>{persona.nom}</p>
        <button
          type="button"
          className={styles.switchRole}
          onClick={() => setPersona(null)}
        >
          Changer de rôle
        </button>
      </div>
      <div className={styles.body}>
        {creation ? (
          <form
            className={styles.card}
            onSubmit={(e) => {
              e.preventDefault();
              const donnees = new FormData(e.currentTarget);
              const resultat = creerSession({
                titre: String(donnees.get("titre") ?? ""),
                date: String(donnees.get("date") ?? ""),
                formateurice: String(donnees.get("formateurice") ?? ""),
                module: String(donnees.get("module") ?? ""),
                public: String(donnees.get("public") ?? ""),
              });
              if (!resultat.ok) {
                setErreur(resultat.erreur);
                return;
              }
              setSessions((liste) => [resultat.session, ...liste]);
              setCreation(false);
              setErreur(null);
            }}
          >
            <div className={styles.field}>
              <label htmlFor="titre">Titre de la session</label>
              <input id="titre" name="titre" type="text" placeholder="ex. : Form'Action — Accenture" />
            </div>
            <div className={styles.field}>
              <label htmlFor="module">Module de formation</label>
              <select id="module" name="module" defaultValue={MODULES[0]}>
                {MODULES.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="public">Public ciblé</label>
              <select id="public" name="public" defaultValue={PUBLICS[0]}>
                {PUBLICS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="date">Date de la session</label>
              <input id="date" name="date" type="date" />
            </div>
            <div className={styles.field}>
              <label htmlFor="formateurice">Formatrice / Formateur</label>
              <input id="formateurice" name="formateurice" type="text" placeholder="ex. : Amina Diallo" />
            </div>
            {erreur && <p className={styles.error}>{erreur}</p>}
            <button type="submit" className={styles.btnPrimary}>Créer la session</button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                setCreation(false);
                setErreur(null);
              }}
            >
              Annuler
            </button>
          </form>
        ) : (
          <button type="button" className={styles.btnPrimary} onClick={() => setCreation(true)}>
            + Créer une session
          </button>
        )}
        {groupes.map((groupe) => (
          <section key={groupe.statut}>
            <p className={styles.sectionLabel}>{groupe.titre}</p>
            {groupe.sessions.map((session) => (
              <div key={session.id} className={styles.card}>
                <div className={styles.cardTitle}>{session.titre}</div>
                <div className={styles.cardMeta}>
                  {session.date} · Formateur·ice : {session.formateurice}
                </div>
                <div className={styles.cardRow}>
                  <span className={styles.badge}>{session.module}</span>
                  <span className={styles.badge}>{session.public}</span>
                  {session.resultat && (
                    <span className={styles.badgeGreen}>{session.resultat}</span>
                  )}
                </div>

                <p className={styles.sectionLabel} style={{ marginTop: 12 }}>
                  Participant·es ({session.participants.length})
                </p>
                {session.participants.map((p) => (
                  <div key={p.id} className={styles.cardMeta}>
                    {p.nom}
                    {p.email ? ` · ${p.email}` : ""}
                  </div>
                ))}

                {sessionOuverte === session.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const donnees = new FormData(e.currentTarget);
                      const resultat = ajouterParticipant(session, {
                        nom: String(donnees.get("nom") ?? ""),
                        email: String(donnees.get("email") ?? ""),
                      });
                      if (!resultat.ok) {
                        setErreurParticipant(resultat.erreur);
                        return;
                      }
                      setSessions((liste) =>
                        liste.map((s) => (s.id === session.id ? resultat.session : s)),
                      );
                      setSessionOuverte(null);
                      setErreurParticipant(null);
                    }}
                  >
                    <div className={styles.field}>
                      <label htmlFor={`nom-${session.id}`}>Nom et prénom</label>
                      <input id={`nom-${session.id}`} name="nom" type="text" placeholder="ex. : Julie Martin" />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor={`email-${session.id}`}>Email</label>
                      <input id={`email-${session.id}`} name="email" type="email" placeholder="ex. : julie.martin@exemple.com" />
                    </div>
                    {erreurParticipant && <p className={styles.error}>{erreurParticipant}</p>}
                    <button type="submit" className={styles.btnPrimary}>Ajouter</button>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() => {
                        setSessionOuverte(null);
                        setErreurParticipant(null);
                      }}
                    >
                      Annuler
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => {
                      setSessionOuverte(session.id);
                      setErreurParticipant(null);
                    }}
                  >
                    + Ajouter un·e participant·e
                  </button>
                )}
              </div>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
