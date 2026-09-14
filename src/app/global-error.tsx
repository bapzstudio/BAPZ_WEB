"use client";

/**
 * Dernier filet : une erreur dans le layout du site lui-même, qui lit la base
 * avant d'afficher quoi que ce soit. Ce fichier remplace alors tout le
 * document, sans la feuille de style du site : les couleurs de `globals.css`
 * sont reprises en ligne.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080808",
          color: "#ffffff",
          fontFamily: "Arial, Helvetica, sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <main>
          <p
            style={{ letterSpacing: "0.15em", color: "#9a9a9a", fontSize: 12 }}
          >
            BAPZ STUDIO
          </p>
          <h1
            style={{
              fontSize: 40,
              fontWeight: 900,
              textTransform: "uppercase",
              margin: "16px 0",
            }}
          >
            Un souci technique
          </h1>
          <p style={{ color: "#c8c8c8", maxWidth: 480, lineHeight: 1.4 }}>
            Le site n&apos;a pas pu s&apos;afficher. Réessaie dans un instant.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "12px 28px",
              borderRadius: 999,
              border: 0,
              background: "#d9d9d9",
              color: "#080808",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </main>
      </body>
    </html>
  );
}
