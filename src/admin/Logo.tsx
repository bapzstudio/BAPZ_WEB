import Image from "next/image";

/**
 * Logo de l'écran de connexion de l'admin, à la place de celui de Payload :
 * le logo du studio posé sur sa planète.
 *
 * Le fichier est blanc sur fond transparent ; `custom.scss` l'inverse quand
 * l'admin est en thème clair, sinon il y serait invisible.
 */
export function Logo() {
  return (
    <Image
      src="/images/marque/bapz-planete.png"
      alt="BAPZ Studio"
      width={512}
      height={512}
      priority
      className="bapz-admin-logo"
      style={{ width: 150, height: 150 }}
    />
  );
}
