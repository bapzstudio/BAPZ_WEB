/**
 * Transforme un libellé en fragment d'adresse : « Heels Mardi 19:00 » ->
 * « heels-mardi-19-00 ».
 */
export function slugify(source: string): string {
  return (
    source
      .toString()
      .normalize("NFD")
      // `normalize("NFD")` sépare la lettre de son accent ; on retire ici les
      // signes diacritiques combinants, sinon le filtre suivant les
      // remplacerait par un tiret (« Léna » -> « l-na »).
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}
