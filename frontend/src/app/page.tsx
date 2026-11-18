"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { personas, type Persona } from "./personas";
import { grouperSessionsParStatut, sessions } from "./sessions";

export default function Home() {
  const [persona, setPersona] = useState<Persona | null>(null);

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
              </div>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
