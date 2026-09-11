/**
 * Adresse du profil Instagram à partir du compte saisi dans les réglages
 * (« @bapz.studio »). Une seule façon de la construire pour tout le site :
 * page Contact, Galerie, menu mobile et données structurées.
 */
export const lienInstagram = (compte: string) =>
  `https://www.instagram.com/${compte.trim().replace(/^@/, "")}/`;
